'use client'

import { Check, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSubscription } from '@/components/subscription-provider'
import { SUBSCRIPTION_CONFIG } from '@/lib/config'

export default function BillingPage() {
    const { status, plan, daysRemaining, isLoading } = useSubscription()

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading subscription details...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
                <p className="text-muted-foreground">
                    Manage your subscription and billing information.
                </p>
            </div>

            {/* Current Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Status</CardTitle>
                    <CardDescription>Your current subscription plan and status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">Status:</div>
                        <Badge variant={status === 'active' ? 'default' : status === 'trial' ? 'secondary' : 'destructive'} className="capitalize">
                            {status === 'trial' ? 'Free Trial' : status}
                        </Badge>
                    </div>
                    {status === 'trial' && (
                        <div className="text-sm text-muted-foreground">
                            You have <span className="font-medium text-foreground">{daysRemaining} days</span> remaining in your free trial.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Plans */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* SA Plan */}
                <Card className={plan === 'sa_monthly' ? 'border-primary ring-1 ring-primary' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            {SUBSCRIPTION_CONFIG.prices.sa.name}
                            {plan === 'sa_monthly' && <Badge>current</Badge>}
                        </CardTitle>
                        <CardDescription>For businesses based in South Africa</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">
                            {SUBSCRIPTION_CONFIG.prices.sa.currency} {SUBSCRIPTION_CONFIG.prices.sa.amount}
                            <span className="text-sm font-normal text-muted-foreground">/{SUBSCRIPTION_CONFIG.prices.sa.period}</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Unlimited Bookings</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> WhatsApp Notifications</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Priority Support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" disabled={plan === 'sa_monthly'}>
                            {plan === 'sa_monthly' ? 'Active Plan' : 'Upgrade to Standard'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* International Plan */}
                <Card className={plan === 'intl_monthly' ? 'border-primary ring-1 ring-primary' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            {SUBSCRIPTION_CONFIG.prices.international.name}
                            {plan === 'intl_monthly' && <Badge>current</Badge>}
                        </CardTitle>
                        <CardDescription>For businesses outside South Africa</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">
                            {SUBSCRIPTION_CONFIG.prices.international.currency} {SUBSCRIPTION_CONFIG.prices.international.amount}
                            <span className="text-sm font-normal text-muted-foreground">/{SUBSCRIPTION_CONFIG.prices.international.period}</span>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Multi-currency Support</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> Global SMS Notifications</li>
                            <li className="flex items-center gap-2"><Check className="size-4 text-green-500" /> All Features Included</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" disabled={plan === 'intl_monthly'}>
                            {plan === 'intl_monthly' ? 'Active Plan' : 'Upgrade to International'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <Shield className="size-4" />
                Payments are secure and encrypted.
            </div>
        </div>
    )
}
