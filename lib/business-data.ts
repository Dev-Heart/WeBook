'use client'

export interface BusinessProfile {
  name: string
  type: string
  city: string
  country: string
  currency: string
  phone?: string
}

export interface Service {
  id: string
  name: string
  price: number
  duration: number
  category?: string
  active: boolean
}

export interface Preferences {
  currencyDisplay: string
  taxMode: 'inclusive' | 'exclusive'
  whatsappNotifications: boolean
  bookingConfirmationRequired: boolean
  softReminders: boolean
}

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  visits: number
  totalSpent: number
  lastVisit?: string
  vip: boolean
  createdAt: string
}

export interface Booking {
  id: string
  clientId: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceId: string
  serviceName: string
  date: string
  time: string
  notes?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

export interface OnboardingData {
  completed: boolean
  profile?: BusinessProfile
  services: Service[]
  preferences: Preferences
  isDemoMode: boolean
}

const STORAGE_KEY = 'hustle_onboarding'

export function getOnboardingData(): OnboardingData | null {
  if (typeof window === 'undefined') return null
  
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return null
  
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function saveOnboardingData(data: OnboardingData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function isOnboardingComplete(): boolean {
  const data = getOnboardingData()
  return data?.completed === true
}

export function getBusinessProfile(): BusinessProfile | null {
  const data = getOnboardingData()
  return data?.profile || null
}

export function getServices(): Service[] {
  const data = getOnboardingData()
  return data?.services || []
}

export function getPreferences(): Preferences {
  const data = getOnboardingData()
  return data?.preferences || {
    currencyDisplay: 'symbol',
    taxMode: 'inclusive',
    whatsappNotifications: true,
    bookingConfirmationRequired: true,
    softReminders: true,
  }
}

export function isDemoMode(): boolean {
  const data = getOnboardingData()
  return data?.isDemoMode === true
}

// Bookings management
const BOOKINGS_KEY = 'hustle_bookings'
const CLIENTS_KEY = 'hustle_clients'

export function getBookings(): Booking[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(BOOKINGS_KEY)
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function saveBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Booking {
  const bookings = getBookings()
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  bookings.push(newBooking)
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
  return newBooking
}

export function getClients(): Client[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(CLIENTS_KEY)
  if (!data) return []
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function saveClient(clientData: { name: string; phone: string; email?: string }): Client {
  const clients = getClients()
  
  // Check if client exists by phone
  const existingClient = clients.find(c => c.phone === clientData.phone)
  if (existingClient) {
    existingClient.visits += 1
    existingClient.lastVisit = new Date().toLocaleDateString()
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
    return existingClient
  }
  
  // Create new client
  const newClient: Client = {
    id: Date.now().toString(),
    name: clientData.name,
    phone: clientData.phone,
    email: clientData.email,
    visits: 1,
    totalSpent: 0,
    vip: false,
    createdAt: new Date().toISOString(),
  }
  clients.push(newClient)
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
  return newClient
}

export function getActiveServices(): Service[] {
  return getServices().filter(s => s.active)
}

// Demo data
export const DEMO_DATA = {
  bookings: [
    {
      id: '1',
      client: 'Ama Mensah',
      initials: 'AM',
      service: 'Braids',
      time: '2:00 PM',
      date: 'Today',
      status: 'confirmed',
      price: 150,
    },
    {
      id: '2',
      client: 'Kwame Asante',
      initials: 'KA',
      service: 'Haircut',
      time: '10:00 AM',
      date: 'Tomorrow',
      status: 'confirmed',
      price: 50,
    },
    {
      id: '3',
      client: 'Efua Darko',
      initials: 'ED',
      service: 'Relaxer + Style',
      time: '1:30 PM',
      date: 'Tomorrow',
      status: 'pending',
      price: 200,
    },
    {
      id: '4',
      client: 'Yaw Boateng',
      initials: 'YB',
      service: 'Beard Trim',
      time: '9:00 AM',
      date: 'Wed, 29 Jan',
      status: 'confirmed',
      price: 30,
    },
  ],
  clients: [
    {
      id: '1',
      name: 'Ama Mensah',
      initials: 'AM',
      phone: '+233 24 123 4567',
      visits: 12,
      totalSpent: 1800,
      lastVisit: '3 days ago',
      vip: true,
    },
    {
      id: '2',
      name: 'Kwame Asante',
      initials: 'KA',
      phone: '+233 20 987 6543',
      visits: 8,
      totalSpent: 400,
      lastVisit: '1 week ago',
      vip: false,
    },
    {
      id: '3',
      name: 'Efua Darko',
      initials: 'ED',
      phone: '+233 55 234 5678',
      visits: 15,
      totalSpent: 3000,
      lastVisit: '2 days ago',
      vip: true,
    },
  ],
  stats: {
    todayBookings: 3,
    todayCompleted: 2,
    weeklyUpcoming: 7,
    monthlyCompleted: 24,
    monthlyIncome: 2450,
  },
}
