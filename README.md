# WeBook - Business Management for Solo Entrepreneurs

WeBook is a simple, human-centered business management app designed specifically for solo entrepreneurs in service-based businesses like hairstylists, barbers, nail technicians, and freelancers. Built with a focus on African markets, WeBook provides essential tools to manage your business without complexity or stress.

## Features

### Core Features
- **Dashboard** - Get a quick overview of your business with summary cards, charts, and upcoming appointments
- **Bookings Management** - Track scheduled, confirmed, completed, and cancelled appointments
- **Client Management** - Store client information, track visits, spending, and VIP status
- **Services Management** - Create and organize your service offerings with pricing, duration, and categories
- **Availability Settings** - Set your working hours for each day of the week with customizable time slots
- **Income Tracking** - Monitor your earnings with visual charts and payment history
- **Settings** - Configure your business profile, preferences, and notifications

### Public Features
- **Public Booking Page** (`/book`) - Share-able link for clients to book appointments directly
- **Real-time Availability** - Clients only see actually available time slots based on your schedule
- **Smart Booking** - Automatically prevents double-bookings and respects buffer times

### Technical Features
- **Supabase Integration** - Real database with Row Level Security (RLS)
- **Offline-first Ready** - Foundation for progressive web app capabilities
- **Multi-currency Support** - GHS, NGN, KES, ZAR, USD, EUR, GBP, CAD, AUD, JPY, CNY, INR
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- **Dark Mode Support** - Automatic theme switching based on system preferences

## Getting Started

### First Time Setup

1. **Launch the app** - On first visit, you'll see the onboarding wizard
2. **Complete 5 simple steps**:
   - Welcome & choose demo mode or fresh start
   - Set up your business profile (name, type, location, currency)
   - Add your services (or use pre-filled examples)
   - Set your working hours
   - Configure preferences (notifications, language)
3. **Start managing your business** - Access your dashboard and all features

### Share Your Booking Page

1. Go to **Bookings** page
2. Copy the booking link at the top
3. Share with clients via WhatsApp, SMS, or social media
4. Clients can book directly without logging in

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (ready for future user accounts)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
webook/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── availability/     # Working hours settings
│   │   ├── bookings/         # Bookings management
│   │   ├── clients/          # Client database
│   │   ├── income/           # Income tracking
│   │   ├── services/         # Services management
│   │   ├── settings/         # App settings
│   │   └── page.tsx          # Dashboard home
│   ├── book/                 # Public booking page
│   ├── layout.tsx            # Root layout with onboarding gate
│   └── globals.css           # Global styles & theme tokens
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── app-sidebar.tsx       # Main navigation sidebar
│   ├── onboarding-wizard.tsx # First-time setup wizard
│   └── onboarding-gate.tsx   # Onboarding check wrapper
├── lib/
│   ├── business-data.ts      # Business data utilities
│   └── supabase/             # Supabase client setup
├── scripts/
│   └── setup-database.sql    # Database schema
└── middleware.ts             # Supabase auth middleware
```

## Database Schema

### Tables
- **business_profiles** - Store business information for each user
- **services** - Service offerings with pricing and duration
- **availability_settings** - Working hours per day of week
- **clients** - Client contact info and visit history
- **bookings** - Appointment records with status tracking

All tables include Row Level Security policies to ensure data privacy.

## Design Philosophy

### Africa-First Design
- Simple, clear language (no jargon)
- Support for local currencies
- Optimized for mobile-first usage
- Works with intermittent connectivity (foundation for offline mode)

### Calm & Trustworthy
- Warm color palette (soft teal, cream, beige)
- Generous spacing and readable typography
- Friendly empty states and helpful guidance
- No overwhelming dashboards or complex UI

### Progressive Enhancement
- Works without authentication (localStorage for now)
- Ready for user accounts and authentication
- Foundation for offline-first PWA
- Can scale to multi-user scenarios

## Environment Variables

When deploying or developing, ensure these variables are set:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Roadmap

### Planned Features
- [ ] User authentication and multi-device sync
- [ ] WhatsApp integration for booking confirmations
- [ ] SMS reminders for appointments
- [ ] Payment tracking and invoicing
- [ ] Client notes and preferences
- [ ] Recurring appointments
- [ ] Analytics and insights
- [ ] Multi-location support
- [ ] Team member management
- [ ] Progressive Web App (PWA) for offline use

## Support

For questions, issues, or feature requests, please contact support or open an issue in the repository.

## License

Copyright © 2026 WeBook. All rights reserved.

---

**Made with care for African entrepreneurs** ❤️
