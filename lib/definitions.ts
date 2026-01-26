export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'expired'
export type SubscriptionPlan = 'free_trial' | 'sa_monthly' | 'intl_monthly'

export interface Subscription {
    id: string
    user_id: string
    status: SubscriptionStatus
    plan: SubscriptionPlan
    current_period_end: string
    cancel_at_period_end: boolean
}
