'use client'

import Link from 'next/link'
import { AlertCircle, Lock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/components/subscription-provider'

export function SubscriptionStatusAlert() {
    const { status, daysRemaining, isLocked, isLoading } = useSubscription()

    if (isLoading) return null

    // Don't show anything if active and well
    if (status === 'active') return null

    // Show Trial Warning
    if (status === 'trial') {
        if (daysRemaining > 5) return null // Don't annoy them early in trial

        return (
            <Alert className="mb-4 bg-yellow-50/50 border-yellow-200 text-yellow-900">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Trial Ending Soon</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                    <span>You have {daysRemaining} days left in your free trial.</span>
                    <Button variant="outline" size="sm" className="h-7 bg-white/50 hover:bg-white border-yellow-300 ml-4" asChild>
                        <Link href="/settings/billing">Upgrade Now</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }

    // Show Lock Warning
    if (isLocked) {
        return (
            <Alert variant="destructive" className="mb-4">
                <Lock className="h-4 w-4" />
                <AlertTitle>Account Restricted</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                    <span>Your subscription has expired. You are in Read-Only mode.</span>
                    <Button variant="outline" size="sm" className="h-7 bg-white/10 hover:bg-white/20 border-white/20 ml-4" asChild>
                        <Link href="/settings/billing">Restore Access</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }

    return null
}
