"use client"

import { useEffect, useState } from "react"
import { Bell, Globe, Lock, MapPin, Phone, User, Loader2, LogOut, RotateCw, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { updateBusinessProfileAction, repairClientStatsAction } from "@/app/actions"
import { toast } from "sonner"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [repairing, setRepairing] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setProfile(data)
          setFormData({
            business_name: data.business_name || '',
            business_type: data.business_type || '',
            contact_phone: data.contact_phone || '',
            contact_email: data.contact_email || '',
            location_name: data.location_name || '',
            location_address: data.location_address || '',
            currency_display: data.currency_display || 'ghs',
            tax_mode: data.tax_mode || 'inclusive',
            whatsapp_notifications: data.whatsapp_notifications ?? true,
            booking_confirmation_required: data.booking_confirmation_required ?? true,
            soft_reminders: data.soft_reminders ?? true,
          })
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async (sectionData?: any) => {
    setSaving(true)
    const dataToSave = sectionData || formData

    const result = await updateBusinessProfileAction(dataToSave)

    if (result.success) {
      toast.success('Settings updated successfully')
      setProfile({ ...profile, ...dataToSave })
    } else {
      toast.error(result.error || 'Failed to update settings')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleRepair = async () => {
    setRepairing(true)
    try {
      const result = await repairClientStatsAction()
      if (result.success) {
        toast.success(result.message || 'Data repaired successfully')
      } else {
        toast.error(result.error || 'Failed to repair data')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setRepairing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const initials = (formData.business_name || "My Business").split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profile
          </CardTitle>
          <CardDescription>Your public information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              {/* <Button variant="outline" size="sm">Change Photo</Button>
              <p className="text-xs text-muted-foreground">JPG, PNG. Max 2MB.</p> */}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Input
              id="businessType"
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleSave()} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="size-5" />
            Contact Information
          </CardTitle>
          <CardDescription>How clients can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleSave()} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Location Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            Location
          </CardTitle>
          <CardDescription>Where you work from</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address / Country</Label>
            <Input
              id="address"
              value={formData.location_address}
              onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleSave()} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="size-5" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency_display}
              onValueChange={(val) => setFormData({ ...formData, currency_display: val })}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ghs">GHS - Ghana Cedi (GH₵)</SelectItem>
                <SelectItem value="zar">ZAR - South African Rand (R)</SelectItem>
                <SelectItem value="ngn">NGN - Nigerian Naira (₦)</SelectItem>
                <SelectItem value="kes">KES - Kenyan Shilling (KSh)</SelectItem>
                <SelectItem value="usd">USD - US Dollar ($)</SelectItem>
                <SelectItem value="eur">EUR - Euro (€)</SelectItem>
                <SelectItem value="gbp">GBP - Pound Sterling (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">Tax Mode</p>
              <p className="text-sm text-muted-foreground">Show prices with tax inclusive or exclusive</p>
            </div>
            <Select
              value={formData.tax_mode}
              onValueChange={(val: any) => setFormData({ ...formData, tax_mode: val })}
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

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">WhatsApp Notifications</p>
            </div>
            <Switch
              checked={formData.whatsapp_notifications}
              onCheckedChange={(val) => setFormData({ ...formData, whatsapp_notifications: val })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">Booking Confirmation</p>
            </div>
            <Switch
              checked={formData.booking_confirmation_required}
              onCheckedChange={(val) => setFormData({ ...formData, booking_confirmation_required: val })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleSave()} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Account Actions */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="size-5" />
            Account Actions
          </CardTitle>
          <CardDescription>Manage your session</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out of your account on this device. You will need to sign in again to access your business data.
          </p>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 size-4" />
                Log Out
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCw className="size-5" />
            Troubleshooting
          </CardTitle>
          <CardDescription>Fix issues with your data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you are missing client statistics (Total Spent, Last Visit) for past bookings, run this tool to attempt to link them.
          </p>
          <Button
            variant="outline"
            onClick={handleRepair}
            disabled={repairing}
          >
            {repairing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Repairing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Repair Client Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground py-6">
        <p>WeBook v1.0.0</p>
      </div>
    </div>
  )
}
