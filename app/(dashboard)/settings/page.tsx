import { useEffect, useState } from "react"
import { Bell, Globe, Lock, MapPin, Phone, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getBusinessProfile, isDemoMode } from "@/lib/business-data"

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    setProfile(getBusinessProfile())
  }, [])

  const businessName = profile?.name || (isDemoMode() ? "Demo Business" : "My Business")
  const initials = businessName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-3xl">
      {/* Page Header */}
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
              <Button variant="outline" size="sm">Change Photo</Button>
              <p className="text-xs text-muted-foreground">JPG, PNG. Max 2MB.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" defaultValue={businessName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Input id="businessType" defaultValue={profile?.type || "Professional"} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About Your Business</Label>
            <Textarea
              id="bio"
              placeholder="Tell clients about yourself and your services..."
              defaultValue={profile?.bio || ""}
              rows={3}
            />
          </div>

          <Button>Save Changes</Button>
        </CardContent>
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
            <Input id="phone" type="tel" defaultValue={profile?.phone || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue={profile?.email || ""} />
          </div>

          <Button>Save Changes</Button>
        </CardContent>
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
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              placeholder="Enter your business address..."
              defaultValue="123 Oxford Street, Osu, Accra"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" defaultValue="Accra" />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">Mobile Service</p>
              <p className="text-sm text-muted-foreground">I can travel to clients</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button>Save Changes</Button>
        </CardContent>
      </Card >

      {/* Notifications Section */}
      < Card >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Notifications
          </CardTitle>
          <CardDescription>How you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">New Booking Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified when someone books</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">Booking Reminders</p>
              <p className="text-sm text-muted-foreground">Remind me of upcoming appointments</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">Marketing Messages</p>
              <p className="text-sm text-muted-foreground">Tips and updates from Hustle</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card >

      {/* Preferences Section */}
      < Card >
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
            <Select defaultValue={profile?.currency?.toLowerCase() || "ghs"}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ghs">GHS - Ghana Cedi (GH₵)</SelectItem>
                <SelectItem value="ngn">NGN - Nigerian Naira (₦)</SelectItem>
                <SelectItem value="kes">KES - Kenyan Shilling (KSh)</SelectItem>
                <SelectItem value="zar">ZAR - South African Rand (R)</SelectItem>
                <SelectItem value="usd">USD - US Dollar ($)</SelectItem>
                <SelectItem value="eur">EUR - Euro (€)</SelectItem>
                <SelectItem value="gbp">GBP - Pound Sterling (£)</SelectItem>
                <SelectItem value="cad">CAD - Canadian Dollar (CA$)</SelectItem>
                <SelectItem value="aud">AUD - Australian Dollar (A$)</SelectItem>
                <SelectItem value="jpy">JPY - Japanese Yen (¥)</SelectItem>
                <SelectItem value="cny">CNY - Chinese Yuan (¥)</SelectItem>
                <SelectItem value="inr">INR - Indian Rupee (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">Tax Mode</p>
              <p className="text-sm text-muted-foreground">Show prices with tax inclusive or exclusive</p>
            </div>
            <Select defaultValue="inclusive">
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
              <p className="text-sm text-muted-foreground">Get booking updates via WhatsApp</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">Booking Confirmation</p>
              <p className="text-sm text-muted-foreground">Require you to confirm all bookings</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">Soft Reminders</p>
              <p className="text-sm text-muted-foreground">Get notified about incomplete bookings</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="tw">Twi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button>Save Changes</Button>
        </CardContent>
      </Card >

      {/* Account Section */}
      < Card >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Account
          </CardTitle>
          <CardDescription>Security and account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
            <div className="space-y-0.5">
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently remove your account and data</p>
            </div>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </CardContent>
      </Card >

      {/* App Info */}
      < div className="text-center text-sm text-muted-foreground py-6" >
        <p>WeBook v1.0.0</p>
        <p className="mt-1">Made with care for African entrepreneurs</p>
      </div >
    </div >
  )
}
