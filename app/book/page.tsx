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
import { Calendar as CalendarIcon, Clock, CheckCircle2, Loader2, MapPin, Sparkles, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

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

      // Fetch public business data (Server Action bypasses RLS)
      const { getPublicBusinessDataAction } = await import('@/app/actions')
      const data = await getPublicBusinessDataAction(targetUserId)

      if (data.error) {
        console.error('Error loading business:', data.error)
        setLoading(false)
        return
      }

      if (data.isUnavailable) {
        setIsUnavailable(true)
        setLoading(false)
        return
      }

      if (data.profile) {
        setProfile({
          name: data.profile.name,
          city: data.profile.city,
          country: data.profile.country,
          currency: data.profile.currency,
        })
      }

      if (data.services) {
        setServices(data.services)
      }

      if (data.availability) {
        setAvailability(data.availability)
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

      // Fetch existing bookings via Server Action (bypasses RLS)
      const dateStr = date.toISOString().split('T')[0]
      const { getAvailableSlotsAction } = await import('@/app/actions')
      const { bookedTimes } = await getAvailableSlotsAction(userId, dateStr)

      const bookedSet = new Set(bookedTimes || [])

      // Filter out booked slots
      const available = slots.filter(slot => !bookedSet.has(slot))
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

  const handleDateTimeNext = async () => {
    if (!selectedDate || !selectedTime) return

    // Re-validate slot availability before proceeding
    // (in case another user just booked it)
    setLoadingSlots(true)
    await loadAvailableSlots(selectedDate)
    setLoadingSlots(false)

    // Check if the selected time is still available
    const dateStr = selectedDate.toISOString().split('T')[0]
    const { getAvailableSlotsAction } = await import('@/app/actions')
    const { bookedTimes } = await getAvailableSlotsAction(userId!, dateStr)

    if (bookedTimes.includes(selectedTime)) {
      alert('Sorry, this time slot was just booked by another customer. Please select a different time.')
      setSelectedTime('')
      return
    }

    setStep('details')
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
        // Show error to user
        alert(result.error || 'Failed to create booking. Please try again.')

        // Refresh available slots to show updated availability
        await loadAvailableSlots(selectedDate)

        // Navigate back to datetime step so user can pick another slot
        setSelectedTime('') // Clear selected time
        setStep('datetime')
        setIsSubmitting(false)
        return
      }

      setStep('success')
    } catch (error: any) {
      console.error('[v0] Error saving booking:', error)
      alert(error.message || 'Failed to create booking. Please try again.')

      // Refresh slots on error as well
      if (selectedDate) {
        await loadAvailableSlots(selectedDate)
      }
      setSelectedTime('')
      setStep('datetime')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isUnavailable) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-none">
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-none">
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-none animate-in fade-in zoom-in duration-300">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-cyan-500" />
          <CardHeader>
            <div className="mx-auto mb-6 w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600">Booking Confirmed!</CardTitle>
            <CardDescription className="text-base mt-2 max-w-xs mx-auto">
              We look forward to seeing you!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-xl p-6 space-y-3 text-sm text-left mb-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 pb-2">
                <span className="text-muted-foreground">Service</span>
                <span className="font-semibold text-foreground">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 pb-2">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{selectedDate?.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 pb-2">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground font-medium">Total Price</span>
                <span className="font-bold text-lg text-primary">{profile.currency} {selectedService?.price}</span>
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
              className="w-full h-12 text-base font-medium shadow-md transition-all hover:shadow-lg"
            >
              Book Another Service
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Premium Header Background */}
      <div className="w-full h-64 bg-slate-900 absolute top-0 left-0 z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="w-full max-w-3xl z-10 px-4 pt-12 pb-8 flex flex-col grow">

        {/* Business Header */}
        <div className="text-center mb-10 space-y-2 animate-in slide-in-from-bottom-5 duration-500">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-xl mb-4">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">{profile.name}</h1>
          <div className="flex items-center justify-center gap-2 text-slate-300">
            <MapPin className="size-4" />
            <p className="font-medium">
              {profile.city}{profile.city && profile.country && ', '}{profile.country}
            </p>
          </div>
        </div>

        {/* Dynamic Content Card */}
        <div className="w-full grow flex flex-col">
          {/* Step 1: Service Selection */}
          {step === 'service' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Select a Service</h2>
                <p className="text-muted-foreground">Choose the perfect service for you</p>
              </div>

              {services.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No services available at the moment.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="group relative bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer bg-gradient-to-br from-white to-slate-50 hover:to-white"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">{service.name}</h3>
                        <span className="font-bold text-lg bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                          {profile.currency} {service.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                        <Clock className="size-4" />
                        <span>{service.duration} mins</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 'datetime' && selectedService && (
            <div className="animate-in slide-in-from-right-10 duration-500">
              <Button variant="ghost" onClick={() => setStep('service')} className="mb-6 hover:bg-white/50 -ml-4 text-muted-foreground">
                <ChevronLeft className="size-4 mr-1" /> Change Service
              </Button>

              <div className="grid md:grid-cols-12 gap-6 items-start">
                {/* Summary Sidebar */}
                <Card className="md:col-span-4 border-none shadow-lg bg-slate-900 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-xl -mr-10 -mt-10"></div>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium text-slate-200">Selected Service</CardTitle>
                    <h3 className="text-2xl font-bold mt-1">{selectedService.name}</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="size-8 rounded-full bg-white/10 flex items-center justify-center"><Clock className="size-4" /></div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Duration</p>
                        <p className="font-medium">{selectedService.duration} Minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="size-8 rounded-full bg-white/10 flex items-center justify-center"><span className="text-xs font-bold">{profile.currency}</span></div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Price</p>
                        <p className="font-medium">{profile.currency} {selectedService.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content */}
                <Card className="md:col-span-8 shadow-xl border-none">
                  <CardHeader>
                    <CardTitle>Choose a Date & Time</CardTitle>
                    <CardDescription>Select a slot that works for you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
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
                        className="rounded-lg border shadow-sm mx-auto"
                      />
                    </div>

                    {selectedDate && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <Label className="text-base font-semibold mb-4 block">
                          Available Slots for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Label>
                        {loadingSlots ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                            <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground font-medium">No slots available on this date.</p>
                            <p className="text-xs text-muted-foreground">Please try another day.</p>
                          </div>
                        ) : (
                          <RadioGroup value={selectedTime} onValueChange={setSelectedTime}>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {availableSlots.map((time) => (
                                <div key={time}>
                                  <RadioGroupItem
                                    value={time}
                                    id={time}
                                    className="peer sr-only"
                                  />
                                  <Label
                                    htmlFor={time}
                                    className="flex flex-col items-center justify-center rounded-lg border bg-background px-3 py-3 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all shadow-sm peer-data-[state=checked]:shadow-md font-medium text-sm text-center"
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
                      className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
                    >
                      Continue to Details
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Client Details */}
          {step === 'details' && selectedService && selectedDate && selectedTime && (
            <div className="max-w-xl mx-auto w-full animate-in slide-in-from-right-10 duration-500">
              <Button variant="ghost" onClick={() => setStep('datetime')} className="mb-6 hover:bg-white/50 -ml-4 text-muted-foreground">
                <ChevronLeft className="size-4 mr-1" /> Back to Time
              </Button>

              <Card className="shadow-2xl border-none overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-purple-600"></div>
                <CardHeader>
                  <CardTitle className="text-2xl">Finalize Booking</CardTitle>
                  <CardDescription>
                    Enter your details to confirm your appointment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          required
                          placeholder="e.g. John Doe"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          required
                          placeholder="e.g. +1 234 567 8900"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Special Requests (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Anything we should know?"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Order Summary</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Service</span>
                        <span className="font-medium">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Date & Time</span>
                        <span className="font-medium">{selectedDate.toLocaleDateString()} at {formatTime(selectedTime)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200 mt-2">
                        <span>Total to Pay</span>
                        <span className="text-primary">{profile.currency} {selectedService.price}</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !clientName || !clientPhone}
                      className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-primary/25 transition-all"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Confirming...</>
                      ) : 'Confirm Booking'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By confirming, you agree to our booking terms.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
