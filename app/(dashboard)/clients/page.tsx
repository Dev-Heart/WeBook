"use client"

import { useEffect, useState } from "react"
import { MoreVertical, Phone, Plus, Search, Users, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSubscription } from "@/components/subscription-provider"
import { isDemoMode, DEMO_DATA, getBusinessProfile, type Client } from "@/lib/business-data"
import { AddClientDialog } from "@/components/add-client-dialog"
import { createClient } from "@/lib/supabase/client"

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [clients, setClients] = useState<any[]>([])
  const [showDemo, setShowDemo] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const { isLocked } = useSubscription()

  const fetchClients = async () => {
    const isDemo = isDemoMode()
    setShowDemo(isDemo)

    if (isDemo) {
      setClients(DEMO_DATA.clients)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (data) {
        setClients(data.map(c => ({
          ...c,
          initials: c.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        })))
      }
    }
  }

  const fetchProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('business_profiles')
        .select('currency_display')
        .eq('user_id', user.id)
        .single()
      if (data) setProfile({ currency: data.currency_display })
    }
  }

  useEffect(() => {
    fetchClients()
    fetchProfile()
  }, [])

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currencySymbol = profile?.currency === 'zar' || profile?.currency === 'ZAR' ? 'R' :
    profile?.currency === 'ghs' || profile?.currency === 'GHS' ? 'GH₵' :
      profile?.currency === 'ngn' || profile?.currency === 'NGN' ? '₦' :
        profile?.currency === 'kes' || profile?.currency === 'KES' ? 'KSh' :
          profile?.currency === 'usd' || profile?.currency === 'USD' ? '$' :
            profile?.currency === 'eur' || profile?.currency === 'EUR' ? '€' :
              profile?.currency === 'gbp' || profile?.currency === 'GBP' ? '£' : 'GH₵'

  const statusColors = {
    new: "secondary",
    regular: "outline",
    vip: "default",
  } as const

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Keep track of your customers</p>
        </div>
        <AddClientDialog onSuccess={fetchClients} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-accent/50 flex items-center justify-center">
                <span className="text-lg">⭐</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{clients.filter(c => c.status === "vip").length}</p>
                <p className="text-sm text-muted-foreground">VIP Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-lg">🆕</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{clients.filter(c => c.status === "new").length}</p>
                <p className="text-sm text-muted-foreground">New This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Clients Table */}
      {filteredClients.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Visits</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Visit</TableHead>
                  <TableHead className="hidden md:table-cell">Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {client.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="size-3 text-muted-foreground" />
                          {client.phone}
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="size-3" />
                            {client.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{client.totalVisits || client.visits || 0}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{client.lastVisit}</TableCell>
                    <TableCell className="hidden md:table-cell font-medium">{currencySymbol} {client.totalSpent || 0}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[client.status as keyof typeof statusColors] || "outline"} className="capitalize">
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Book appointment</DropdownMenuItem>
                          <DropdownMenuItem>Call client</DropdownMenuItem>
                          <DropdownMenuItem>Edit details</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="size-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No clients found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Add your first client to get started"}
            </p>
            {!searchQuery && (
              <p className="mt-4 text-sm text-muted-foreground">
                Click the "Add Client" button above to get started.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
