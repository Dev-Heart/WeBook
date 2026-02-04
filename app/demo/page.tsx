'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoPage() {
    const router = useRouter()

    useEffect(() => {
        // Initialize demo data in localStorage
        const demoOnboardingData = {
            completed: true,
            isDemoMode: true,
            profile: {
                name: 'Glam Studio',
                type: 'Beauty Salon',
                city: 'Accra',
                country: 'Ghana',
                currency: 'GHS',
                phone: '+233 24 123 4567'
            },
            services: [
                {
                    id: '1',
                    name: 'Braids',
                    price: 150,
                    duration: 120,
                    category: 'Hair',
                    active: true
                },
                {
                    id: '2',
                    name: 'Haircut',
                    price: 50,
                    duration: 30,
                    category: 'Hair',
                    active: true
                },
                {
                    id: '3',
                    name: 'Relaxer + Style',
                    price: 200,
                    duration: 90,
                    category: 'Hair',
                    active: true
                },
                {
                    id: '4',
                    name: 'Beard Trim',
                    price: 30,
                    duration: 20,
                    category: 'Grooming',
                    active: true
                },
                {
                    id: '5',
                    name: 'Manicure',
                    price: 80,
                    duration: 45,
                    category: 'Nails',
                    active: true
                }
            ],
            preferences: {
                currencyDisplay: 'symbol',
                taxMode: 'inclusive',
                whatsappNotifications: true,
                bookingConfirmationRequired: true,
                softReminders: true
            }
        }

        // Demo bookings
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dayAfter = new Date(today)
        dayAfter.setDate(dayAfter.getDate() + 2)

        const demoBookings = [
            {
                id: '1',
                clientId: '1',
                clientName: 'Ama Mensah',
                clientPhone: '+233 24 111 1111',
                clientEmail: 'ama@example.com',
                serviceId: '1',
                serviceName: 'Braids',
                date: today.toISOString().split('T')[0],
                time: '14:00',
                notes: 'Prefers box braids',
                status: 'confirmed',
                createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                clientId: '2',
                clientName: 'Kwame Asante',
                clientPhone: '+233 20 222 2222',
                serviceId: '2',
                serviceName: 'Haircut',
                date: tomorrow.toISOString().split('T')[0],
                time: '10:00',
                status: 'confirmed',
                createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '3',
                clientId: '3',
                clientName: 'Efua Darko',
                clientPhone: '+233 55 333 3333',
                clientEmail: 'efua@example.com',
                serviceId: '3',
                serviceName: 'Relaxer + Style',
                date: tomorrow.toISOString().split('T')[0],
                time: '13:30',
                status: 'scheduled',
                createdAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '4',
                clientId: '4',
                clientName: 'Yaw Boateng',
                clientPhone: '+233 26 444 4444',
                serviceId: '4',
                serviceName: 'Beard Trim',
                date: dayAfter.toISOString().split('T')[0],
                time: '09:00',
                status: 'confirmed',
                createdAt: today.toISOString()
            }
        ]

        // Demo clients
        const demoClients = [
            {
                id: '1',
                name: 'Ama Mensah',
                phone: '+233 24 111 1111',
                email: 'ama@example.com',
                visits: 12,
                totalSpent: 1800,
                lastVisit: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                vip: true,
                createdAt: new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                name: 'Kwame Asante',
                phone: '+233 20 222 2222',
                visits: 8,
                totalSpent: 400,
                lastVisit: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                vip: false,
                createdAt: new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '3',
                name: 'Efua Darko',
                phone: '+233 55 333 3333',
                email: 'efua@example.com',
                visits: 15,
                totalSpent: 3000,
                lastVisit: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                vip: true,
                createdAt: new Date(today.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '4',
                name: 'Yaw Boateng',
                phone: '+233 26 444 4444',
                visits: 5,
                totalSpent: 150,
                lastVisit: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                vip: false,
                createdAt: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
            }
        ]

        // Save demo data to localStorage
        localStorage.setItem('hustle_onboarding', JSON.stringify(demoOnboardingData))
        localStorage.setItem('hustle_bookings', JSON.stringify(demoBookings))
        localStorage.setItem('hustle_clients', JSON.stringify(demoClients))

        // Redirect to dashboard (which will show demo data since we're not authenticated)
        router.push('/')
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading demo dashboard...</p>
            </div>
        </div>
    )
}
