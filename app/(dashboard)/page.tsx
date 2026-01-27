'use client'

import { useEffect, useState } from 'react'
import { Calendar, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getBusinessProfile, isDemoMode, DEMO_DATA } from '@/lib/business-data'
import { createClient } from '@/lib/supabase/client'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AddClientDialog } from '@/components/add-client-dialog'
import { AddServiceDialog } from '@/components/add-service-dialog'
import { AddIncomeDialog } from '@/components/add-income-dialog'
import { useState as useReactState } from 'react'

export default function DashboardPage() {
  const [profile, setProfile] = useState<ReturnType<typeof getBusinessProfile>>(null)
  const [showDemo, setShowDemo] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const sup = createClient() // Need to import this or use a prop
      const { data: { user } } = await sup.auth.getUser()
      setUserId(user?.id || null)
      setProfile(getBusinessProfile())
      setShowDemo(isDemoMode())
      setMounted(true)
    }
    load()
  }, [])

  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)

  if (!mounted) return null

  const currencySymbol = profile?.currency === 'GHS' ? 'GH₵' :
    profile?.currency === 'NGN' ? '₦' :
      profile?.currency === 'KES' ? 'KSh' :
        profile?.currency === 'ZAR' ? 'R' :
          profile?.currency === 'USD' ? '$' :
            profile?.currency === 'EUR' ? '€' :
              profile?.currency === 'GBP' ? '£' : 'GH₵'

  const stats = showDemo
    ? [
      {
        title: "Today's Bookings",
        value: String(DEMO_DATA.stats.todayBookings),
        description: `${DEMO_DATA.stats.todayCompleted} completed, ${DEMO_DATA.stats.todayBookings - DEMO_DATA.stats.todayCompleted} upcoming`,
        icon: Calendar,
      },
      {
        title: 'Upcoming',
        value: String(DEMO_DATA.stats.weeklyUpcoming),
        description: 'This week',
        icon: Clock,
      },
      {
        title: 'Completed Jobs',
        value: String(DEMO_DATA.stats.monthlyCompleted),
        description: 'This month',
        icon: CheckCircle,
      },
      {
        title: 'Total Income',
        value: `${currencySymbol} ${DEMO_DATA.stats.monthlyIncome.toLocaleString()}`,
        description: 'This month',
        icon: DollarSign,
      },
    ]
    : [
      {
        title: "Today's Bookings",
        value: '0',
        description: 'No bookings yet',
        icon: Calendar,
      },
      {
        title: 'Upcoming',
        value: '0',
        description: 'This week',
        icon: Clock,
      },
      {
        title: 'Completed Jobs',
        value: '0',
        description: 'This month',
        icon: CheckCircle,
      },
      {
        title: 'Total Income',
        value: `${currencySymbol} 0`,
        description: 'This month',
        icon: DollarSign,
      },
    ]

  const upcomingBookings = showDemo ? DEMO_DATA.bookings : []

  // Chart data placeholders
  const incomeData = showDemo
    ? [
      { month: 'Jan', income: 1200 },
      { month: 'Feb', income: 1800 },
      { month: 'Mar', income: 1500 },
      { month: 'Apr', income: 2200 },
      { month: 'May', income: 2800 },
      { month: 'Jun', income: 3100 },
    ]
    : [
      { month: 'Jan', income: 0 },
      { month: 'Feb', income: 0 },
      { month: 'Mar', income: 0 },
      { month: 'Apr', income: 0 },
      { month: 'May', income: 0 },
      { month: 'Jun', income: 0 },
    ]

  const bookingsData = showDemo
    ? [
      { day: 'Mon', bookings: 3 },
      { day: 'Tue', bookings: 5 },
      { day: 'Wed', bookings: 4 },
      { day: 'Thu', bookings: 7 },
      { day: 'Fri', bookings: 6 },
      { day: 'Sat', bookings: 8 },
      { day: 'Sun', bookings: 2 },
    ]
    : [
      { day: 'Mon', bookings: 0 },
      { day: 'Tue', bookings: 0 },
      { day: 'Wed', bookings: 0 },
      { day: 'Thu', bookings: 0 },
      { day: 'Fri', bookings: 0 },
      { day: 'Sat', bookings: 0 },
      { day: 'Sun', bookings: 0 },
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
          {showDemo
            ? "Here's what's happening with your business today."
            : "Your dashboard is ready. Start by adding your first booking or client."}
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
          <CheckCircle className="size-4" />
          Add Client
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setIsIncomeDialogOpen(true)}>
          <DollarSign className="size-4" />
          Record Income
        </Button>

        <AddClientDialog
          open={isClientDialogOpen}
          onOpenChange={setIsClientDialogOpen}
          onSuccess={() => {
            // Dashboard doesn't show clients list directly, but we could refresh stats
            setProfile(getBusinessProfile())
          }}
        />
        {/* Placeholder for now, will create RecordIncomeDialog next */}
        <AddServiceDialog
          open={isIncomeDialogOpen}
          onOpenChange={setIsIncomeDialogOpen}
          onSuccess={() => setProfile(getBusinessProfile())}
        />
      </div>

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
              <div className="text-2xl font-bold">{stat.value}</div>
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
              {showDemo ? 'Your income over the last 6 months' : 'Track your income over time (demo data)'}
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
            {!showDemo && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Real data will appear here once you start tracking income
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Bookings</CardTitle>
            <CardDescription>
              {showDemo ? 'Bookings for this week' : 'Track your bookings over time (demo data)'}
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
            {!showDemo && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Real data will appear here once you start accepting bookings
              </p>
            )}
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
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
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

      {/* Quick Tips - Only show when not demo mode */}
      {!showDemo && (
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-lg">💡</span>
              </div>
              <div>
                <h3 className="font-medium">Quick Tip</h3>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  Head to the Bookings section to add your first appointment, or check out Services to manage your offerings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
