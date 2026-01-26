export const SUBSCRIPTION_CONFIG = {
    prices: {
        sa: {
            amount: 100,
            currency: 'ZAR',
            period: 'month',
            name: 'South Africa Standard',
        },
        international: {
            amount: 10,
            currency: 'USD',
            period: 'month',
            name: 'International',
        },
    },
    trial: {
        days: 30,
    },
} as const
