"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  DollarSign,
  Settings,
  Menu,
  Clock,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Bookings",
    href: "/bookings",
    icon: Calendar,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Services",
    href: "/services",
    icon: Scissors,
  },
  {
    title: "Availability",
    href: "/availability",
    icon: Clock,
  },
  {
    title: "Income",
    href: "/income",
    icon: DollarSign,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getBusinessProfile, isDemoMode } from "@/lib/business-data"
import { useEffect, useState } from "react"

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    setProfile(getBusinessProfile())
  }, [])

  const businessName = profile?.name || (isDemoMode() ? "Demo Business" : "My Business")
  const businessType = profile?.type || (isDemoMode() ? "Professional" : "Entrepreneur")
  const initials = businessName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">{businessName[0]}</span>
          </div>
          <span className={`text-xl font-semibold tracking-tight transition-opacity duration-200 ${state === "collapsed" ? "opacity-0" : "opacity-100"}`}>
            {businessName}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className={`flex items-center gap-3 ${state === "collapsed" ? "justify-center" : ""}`}>
          <Avatar className="size-9">
            <AvatarFallback className="bg-accent text-accent-foreground font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={`flex-1 transition-opacity duration-200 ${state === "collapsed" ? "hidden" : "block"}`}>
            <p className="text-sm font-medium leading-tight">{businessName}</p>
            <p className="text-xs text-muted-foreground">{businessType}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export function MobileHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-sm font-bold">W</span>
        </div>
        <span className="text-lg font-semibold">WeBook</span>
      </div>
    </header>
  )
}
