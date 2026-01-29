'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createClient } from '@/lib/supabase/client'
import { Calendar as CalendarIcon, Clock, CheckCircle2, Loader2 } from 'lucide-react'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  active: boolean
}

interface BusinessProfile {
  name: string
  city: string
  country: string
  currency: string
}

interface AvailabilitySettings {
  [key: string]: any
  slot_duration: number
  buffer_time: number
  advance_booking_days: number
}

import { checkBookingAvailability, createBooking } from '@/app/actions'

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'service' | 'datetime' | 'details' | 'success'>('service')
  const supabase = createClient()

  // Business data
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [availability, setAvailability] = useState<AvailabilitySettings | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUnavailable, setIsUnavailable] = useState(false)

  // Form state
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    loadBusinessData()
  }, [])

  useEffect(() => {
    if (selectedDate && availability && userId) {
      loadAvailableSlots(selectedDate)
    }
  }, [selectedDate, availability, userId])

  async function loadBusinessData() {
    try {
      // Use 'u' param if available, otherwise fallback to first user (demo/owner check)
      const queryUserId = searchParams.get('u')
      let targetUserId = queryUserId

      if (!targetUserId) {
        // Fallback: check if viewer is the owner
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          targetUserId = user.id
        } else {
          // If no user and no param, fetch first profile as fallback (demo)
          const { data: users } = await supabase.from('business_profiles').select('user_id').limit(1).single()
          targetUserId = users?.user_id || null
        }
      }

      if (!targetUserId) {
        setLoading(false)
        return
      }

      setUserId(targetUserId)

      // Check if business has active subscription
      const isAvailable = await checkBookingAvailability(targetUserId)
      if (!isAvailable) {
        setIsUnavailable(true)
        setLoading(false)
        return
      }

      // Fetch business profile
      const { data: profileData } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single()

      if (profileData) {
        setProfile({
          name: profileData.business_name || 'Business',
          city: profileData.city || '',
          country: profileData.country || '',
          currency: profileData.currency_display || 'GH₵',
        })
      }

      // Fetch active services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('active', true)

      if (servicesData) {
        setServices(servicesData)
      }

      // Fetch availability settings
      const { data: availData } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('user_id', targetUserId)
        .single()

      if (availData) {
        setAvailability(availData)
      }
    } catch (error) {
      console.error('[v0] Error loading business data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadAvailableSlots(date: Date) {
    if (!availability || !userId) return

    setLoadingSlots(true)
    try {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      const daySchedule = availability[dayName]

      if (!daySchedule || !daySchedule.enabled) {
        setAvailableSlots([])
        setLoadingSlots(false)
        return
      }

      // Generate time slots based on day schedule
      const slots = generateTimeSlots(
        daySchedule.start,
        daySchedule.end,
        availability.slot_duration,
        availability.buffer_time
      )

      // Fetch existing bookings for this date
      const dateStr = date.toISOString().split('T')[0]
      const { data: bookings } = await supabase
        .from('bookings')
        .select('time')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .in('status', ['scheduled', 'confirmed'])

      const bookedTimes = new Set(bookings?.map(b => b.time) || [])

      // Filter out booked slots
      const available = slots.filter(slot => !bookedTimes.has(slot))
      setAvailableSlots(available)
    } catch (error) {
      console.error('[v0] Error loading slots:', error)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  function generateTimeSlots(start: string, end: string, duration: number, buffer: number): string[] {
    const slots: string[] = []
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const interval = duration + buffer

    for (let minutes = startMinutes; minutes + duration <= endMinutes; minutes += interval) {
      const hour = Math.floor(minutes / 60)
      const min = minutes % 60
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
      slots.push(timeStr)
    }

    return slots
  }

  function formatTime(time: string): string {
    const [hour, min] = time.split(':').map(Number)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setStep('datetime')
  }

  const handleDateTimeNext = () => {
    if (selectedDate && selectedTime) {
      setStep('details')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !selectedDate || !selectedTime || !userId) return

    setIsSubmitting(true)

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]

      const result = await createBooking({
        userId: userId,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        clientName: clientName,
        clientPhone: clientPhone,
        clientEmail: clientEmail || null,
        date: dateStr,
        time: selectedTime,
        notes: notes || null,
        price: selectedService.price
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create booking')
      }

      setStep('success')
    } catch (error: any) {
      console.error('[v0] Error saving booking:', error)
      alert(error.message || 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isUnavailable) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle>Booking Unavailable</CardTitle>
            <CardDescription className="mt-2 text-balance">
              This business is currently not accepting new bookings. Please contact them directly or try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Business Not Found</CardTitle>
            <CardDescription>This booking page is not available yet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
            <CardDescription className="text-base mt-2">
              We'll send you a confirmation message at {clientPhone}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm text-left mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{selectedDate?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">{profile.currency} {selectedService?.price}</span>
              </div>
            </div>
            <Button
              onClick={() => {
                setStep('service')
                setSelectedService(null)
                setSelectedDate(undefined)
                setSelectedTime('')
                setClientName('')
                setClientPhone('')
                setClientEmail('')
                setNotes('')
              }}
              variant="outline"
              className="w-full"
            >
              Book Another Service
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-balance mb-2">{profile.name}</h1>
          <p className="text-muted-foreground">
            {profile.city}{profile.city && profile.country && ', '}{profile.country}
          </p>
        </div>

        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose a Service</h2>
            {services.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No services available at the moment.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-semibold text-foreground">
                            {profile.currency} {service.price}
                          </span>
                          <span className="text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration} min
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 'datetime' && selectedService && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setStep('service')}
              className="mb-4"
            >
              ← Back to Services
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>{selectedService.name}</CardTitle>
                <CardDescription>
                  {profile.currency} {selectedService.price} · {selectedService.duration} minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base mb-3 block">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      if (date < today) return true

                      if (availability) {
                        const maxDate = new Date()
                        maxDate.setDate(maxDate.getDate() + availability.advance_booking_days)
                        if (date > maxDate) return true
                      }

                      return false
                    }}
                    className="rounded-md border w-full"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <Label className="text-base mb-3 block">
                      {loadingSlots ? 'Loading available times...' : 'Select Time'}
                    </Label>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No available times on this date. Please choose another day.
                      </div>
                    ) : (
                      <RadioGroup value={selectedTime} onValueChange={setSelectedTime}>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {availableSlots.map((time) => (
                            <div key={time}>
                              <RadioGroupItem
                                value={time}
                                id={time}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={time}
                                className="flex items-center justify-center rounded-md border-2 border-muted bg-background px-3 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-colors text-sm"
                              >
                                {formatTime(time)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleDateTimeNext}
                  disabled={!selectedDate || !selectedTime || loadingSlots}
                  className="w-full"
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Client Details */}
        {step === 'details' && selectedService && selectedDate && selectedTime && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setStep('datetime')}
              className="mb-4"
            >
              ← Back to Date & Time
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>
                  We'll use this to confirm your booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      placeholder="e.g. Ama Mensah"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      required
                      placeholder="e.g. +233 24 123 4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="e.g. ama@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Special Requests (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or notes?"
                      rows={3}
                    />
                  </div>

                  <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                    <div className="font-medium mb-2">Booking Summary</div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span>{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{selectedDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{formatTime(selectedTime)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total:</span>
                      <span>{profile.currency} {selectedService.price}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !clientName || !clientPhone}
                    className="w-full"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
