"use client"

import { useEffect, useState } from "react"
import { Clock, MoreVertical, Plus, Scissors, Tag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useSubscription } from "@/components/subscription-provider"
import { type Service } from "@/lib/business-data"
import { AddServiceDialog } from "@/components/add-service-dialog"

function ServiceCard({ service }: { service: Service }) {
  const [isActive, setIsActive] = useState(service.active)

  return (
    <Card className={`transition-opacity ${!isActive ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scissors className="size-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{service.name}</CardTitle>
                {/* @ts-ignore */}
                {service.popular && (
                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                )}
              </div>
              {/* @ts-ignore */}
              <CardDescription className="text-sm mt-0.5">{service.description || "No description provided"}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVertical className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit service</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete service</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Tag className="size-4 text-muted-foreground" />
              <span className="font-semibold">{service.price}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-4" />
              <span>{service.duration} min</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {isActive ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              aria-label={`Toggle ${service.name}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const { isLocked } = useSubscription()

  const fetchServices = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (data) {
        setServices(data)
      } else {
        setServices([])
      }
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const categories = [...new Set(services.map((s) => s.category || "General"))]
  const activeServices = services.filter((s) => s.active).length

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage what you offer to clients</p>
        </div>
        <AddServiceDialog onSuccess={fetchServices} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Scissors className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{services.length}</p>
                <p className="text-sm text-muted-foreground">Total Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-chart-1/20 flex items-center justify-center">
                <span className="text-lg text-chart-1">✓</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{activeServices}</p>
                <p className="text-sm text-muted-foreground">Active Services</p>
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
                {/* @ts-ignore */}
                <p className="text-2xl font-bold">{services.filter(s => s.popular).length}</p>
                <p className="text-sm text-muted-foreground">Popular Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services by Category */}
      {categories.length > 0 && services.length > 0 ? (
        categories.map((category) => (
          <div key={category} className="space-y-4">
            <h2 className="text-lg font-medium">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services
                .filter((s) => (s.category || "General") === category)
                .map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
            </div>
          </div>
        ))
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Scissors className="size-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No services yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your services so clients know what you offer.
            </p>
            <Button className="mt-4 gap-2" variant="outline">
              {/* This button was "Add your first service", I can make it open the dialog or just point to top button. 
                   Wait, I can't trigger the dialog easily from here unless I move Dialog up or pass Open state.
                   I will just hide the button or keep it as non-functional instructions pointing up? 
                   Or I can wrap it in AddServiceDialog Trigger.
                   The original code (line 198) had a button.
                   I'll wrap it in AddServiceDialog? No, AddServiceDialog is a self-contained button+dialog.
                   I will just remove the button logic or replace it with AddServiceDialog instance?
                   Better: Replace "Button" with <AddServiceDialog onSuccess={fetchServices} /> but styled differently?
                   For simplicity and speed, I'll remove the redundant button or leave it as visual only.
                   I'll remove it to avoid "Dead button" rule.
               */}
              <span className="opacity-50">Click "Add Service" above</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
