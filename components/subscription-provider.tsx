'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getSubscriptionStatusAction } from '@/app/actions'
import { type SubscriptionStatus, type SubscriptionPlan } from '@/lib/definitions'

interface SubscriptionContextType {
    status: SubscriptionStatus | 'none'
    plan: SubscriptionPlan | null
    daysRemaining: number
    isLocked: boolean
    isLoading: boolean
    refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType>({
    status: 'none',
    plan: null,
    daysRemaining: 0,
    isLocked: false,
    isLoading: true,
    refreshSubscription: async () => { },
})

export const useSubscription = () => useContext(SubscriptionContext)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<{
        status: SubscriptionStatus | 'none'
        plan: SubscriptionPlan | null
        daysRemaining: number
        isLocked: boolean
    }>({
        status: 'none',
        plan: null,
        daysRemaining: 0,
        isLocked: false,
    })
    const [isLoading, setIsLoading] = useState(true)

    const refreshSubscription = async () => {
        try {
            const data = await getSubscriptionStatusAction()
            if (data) {
                setState({
                    status: data.status,
                    plan: data.plan || null,
                    daysRemaining: data.daysRemaining,
                    isLocked: data.isLocked,
                })
            }
        } catch (error) {
            console.error('Failed to fetch subscription status:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        refreshSubscription()
    }, [])

    return (
        <SubscriptionContext.Provider value={{ ...state, isLoading, refreshSubscription }}>
            {children}
        </SubscriptionContext.Provider>
    )
}
