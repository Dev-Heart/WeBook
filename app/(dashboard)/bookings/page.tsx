'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, Search, MoreVertical, Check, X, Clock, Loader2, Plus, Bell } from 'lucide-react'
import { toast } from "sonner"
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Booking {
  id: string
  user_id: string
  client_name: string
  client_phone: string
  service_name: string
  date: string
  time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
}

import { useSubscription } from '@/components/subscription-provider'
import { cancelBookingAction, sendReminderAction } from '@/app/actions'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()
  const { isLocked } = useSubscription()

  useEffect(() => {
    loadBookings()
  }, [])

  // ... (rest of loadBookings and updateBookingStatus)

  async function loadBookings() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) throw error

      setBookings(data || [])
    } catch (error) {
      console.error('[v0] Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }



  async function updateBookingStatus(bookingId: string, newStatus: Booking['status']) {
    setUpdatingId(bookingId)
    try {
      if (newStatus === 'cancelled') {
        const result = await cancelBookingAction(bookingId)
        if (!result.success) {
          toast.error(result.error || 'Failed to cancel booking')
          throw new Error(result.error)
        }
        toast.success('Booking cancelled')
      } else {
        const { error } = await supabase
          .from('bookings')
          .update({ status: newStatus })
          .eq('id', bookingId)

        if (error) throw error
      }



      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      )
      if (newStatus !== 'cancelled') toast.success('Booking status updated')
    } catch (error) {
      console.error('[v0] Error updating booking:', error)
      toast.error('Failed to update booking status')
    } finally {
      setUpdatingId(null)
    }
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function formatTime(time: string): string {
    const [hour, min] = time.split(':').map(Number)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function isUpcoming(booking: Booking): boolean {
    const bookingDate = new Date(booking.date + 'T' + booking.time)
    return bookingDate >= new Date() && ['scheduled', 'confirmed'].includes(booking.status)
  }

  function isPast(booking: Booking): boolean {
    const bookingDate = new Date(booking.date + 'T' + booking.time)
    return bookingDate < new Date() || ['completed', 'cancelled'].includes(booking.status)
  }

  const filteredBookings = bookings.filter(b =>
    b.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.client_phone.includes(searchQuery) ||
    b.service_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const upcomingBookings = filteredBookings.filter(isUpcoming)
  const pastBookings = filteredBookings.filter(isPast)

  function getStatusColor(status: Booking['status']): string {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
      case 'confirmed': return 'bg-primary/10 text-primary hover:bg-primary/20'
      case 'completed': return 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
      default: return 'bg-muted'
    }
  }

  function BookingCard({ booking }: { booking: Booking }) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(booking.client_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{booking.client_name}</p>
            <p className="text-sm text-muted-foreground">
              {booking.service_name}
            </p>
            {booking.notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">"{booking.notes}"</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{formatTime(booking.time)}</p>
            <p className="text-xs text-muted-foreground">{formatDate(booking.date)}</p>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" disabled={updatingId === booking.id}>
                {updatingId === booking.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreVertical className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                disabled={isLocked}
              >
                <Check className="mr-2 h-4 w-4" />
                Confirm
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'completed')}>
                <Check className="mr-2 h-4 w-4" />
                Mark Complete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                className="text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage your appointments and schedule
          </p>
        </div>
        {isLocked ? (
          <Button className="gap-2" disabled>
            <Plus className="size-4" />
            Share Booking Link
          </Button>
        ) : (
          <Button className="gap-2" asChild>
            <a href={`/book?u=${userId || ''}`} target="_blank">
              <Plus className="size-4" />
              Share Booking Link
            </a>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? 'No bookings match your search.'
                    : 'Share your booking link with clients so they can schedule appointments.'
                  }
                </p>
                {!searchQuery && userId && (
                  <Button className="gap-2" asChild>
                    <a href={`/book?u=${userId}`} target="_blank">
                      <Plus className="size-4" />
                      Open Booking Page
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            upcomingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No past bookings yet</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? 'No bookings match your search.'
                    : 'Your completed appointments will show up here.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            pastBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
