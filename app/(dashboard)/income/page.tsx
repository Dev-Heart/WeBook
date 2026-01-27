"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, DollarSign, TrendingUp, Calendar } from "lucide-react"
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
import { isDemoMode, DEMO_DATA, getBusinessProfile, getBookings } from "@/lib/business-data"

export default function IncomePage() {
  const [showDemo, setShowDemo] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const isDemo = isDemoMode()
    setShowDemo(isDemo)
    setProfile(getBusinessProfile())

    if (isDemo) {
      // For demo, we don't have a specific transactions array in DEMO_DATA yet
      // but we can map demo bookings
      setTransactions((DEMO_DATA as any).bookings?.map((b: any) => ({
        id: b.id,
        client: b.client,
        service: b.service,
        amount: `${profile?.currency === 'GHS' ? 'GH₵' : '$'} ${b.price}`,
        date: b.date,
        status: "received"
      })) || [])
    } else {
      const bookings = getBookings()
      setTransactions(bookings.filter(b => b.status === 'completed').map(b => ({
        id: b.id,
        client: b.clientName,
        service: b.serviceName,
        amount: b.notes?.includes('price:') ? b.notes.split('price:')[1].trim() : "0", // Fallback logic
        date: b.date,
        status: "received"
      })))
    }
  }, [profile])

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

  const weeklyData = showDemo ? demoWeeklyData : []
  const totalThisWeek = weeklyData.reduce((sum, day) => sum + day.income, 0)
  const avgDaily = weeklyData.length > 0 ? Math.round(totalThisWeek / weeklyData.length) : 0

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
            <DollarSign className="size-4 text-muted-foreground" />
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
            <DollarSign className="size-12 mx-auto text-muted-foreground/50" />
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
