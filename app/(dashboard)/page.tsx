"use client"

import { useEffect, useState } from 'react'
import { Calendar, CheckCircle, Clock, DollarSign, Plus, TrendingUp, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getBusinessProfile, formatCurrency } from '@/lib/business-data'
import { createClient } from '@/lib/supabase/client'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ShareBookingDialog } from '@/components/share-booking-dialog'
import { AddClientDialog } from '@/components/add-client-dialog'
import { AddServiceDialog } from '@/components/add-service-dialog'
import { AddIncomeDialog } from '@/components/add-income-dialog'

export default function DashboardPage() {
  const [profile, setProfile] = useState<ReturnType<typeof getBusinessProfile>>(null)
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Real Data State
  const [bookings, setBookings] = useState<any[]>([])
  const [todayBookingsCount, setTodayBookingsCount] = useState(0)
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [incomeMonth, setIncomeMonth] = useState(0)
  const [expensesMonth, setExpensesMonth] = useState(0)
  const [netIncomeMonth, setNetIncomeMonth] = useState(0)

  const [incomeData, setIncomeData] = useState<any[]>([])
  const [bookingsData, setBookingsData] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const sup = createClient()
        const { data: { user } } = await sup.auth.getUser()
        setUserId(user?.id || null)

        if (user) {
          // Fetch real profile from DB
          const { data: dbProfile } = await sup
            .from('business_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (dbProfile) {
            setProfile({
              name: dbProfile.business_name,
              type: dbProfile.business_type,
              city: dbProfile.location_name,
              country: dbProfile.location_address,
              currency: dbProfile.currency_display,
              phone: dbProfile.contact_phone
            })
          } else {
            setProfile(getBusinessProfile())
          }

          // Fetch real bookings
          const { data: bookingsData } = await sup
            .from('bookings')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: true })

          // Fetch real expenses (This Month)
          const today = new Date()
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

          const { data: expensesData } = await sup
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id)
            .gte('date', startOfMonth)
            .lte('date', endOfMonth)

          const totalExpenses = expensesData?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0
          setExpensesMonth(totalExpenses)

          if (bookingsData) {
            processBookings(bookingsData, totalExpenses)
          }
        } else {
          // Demo mode - load from localStorage
          setProfile(getBusinessProfile())

          // Load demo bookings from localStorage
          const storedBookings = localStorage.getItem('hustle_bookings')
          if (storedBookings) {
            try {
              const demoBookings = JSON.parse(storedBookings)
              // Transform to match expected format
              const transformedBookings = demoBookings.map((b: any) => ({
                id: b.id,
                date: b.date,
                time: b.time,
                status: b.status,
                client_name: b.clientName,
                service_name: b.serviceName,
                price: 0 // Demo bookings don't have prices in localStorage format
              }))
              processBookings(transformedBookings, 0) // No expenses in demo mode
            } catch (e) {
              console.error('Error loading demo bookings:', e)
            }
          }
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setMounted(true)
      }
    }

    function processBookings(data: any[], expenses: number) {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()

      // Today's stats
      const todayItems = data.filter(b => b.date === todayStr)
      setTodayBookingsCount(todayItems.length)

      // Upcoming (Future dates)
      const upcoming = data.filter(b => {
        return b.date > todayStr && (b.status === 'confirmed' || b.status === 'scheduled')
      })
      setUpcomingCount(upcoming.length)

      // Income (This Month)
      const completedMonth = data.filter(b => {
        const d = new Date(b.date)
        return b.status === 'completed' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      const income = completedMonth.reduce((sum, b) => sum + (Number(b.price) || 0), 0)
      setIncomeMonth(income)
      setNetIncomeMonth(income - expenses)

      // Upcoming List (Top 5)
      const upcomingList = data.filter(b => {
        return b.date >= todayStr && b.status !== 'cancelled' && b.status !== 'completed'
      }).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)

      setBookings(upcomingList.map(b => ({
        id: b.id,
        client: b.client_name || 'Client',
        time: b.time || 'All Day',
        date: b.date,
        status: b.status,
        service: b.service_name || 'Service',
        initials: (b.client_name || 'C').substring(0, 2).toUpperCase()
      })))

      // Chart Data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const incomeChart = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const mIndex = d.getMonth()
        const year = d.getFullYear()
        const label = months[mIndex]

        const monthTotal = data.filter(b => {
          const bd = new Date(b.date)
          return b.status === 'completed' && bd.getMonth() === mIndex && bd.getFullYear() === year
        }).reduce((sum, b) => sum + (Number(b.price) || 0), 0)

        incomeChart.push({ month: label, income: monthTotal })
      }
      setIncomeData(incomeChart)

      // Weekly Bookings Chart
      const dayOfWeek = today.getDay()
      const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - todayIndex)

      const weekData = []
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      for (let i = 0; i < 7; i++) {
        const current = new Date(startOfWeek)
        current.setDate(startOfWeek.getDate() + i)
        const dStr = current.toISOString().split('T')[0]

        const count = data.filter(b => b.date === dStr).length
        weekData.push({ day: dayNames[i], bookings: count })
      }
      setBookingsData(weekData)
    }

    load()
  }, [])

  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)

  if (!mounted) return null

  const stats = [
    {
      title: 'Total Income',
      value: formatCurrency(incomeMonth, profile?.currency || 'GHS'),
      description: 'Gross (This month)',
      icon: DollarSign,
      color: 'text-foreground'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(expensesMonth, profile?.currency || 'GHS'),
      description: 'This month',
      icon: CreditCard,
      color: 'text-red-600'
    },
    {
      title: 'Net Income',
      value: formatCurrency(netIncomeMonth, profile?.currency || 'GHS'),
      description: 'Income - Expenses',
      icon: TrendingUp,
      color: netIncomeMonth >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Upcoming',
      value: String(upcomingCount),
      description: 'Future scheduled',
      icon: Clock,
      color: 'text-foreground'
    },
  ]

  const firstName = profile?.name?.split(' ')[0] || 'there'

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Good afternoon, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button className="gap-2" asChild>
          <a href={`/book?u=${userId || ''}`} target="_blank">
            <Calendar className="size-4" />
            New Booking
          </a>
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setIsClientDialogOpen(true)}>
          <Plus className="size-4" />
          Add Client
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setIsIncomeDialogOpen(true)}>
          Record Income
        </Button>
        <ShareBookingDialog
          userId={userId || ''}
          businessName={profile?.name || 'My Business'}
        />
      </div>

      {/* Dialogs */}
      <AddClientDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onSuccess={() => {
          setProfile(getBusinessProfile())
        }}
      />
      <AddIncomeDialog
        open={isIncomeDialogOpen}
        onOpenChange={setIsIncomeDialogOpen}
        onSuccess={() => setProfile(getBusinessProfile())}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Income Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income Trend</CardTitle>
            <CardDescription>
              Your income over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                income: {
                  label: 'Income',
                  color: 'hsl(var(--chart-1))',
                },
              }}
              className="h-[200px] w-full"
            >
              <AreaChart data={incomeData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={<ChartTooltipContent labelKey="month" nameKey="income" />}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#incomeGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Bookings</CardTitle>
            <CardDescription>
              Bookings for this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                bookings: {
                  label: 'Bookings',
                  color: 'hsl(var(--chart-2))',
                },
              }}
              className="h-[200px] w-full"
            >
              <BarChart data={bookingsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={<ChartTooltipContent labelKey="day" nameKey="bookings" />}
                />
                <Bar
                  dataKey="bookings"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
          <CardDescription>Your next appointments at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {booking.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{booking.client}</p>
                      <p className="text-sm text-muted-foreground">{booking.service}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{booking.time}</p>
                      <p className="text-xs text-muted-foreground">{booking.date}</p>
                    </div>
                    <Badge
                      variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="size-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No upcoming bookings</h3>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                When clients book with you, they'll show up here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
