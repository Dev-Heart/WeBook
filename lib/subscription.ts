import { createClient } from '@/lib/supabase/server'
import { type Subscription, type SubscriptionStatus, type SubscriptionPlan } from '@/lib/definitions'

export const TRIAL_DAYS = 30

export async function getSubscription() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return subscription as Subscription | null
}

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
    // Active and trial subscriptions are NEVER locked, regardless of date
    // Only lock if explicitly 'expired' or if it's neither active/trial AND the date has passed
    const isExpiredByDate = now > endDate
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

import { createAdminClient } from '@/lib/supabase/admin'

export const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || ['dev.divineheart@gmail.com', 'admin@webook.com', 'chineacheremh@gmail.com']

export function checkIsAdmin(email?: string | null) {
    if (!email) return false
    return ADMIN_EMAILS.includes(email)
}

export async function createTrialSubscription(userId: string) {
    const supabase = createAdminClient()

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + TRIAL_DAYS)

    const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: userId,
            status: 'trial',
            plan: 'free_trial',
            current_period_start: startDate.toISOString(),
            current_period_end: endDate.toISOString(),
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })
        .select()
        .single()

    if (error) {
        console.error('Error in createTrialSubscription:', error)
        throw error
    }

    return data
}

export async function updateSubscription(userId: string, updates: Partial<Subscription>) {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('subscriptions')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}
// ... (existing updateSubscription)

export async function ensureSubscriptionActive() {
    const { isLocked } = await getSubscriptionStatus()
    if (isLocked) {
        throw new Error("Subscription expired. Please upgrade to continue.")
    }
}
