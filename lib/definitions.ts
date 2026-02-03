export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'expired'
export type SubscriptionPlan = 'free_trial' | 'monthly' | 'yearly' | 'sa_monthly' | 'intl_monthly'

export interface Subscription {
    user_id: string
    status: SubscriptionStatus
    plan: SubscriptionPlan
    current_period_start: string
    current_period_end: string
    created_at: string
    updated_at: string
}
