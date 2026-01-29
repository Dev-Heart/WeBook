"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Wallet, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { isDemoMode, DEMO_DATA, getBusinessProfile } from "@/lib/business-data"

export default function IncomePage() {
  const [showDemo, setShowDemo] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [totalIncome, setTotalIncome] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        const isDemo = isDemoMode()
        setShowDemo(isDemo)
        const currentProfile = getBusinessProfile()
        setProfile(currentProfile)

        if (isDemo) {
          const bookings = (DEMO_DATA as any).bookings || []
          setTransactions(bookings.map((b: any) => ({
            id: b.id,
            client: b.client,
            service: b.service,
            amount: `${currentProfile?.currency === 'GHS' ? 'GH₵' : '$'} ${b.price}`,
            date: b.date,
            status: "received"
          })))
        } else {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            const { data: bookings } = await supabase
              .from('bookings')
              .select('*')
              .eq('user_id', user.id)
              .eq('status', 'completed')
              .order('date', { ascending: false })

            if (bookings) {
              // 1. Transactions List (Top 10)
              setTransactions(bookings.slice(0, 10).map(b => ({
                id: b.id,
                client: b.client_name || 'Client',
                service: b.service_name || 'Service',
                amount: b.price || 0,
                date: b.date,
                status: 'received'
              })))

              // 2. Calculate Weekly Data
              const today = new Date()
              const dayOfWeek = today.getDay()
              const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

              const startOfWeek = new Date(today)
              startOfWeek.setDate(today.getDate() - todayIndex)
              startOfWeek.setHours(0, 0, 0, 0)

              const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
              const weeklyStats = days.map((day, index) => {
                const targetDate = new Date(startOfWeek)
                targetDate.setDate(startOfWeek.getDate() + index)
                const dateStr = targetDate.toISOString().split('T')[0]

                const dayIncome = bookings
                  .filter(b => b.date === dateStr)
                  .reduce((sum, b) => sum + (Number(b.price) || 0), 0)

                return { day, income: dayIncome }
              })
              setWeeklyDataState(weeklyStats)

              // 3. Totals
              const thisWeekTotal = bookings.filter(b => {
                const d = new Date(b.date)
                return d >= startOfWeek
              }).reduce((sum, b) => sum + (Number(b.price) || 0), 0)
              setTotalThisWeekState(thisWeekTotal)

              const thisMonthTotal = bookings.filter(b => {
                const d = new Date(b.date)
                return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
              }).reduce((sum, b) => sum + (Number(b.price) || 0), 0)
              setTotalThisMonthState(thisMonthTotal)

              setJobsCompletedState(bookings.filter(b => {
                const d = new Date(b.date)
                return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
              }).length)
            }
          }
        }
      } catch (error) {
        console.error('Error loading income data:', error)
      } finally {
        setMounted(true)
      }
    }
    loadData()
  }, [])

  const [weeklyDataState, setWeeklyDataState] = useState<any[]>([])
  const [totalThisWeekState, setTotalThisWeekState] = useState(0)
  const [totalThisMonthState, setTotalThisMonthState] = useState(0)
  const [jobsCompletedState, setJobsCompletedState] = useState(0)

  if (!mounted) return null

  const currencySymbol = profile?.currency === 'GHS' ? 'GH₵' :
    profile?.currency === 'NGN' ? '₦' :
      profile?.currency === 'KES' ? 'KSh' :
        profile?.currency === 'ZAR' ? 'R' :
          profile?.currency === 'USD' ? '$' :
            profile?.currency === 'EUR' ? '€' :
              profile?.currency === 'GBP' ? '£' :
                profile?.currency === 'CAD' ? 'C$' :
                  profile?.currency === 'AUD' ? 'A$' :
                    profile?.currency === 'JPY' ? '¥' :
                      profile?.currency === 'CNY' ? '¥' :
                        profile?.currency === 'INR' ? '₹' : '$'

  const demoWeeklyData = [
    { day: "Mon", income: 185 },
    { day: "Tue", income: 320 },
    { day: "Wed", income: 275 },
    { day: "Thu", income: 410 },
    { day: "Fri", income: 520 },
    { day: "Sat", income: 680 },
    { day: "Sun", income: 60 },
  ]

  const weeklyData = showDemo ? demoWeeklyData : (weeklyDataState || [])
  const totalThisWeek = showDemo ? demoWeeklyData.reduce((sum, day) => sum + day.income, 0) : (totalThisWeekState || 0)
  const daysInWeek = new Date().getDay() || 7
  const avgDaily = weeklyData.length > 0 ? Math.round(totalThisWeek / (showDemo ? 7 : daysInWeek)) : 0

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Income</h1>
          <p className="text-muted-foreground">Track your earnings and payments</p>
        </div>
        <Select defaultValue="this-week">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol} {totalThisWeek.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUp className="size-3 text-chart-1" />
              <span className="text-xs text-chart-1 font-medium">0%</span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol} {showDemo ? "2,450" : "0"}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUp className="size-3 text-chart-1" />
              <span className="text-xs text-chart-1 font-medium">0%</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Average
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol} {avgDaily}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jobs Completed
            </CardTitle>
            <span className="text-sm">✓</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{showDemo ? "24" : "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Earnings</CardTitle>
          <CardDescription>Your income for the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                tickFormatter={(value) => `${currencySymbol}${value}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent labelKey="day" nameKey="income" formatter={(value) => `${currencySymbol} ${value}`} />}
              />
              <Bar
                dataKey="income"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Your latest received payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length > 0 ? transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{transaction.client}</p>
                  <p className="text-sm text-muted-foreground">{transaction.service}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-chart-1">{transaction.amount.includes(currencySymbol) ? transaction.amount : `${currencySymbol} ${transaction.amount}`}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent payments found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Empty State for when no data */}
      {transactions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="size-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No income recorded yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              When you complete jobs and receive payments, they'll appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
