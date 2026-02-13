'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isOnboardingComplete, isDemoMode } from '@/lib/business-data'
import { OnboardingWizard } from './onboarding-wizard'
import { Loader2 } from 'lucide-react'

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [isComplete, setIsComplete] = useState<boolean | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      let complete = false
      if (session?.user) {
        const { data: profile } = await supabase
          .from('business_profiles')
          .select('onboarding_completed')
          .eq('user_id', session.user.id)
          .single()

        complete = profile?.onboarding_completed || false
      }

      const demo = isDemoMode()

      setIsAuthenticated(!!session || demo)
      setIsComplete(complete || demo)
      setLoading(false)

      const isPublicPath = pathname === '/welcome' || pathname.startsWith('/auth') || pathname.startsWith('/book') || pathname === '/demo'

      if (!session && !demo && !isPublicPath) {
        router.push('/welcome')
      }
    }

    checkStatus()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true)
        router.refresh()
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        if (!isDemoMode()) {
          router.push('/welcome')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router, supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="size-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  // Allow public pages always
  const isPublicPage = pathname === '/welcome' || pathname.startsWith('/auth') || pathname.startsWith('/book') || pathname === '/demo'
  if (isPublicPage) {
    return <>{children}</>
  }

  // If not authenticated (and not demo), redirect to welcome is handled by useEffect
  // but we should still return null here to prevent flashing
  if (!isAuthenticated) {
    return null
  }

  // Show onboarding if authenticated but not complete
  if (!isComplete) {
    return <OnboardingWizard />
  }

  // Show app if complete and authenticated
  return <>{children}</>
}
