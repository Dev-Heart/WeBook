'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { isOnboardingComplete } from '@/lib/business-data'
import { OnboardingWizard } from './onboarding-wizard'

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [isComplete, setIsComplete] = useState<boolean | null>(null)

  useEffect(() => {
    setIsComplete(isOnboardingComplete())
  }, [])

  // Loading state
  if (isComplete === null) {
    return null
  }

  // Show onboarding if not complete
  if (!isComplete) {
    return <OnboardingWizard />
  }

  // Show app if complete
  return <>{children}</>
}
