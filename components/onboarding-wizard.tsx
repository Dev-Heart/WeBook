'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Building2, Package, Settings, CheckCircle, Plus, X } from 'lucide-react'
import { saveOnboardingData, type BusinessProfile, type Service, type Preferences, DEMO_DATA } from '@/lib/business-data'
import { toast } from 'sonner'
import { startTrialAction, completeOnboardingAction } from '@/app/actions'

const BUSINESS_TYPES = [
  'Barber',
  'Hairstylist',
  'Nail Tech',
  'Makeup Artist',
  'Freelancer',
  'Other',
]

const CURRENCIES = [
  { code: 'GHS', name: 'Ghana Cedi (GH₵)', symbol: 'GH₵' },
  { code: 'NGN', name: 'Nigerian Naira (₦)', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling (KSh)', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand (R)', symbol: 'R' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'GBP', name: 'Pound Sterling (£)', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar (CA$)', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan (¥)', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
]

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 5

  // Form state
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({
    currency: 'GHS',
  })
  const [services, setServices] = useState<Omit<Service, 'id' | 'active'>[]>([])
  const [newService, setNewService] = useState({ name: '', price: '', duration: '' })
  const [preferences, setPreferences] = useState<Preferences>({
    currencyDisplay: 'symbol',
    taxMode: 'inclusive',
    whatsappNotifications: true,
    bookingConfirmationRequired: true,
    softReminders: true,
  })

  const progress = (step / totalSteps) * 100

  const handleAddService = () => {
    if (newService.name && newService.price && newService.duration) {
      setServices([
        ...services,
        {
          name: newService.name,
          price: parseFloat(newService.price),
          duration: parseInt(newService.duration),
        },
      ])
      setNewService({ name: '', price: '', duration: '' })
    }
  }

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const handleFinish = async (isDemoMode: boolean) => {
    if (isDemoMode) {
      saveOnboardingData({
        completed: true,
        profile: profile as BusinessProfile,
        services: services.map((s, i) => ({ ...s, id: `service-${i + 1}`, active: true })),
        preferences,
        isDemoMode: true
      })
      window.location.href = '/'
      return
    }

    const payload = {
      profile: profile as BusinessProfile,
      services: services.map(s => ({
        name: s.name,
        price: s.price,
        duration: s.duration,
      })),
      preferences: {
        taxMode: preferences.taxMode,
        whatsappNotifications: preferences.whatsappNotifications,
        bookingConfirmationRequired: preferences.bookingConfirmationRequired,
        softReminders: preferences.softReminders,
      }
    }

    toast.promise(completeOnboardingAction(payload), {
      loading: 'Setting up your business and initializing trial...',
      success: (res: any) => {
        if (!res.success) throw new Error(res.error)
        saveOnboardingData({
          completed: true,
          profile: profile as BusinessProfile,
          services: services.map((s, i) => ({ ...s, id: `service-${i + 1}`, active: true })),
          preferences,
          isDemoMode: false
        })
        window.location.href = '/'
        return 'Success! Redirecting to dashboard...'
      },
      error: (err) => {
        console.error('Failed to complete onboarding:', err)
        return 'Setup failed. Please try again.'
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
            <p className="text-sm font-medium">{Math.round(progress)}%</p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card className="border-2">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="size-8 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl">Welcome to WeBook</CardTitle>
                <CardDescription className="text-base leading-relaxed max-w-md mx-auto">
                  Your simple business assistant. We'll help you manage bookings, clients, and income—without the stress.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setStep(2)}
                className="w-full h-12 text-base"
                size="lg"
              >
                Set up my business
              </Button>
              <Button
                onClick={() => handleFinish(true)}
                variant="outline"
                className="w-full h-12 text-base"
                size="lg"
              >
                View demo dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Business Profile */}
        {step === 2 && (
          <Card className="border-2">
            <CardHeader>
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="size-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Tell us about your business</CardTitle>
              <CardDescription>This helps us personalize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  placeholder="e.g. Ama's Hair Studio"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business type</Label>
                <Select
                  value={profile.type}
                  onValueChange={(value) => setProfile({ ...profile, type: value })}
                >
                  <SelectTrigger id="businessType">
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Accra"
                    value={profile.city || ''}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="e.g. Ghana"
                    value={profile.country || ''}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Preferred currency</Label>
                <Select
                  value={profile.currency}
                  onValueChange={(value) => setProfile({ ...profile, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Business phone number (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+233 24 123 4567"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!profile.name || !profile.type || !profile.city || !profile.country}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Services Setup */}
        {step === 3 && (
          <Card className="border-2">
            <CardHeader>
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Package className="size-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Add your services</CardTitle>
              <CardDescription>
                Let clients know what you offer and how much it costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service List */}
              {services.length > 0 && (
                <div className="space-y-2">
                  {services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {CURRENCIES.find((c) => c.code === profile.currency)?.symbol}
                          {service.price} • {service.duration} min
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveService(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Service Form */}
              <div className="space-y-4 p-4 rounded-lg border-2 border-dashed">
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Service name</Label>
                  <Input
                    id="serviceName"
                    placeholder="e.g. Haircut, Braids, Manicure"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="servicePrice">Price</Label>
                    <Input
                      id="servicePrice"
                      type="number"
                      placeholder="100"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceDuration">Duration (minutes)</Label>
                    <Input
                      id="serviceDuration"
                      type="number"
                      placeholder="60"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddService}
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={!newService.name || !newService.price || !newService.duration}
                >
                  <Plus className="size-4 mr-2" />
                  Add service
                </Button>
              </div>

              {services.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No services added yet. Add at least one to continue.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={services.length === 0}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <Card className="border-2">
            <CardHeader>
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Settings className="size-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Set your preferences</CardTitle>
              <CardDescription>Customize how your business runs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tax mode</Label>
                    <p className="text-sm text-muted-foreground">
                      How should prices show tax?
                    </p>
                  </div>
                  <Select
                    value={preferences.taxMode}
                    onValueChange={(value: 'inclusive' | 'exclusive') =>
                      setPreferences({ ...preferences, taxMode: value })
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inclusive">Inclusive</SelectItem>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="whatsapp">WhatsApp notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get booking updates via WhatsApp
                    </p>
                  </div>
                  <Switch
                    id="whatsapp"
                    checked={preferences.whatsappNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, whatsappNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="confirmation">Booking confirmation</Label>
                    <p className="text-sm text-muted-foreground">
                      Require you to confirm all bookings
                    </p>
                  </div>
                  <Switch
                    id="confirmation"
                    checked={preferences.bookingConfirmationRequired}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, bookingConfirmationRequired: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminders">Soft reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about incomplete bookings
                    </p>
                  </div>
                  <Switch
                    id="reminders"
                    checked={preferences.softReminders}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, softReminders: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(5)} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Finish */}
        {step === 5 && (
          <Card className="border-2">
            <CardHeader className="text-center space-y-3 pb-6">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="size-8 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl sm:text-3xl">Your business is ready</CardTitle>
                <CardDescription className="text-sm sm:text-base leading-relaxed max-w-md mx-auto">
                  You're all set! Start adding bookings and clients to see your business grow.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 sm:p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Business name</span>
                  <span className="font-medium text-right">{profile.name}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium text-right">{profile.type}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-right">
                    {profile.city}, {profile.country}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Services</span>
                  <span className="font-medium text-right">{services.length} added</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => handleFinish(false)} className="flex-1" size="lg">
                  Go to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
