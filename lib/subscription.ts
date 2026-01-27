import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { type Subscription, type SubscriptionStatus, type SubscriptionPlan } from '@/lib/definitions'

export const TRIAL_DAYS = 30

export const getSubscription = cache(async () => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return subscription as Subscription | null
})

export async function getSubscriptionStatus() {
    const sub = await getSubscription()

    if (!sub) {
        // Fallback for new users who haven't had their trial created yet
        return {
            status: 'none',
            plan: 'none',
            daysRemaining: 0,
            isLocked: true, // It's safer to stay locked until the trial action confirms
            subscription: null
        } as const
    }

    const now = new Date()
    const endDate = new Date(sub.current_period_end)
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    // Logic for lock-down
    const isExpiredByDate = now > endDate
    // Trial or active subs are only locked if explicitly 'expired' or if the date has passed
    const isLocked = sub.status === 'expired' ||
        (sub.status !== 'active' && sub.status !== 'trial' && isExpiredByDate)

    return {
        status: sub.status,
        plan: sub.plan,
        daysRemaining,
        isLocked,
        subscription: sub
    }
}

export async function createTrialSubscription(userId: string) {
    const supabase = await createClient()

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + TRIAL_DAYS)

    const { error } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            status: 'trial',
            plan: 'free_trial',
            current_period_start: startDate.toISOString(),
            current_period_end: endDate.toISOString(),
        })

    if (error) {
        console.error('Error creating trial subscription:', error)
        throw error
    }
}
