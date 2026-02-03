'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Rocket, Users, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
    const router = useRouter()

    const handleViewDemo = () => {
        router.push('/demo')
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <div className="size-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">W</div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">WeBook</span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                        <Link href="/auth/register">Get Started</Link>
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
                <Badge variant="outline" className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-100 py-1 px-3">
                    Early Access Available Now
                </Badge>
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
                    Simple <span className="text-emerald-600">Booking Management</span> for Solo Entrepreneurs
                </h1>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl">
                    The all-in-one assistant for your service business. Manage clients, bookings, and income with zero complexity.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button size="lg" className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-700 gap-2" asChild>
                        <Link href="/auth/register">
                            Start Your 30-Day Free Trial <ArrowRight className="size-5" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white" onClick={handleViewDemo}>
                        View Demo Dashboard
                    </Button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
                    <FeatureCard
                        icon={<Zap className="size-6 text-emerald-600" />}
                        title="Instant Setup"
                        description="Onboard your business in under 2 minutes and start accepting bookings immediately."
                    />
                    <FeatureCard
                        icon={<Users className="size-6 text-emerald-600" />}
                        title="Client CRM"
                        description="Keep track of every customer, their history, and spending habits automatically."
                    />
                    <FeatureCard
                        icon={<Shield className="size-6 text-emerald-600" />}
                        title="Peace of Mind"
                        description="Automatic confirmations and reminders so you can focus on your craft."
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="p-8 border-t border-slate-200 text-center text-slate-500 text-sm">
                © 2026 WeBook. Built for entrepreneurs, by entrepreneurs.
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="mb-4 p-2 bg-emerald-50 rounded-lg w-fit">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    )
}
