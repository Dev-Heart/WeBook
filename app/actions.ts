'use server'

import { createClient } from '@/lib/supabase/server'
import { createTrialSubscription, getSubscription, TRIAL_DAYS } from '@/lib/subscription'
import { revalidatePath } from 'next/cache'

export async function startTrialAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'User not authenticated' }
    }

    try {
        const existing = await getSubscription()
        if (existing) {
            return { success: true, message: 'Subscription already exists' }
        }

        await createTrialSubscription(user.id)
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Failed to start trial:', error)
        return { success: false, error: 'Failed to create trial subscription' }
    }
}

export async function completeOnboardingAction(payload: {
    profile: {
        name: string;
        type: string;
        city: string;
        country: string;
        currency: string;
        phone?: string;
    },
    services: {
        name: string;
        price: number;
        duration: number;
        category?: string;
    }[],
    preferences: {
        taxMode: 'inclusive' | 'exclusive';
        whatsappNotifications: boolean;
        bookingConfirmationRequired: boolean;
        softReminders: boolean;
    }
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'User not authenticated' }
    }

    try {
        // 1. Create Business Profile
        const { error: profileError } = await supabase
            .from('business_profiles')
            .upsert({
                user_id: user.id,
                business_name: payload.profile.name,
                business_type: payload.profile.type,
                location_name: payload.profile.city,
                location_address: payload.profile.country,
                currency_display: payload.profile.currency,
                contact_phone: payload.profile.phone || '',
                tax_mode: payload.preferences.taxMode,
                whatsapp_notifications: payload.preferences.whatsappNotifications,
                booking_confirmation_required: payload.preferences.bookingConfirmationRequired,
                soft_reminders: payload.preferences.softReminders,
                onboarding_completed: true,
            })

        if (profileError) throw profileError

        // 2. Create Services
        if (payload.services.length > 0) {
            const { error: servicesError } = await supabase
                .from('services')
                .insert(payload.services.map(s => ({
                    user_id: user.id,
                    name: s.name,
                    price: s.price,
                    duration: s.duration,
                    category: s.category || 'General',
                    active: true,
                })))

            if (servicesError) throw servicesError
        }

        // 3. Initialize default availability settings
        const { error: availError } = await supabase
            .from('availability_settings')
            .upsert({
                user_id: user.id,
                monday: { enabled: true, start: '09:00', end: '17:00' },
                tuesday: { enabled: true, start: '09:00', end: '17:00' },
                wednesday: { enabled: true, start: '09:00', end: '17:00' },
                thursday: { enabled: true, start: '09:00', end: '17:00' },
                friday: { enabled: true, start: '09:00', end: '17:00' },
                saturday: { enabled: false, start: '09:00', end: '17:00' },
                sunday: { enabled: false, start: '09:00', end: '17:00' },
                slot_duration: 30,
                buffer_time: 0,
                advance_booking_days: 30,
            })

        if (availError) throw availError

        // 4. Start Trial
        await startTrialAction()

        revalidatePath('/')
        return { success: true }

    } catch (error) {
        console.error('Onboarding failed:', error)
        return { success: false, error: 'Failed to complete onboarding' }
    }
}

export async function checkBookingAvailability(userId: string) {
    const supabase = await createClient()

    // Call the secure RPC function
    const { data, error } = await supabase.rpc('is_subscription_active', {
        target_user_id: userId
    })

    if (error) {
        console.error('Error checking subscription status:', error)
        // Fail safe: if RPC is missing (dev mode), maybe allow? 
        // But requirement says "Lock". So we return false.
        // However, if the user hasn't run the migration yet, everything breaks.
        // Let's return false to be safe and strictly adhere to "Lock features".
        return false
    }

    return !!data
}

import { notificationService } from '@/lib/notifications/service'

export async function createBooking(payload: {
    userId: string
    serviceId: string
    serviceName: string
    clientName: string
    clientPhone: string
    clientEmail: string | null
    date: string
    time: string
    notes: string | null
    price?: number
}) {
    const supabase = await createClient()

    try {
        // 1. Create booking
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                user_id: payload.userId,
                service_id: payload.serviceId,
                service_name: payload.serviceName,
                client_name: payload.clientName,
                client_phone: payload.clientPhone,
                client_email: payload.clientEmail,
                date: payload.date,
                time: payload.time,
                booking_date: payload.date, // Legacy support
                booking_time: payload.time, // Legacy support
                notes: payload.notes,
                status: 'scheduled',
            })
            .select()
            .single()

        if (bookingError) throw bookingError

        // 2. Create or update client
        const { data: existingClient } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', payload.userId)
            .eq('phone', payload.clientPhone)
            .single()

        if (existingClient) {
            await supabase
                .from('clients')
                .update({
                    visits: existingClient.visits + 1,
                    last_visit: payload.date,
                })
                .eq('id', existingClient.id)
        } else {
            await supabase
                .from('clients')
                .insert({
                    user_id: payload.userId,
                    name: payload.clientName,
                    phone: payload.clientPhone,
                    email: payload.clientEmail,
                    visits: 1,
                    total_spent: 0,
                    vip: false,
                })
        }

        // 3. Send Notification (Async, don't block response)
        // We get the business name first for the notification
        const { data: profile } = await supabase
            .from('business_profiles')
            .select('business_name')
            .eq('user_id', payload.userId)
            .single()

        const businessName = profile?.business_name || 'Business'

        await notificationService.sendNotification({
            userId: payload.userId,
            bookingId: booking.id,
            recipient: payload.clientPhone,
            type: 'confirmation',
            customerName: payload.clientName,
            businessName: businessName,
            serviceName: payload.serviceName,
            date: payload.date,
            time: payload.time
        })

        return { success: true }
    } catch (error) {
        console.error('Create booking failed:', error)
        return { success: false, error: 'Failed to create booking' }
    }
}

export async function cancelBookingAction(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // 1. Get booking details for notification (and verify ownership)
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                *,
                business_profiles(business_name)
            `)
            .eq('id', bookingId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !booking) {
            return { success: false, error: 'Booking not found' }
        }

        // 2. Update status
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId)

        if (updateError) throw updateError

        // 3. Send Notification
        // We handle business_profiles relation or fallback
        // @ts-ignore
        const businessName = booking.business_profiles?.business_name || 'Business'

        await notificationService.sendNotification({
            userId: user.id,
            bookingId: booking.id,
            recipient: booking.client_phone,
            type: 'cancellation',
            customerName: booking.client_name,
            businessName: businessName,
            serviceName: booking.service_name,
            date: booking.date,
            time: booking.time
        })

        revalidatePath('/bookings')
        return { success: true }
    } catch (error) {
        console.error('Cancel booking failed:', error)
        return { success: false, error: 'Failed to cancel booking' }
    }
}

export async function sendReminderAction(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                *,
                business_profiles(business_name)
            `)
            .eq('id', bookingId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !booking) {
            return { success: false, error: 'Booking not found' }
        }

        // @ts-ignore
        const businessName = booking.business_profiles?.business_name || 'Business'

        await notificationService.sendNotification({
            userId: user.id,
            bookingId: booking.id,
            recipient: booking.client_phone,
            type: 'reminder',
            customerName: booking.client_name,
            businessName: businessName,
            serviceName: booking.service_name,
            date: booking.date,
            time: booking.time
        })

        return { success: true }
    } catch (error) {
        console.error('Send reminder failed:', error)
        return { success: false, error: 'Failed to send reminder' }
    }
}

export async function getSubscriptionStatusAction() {
    const sub = await getSubscription()

    if (!sub) return { status: 'none', daysRemaining: 0, isLocked: true }

    const now = new Date()
    const endDate = new Date(sub.current_period_end)
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    const isExpiredByDate = now > endDate
    const isLocked = sub.status === 'expired' || (sub.status !== 'active' && sub.status !== 'trial' && isExpiredByDate)

    return {
        status: sub.status,
        plan: sub.plan,
        daysRemaining,
        isLocked,
        subscription: sub
    }
}


