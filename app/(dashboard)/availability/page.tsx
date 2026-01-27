'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Clock, Calendar, Save, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DaySchedule {
  enabled: boolean
  start: string
  end: string
  breakStart?: string
  breakEnd?: string
}

interface AvailabilitySettings {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
  slotDuration: number
  bufferTime: number
  advanceBookingDays: number
}

const defaultSchedule: DaySchedule = {
  enabled: true,
  start: '09:00',
  end: '17:00',
}

const defaultSettings: AvailabilitySettings = {
  monday: defaultSchedule,
  tuesday: defaultSchedule,
  wednesday: defaultSchedule,
  thursday: defaultSchedule,
  friday: defaultSchedule,
  saturday: { ...defaultSchedule, enabled: false },
  sunday: { ...defaultSchedule, enabled: false },
  slotDuration: 30,
  bufferTime: 0,
  advanceBookingDays: 30,
}

import { useSubscription } from '@/components/subscription-provider'

export default function AvailabilityPage() {
  const [settings, setSettings] = useState<AvailabilitySettings>(defaultSettings)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()
  const { isLocked } = useSubscription()

  useEffect(() => {
    loadSettings()
  }, [])


  async function loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      const { data, error } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('[v0] Error loading settings:', error)
      }

      if (data) {
        setSettings({
          monday: data.monday || defaultSchedule,
          tuesday: data.tuesday || defaultSchedule,
          wednesday: data.wednesday || defaultSchedule,
          thursday: data.thursday || defaultSchedule,
          friday: data.friday || defaultSchedule,
          saturday: data.saturday || { ...defaultSchedule, enabled: false },
          sunday: data.sunday || { ...defaultSchedule, enabled: false },
          slotDuration: data.slot_duration || 30,
          bufferTime: data.buffer_time || 0,
          advanceBookingDays: data.advance_booking_days || 30,
        })
      }
    } catch (err) {
      console.error('[v0] Error in loadSettings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    if (!userId) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('availability_settings')
        .upsert({
          user_id: userId,
          monday: settings.monday,
          tuesday: settings.tuesday,
          wednesday: settings.wednesday,
          thursday: settings.thursday,
          friday: settings.friday,
          saturday: settings.saturday,
          sunday: settings.sunday,
          slot_duration: settings.slotDuration,
          buffer_time: settings.bufferTime,
          advance_booking_days: settings.advanceBookingDays,
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Availability settings saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      console.error('[v0] Error saving settings:', err)
      setMessage({ type: 'error', text: `Failed to save settings: ${err.message || 'Unknown error'}` })
    } finally {
      setSaving(false)
    }
  }

  function updateDay(day: keyof Omit<AvailabilitySettings, 'slotDuration' | 'bufferTime' | 'advanceBookingDays'>, updates: Partial<DaySchedule>) {
    setSettings(prev => ({
      ...prev,
      [day]: { ...prev[day], ...updates }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading availability settings...</div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to manage your availability settings.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const days = [
    { key: 'monday' as const, label: 'Monday' },
    { key: 'tuesday' as const, label: 'Tuesday' },
    { key: 'wednesday' as const, label: 'Wednesday' },
    { key: 'thursday' as const, label: 'Thursday' },
    { key: 'friday' as const, label: 'Friday' },
    { key: 'saturday' as const, label: 'Saturday' },
    { key: 'sunday' as const, label: 'Sunday' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground text-balance">Availability Settings</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Set your working hours and booking preferences. Your clients will only see available time slots.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>
            Set your working hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map(({ key, label }) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3 sm:w-32">
                <Switch
                  checked={settings[key].enabled}
                  onCheckedChange={(checked) => updateDay(key, { enabled: checked })}
                />
                <Label className="font-medium">{label}</Label>
              </div>

              {settings[key].enabled && (
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={settings[key].start}
                      onChange={(e) => updateDay(key, { start: e.target.value })}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={settings[key].end}
                      onChange={(e) => updateDay(key, { end: e.target.value })}
                      className="w-32"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Booking Preferences
          </CardTitle>
          <CardDescription>
            Configure how clients can book with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Appointment Duration</Label>
            <Select
              value={settings.slotDuration.toString()}
              onValueChange={(value) => setSettings(prev => ({ ...prev, slotDuration: Number(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Default time slot duration for bookings</p>
          </div>

          <div className="space-y-2">
            <Label>Buffer Time Between Appointments</Label>
            <Select
              value={settings.bufferTime.toString()}
              onValueChange={(value) => setSettings(prev => ({ ...prev, bufferTime: Number(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No buffer</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Time between appointments for preparation</p>
          </div>

          <div className="space-y-2">
            <Label>Advance Booking Window</Label>
            <Select
              value={settings.advanceBookingDays.toString()}
              onValueChange={(value) => setSettings(prev => ({ ...prev, advanceBookingDays: Number(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">1 week</SelectItem>
                <SelectItem value="14">2 weeks</SelectItem>
                <SelectItem value="30">1 month</SelectItem>
                <SelectItem value="60">2 months</SelectItem>
                <SelectItem value="90">3 months</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">How far in advance clients can book</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving || isLocked} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
