"use client"

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

const weeklyData = [
  { day: "Mon", income: 185 },
  { day: "Tue", income: 320 },
  { day: "Wed", income: 275 },
  { day: "Thu", income: 410 },
  { day: "Fri", income: 520 },
  { day: "Sat", income: 680 },
  { day: "Sun", income: 60 },
]

const recentTransactions = [
  {
    id: 1,
    client: "Ama Mensah",
    service: "Braids",
    amount: "GH₵ 150",
    date: "Today, 2:00 PM",
    status: "received",
  },
  {
    id: 2,
    client: "Kofi Adu",
    service: "Haircut",
    amount: "GH₵ 35",
    date: "Today, 11:00 AM",
    status: "received",
  },
  {
    id: 3,
    client: "Akua Serwaa",
    service: "Braids",
    amount: "GH₵ 200",
    date: "Yesterday",
    status: "received",
  },
  {
    id: 4,
    client: "Yaw Boateng",
    service: "Beard Trim",
    amount: "GH₵ 25",
    date: "Yesterday",
    status: "received",
  },
  {
    id: 5,
    client: "Adwoa Poku",
    service: "Wash & Set",
    amount: "GH₵ 80",
    date: "3 days ago",
    status: "received",
  },
]

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function IncomePage() {
  const totalThisWeek = weeklyData.reduce((sum, day) => sum + day.income, 0)
  const avgDaily = Math.round(totalThisWeek / 7)

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
            <div className="text-2xl font-bold">GH₵ {totalThisWeek.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUp className="size-3 text-chart-1" />
              <span className="text-xs text-chart-1 font-medium">12%</span>
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
            <div className="text-2xl font-bold">GH₵ 2,450</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUp className="size-3 text-chart-1" />
              <span className="text-xs text-chart-1 font-medium">8%</span>
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
            <div className="text-2xl font-bold">GH₵ {avgDaily}</div>
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
            <div className="text-2xl font-bold">24</div>
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
                tickFormatter={(value) => `₵${value}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent labelKey="day" nameKey="income" formatter={(value) => `GH₵ ${value}`} />}
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
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{transaction.client}</p>
                  <p className="text-sm text-muted-foreground">{transaction.service}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-chart-1">{transaction.amount}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State for when no data */}
      {recentTransactions.length === 0 && (
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
