# Release Log: Stability & Logic Fixes (v1.1.0)

This release focuses on aligning the application with core product rules and fixing critical UX bugs.

## Achievements

### 1. Dashboard & Quick Actions
- **Fixed "Add Client" button**: Now correctly opens the manual client creation dialog.
- **Fixed "Record Income" button**: Implemented a new `AddIncomeDialog` that records payments directly into the database.
- **Trial Awareness**: Both actions are fully enabled during the 30-day free trial.

### 2. Booking Resolution & Public Page
- **Dynamic Booking Links**: Fixed the "Business Not Found" error by appending the `u` (userId) parameter to booking links.
- **Improved Resolution Logic**: The `/book` page now robustly identifies the business owner even when external visitors access it.
- **End-to-End Booking**: Verified that customer bookings create client records and save to Supabase correctly.

### 3. Stability & Crashes
- **Income Page**: Fixed a client-side crash caused by hydration mismatches and missing data checks.
- **Availability Settings**: Improved error handling and logging for save operations.
- **UI Cleanup**: Removed duplicate "Add Client" buttons and ensured consistent state management for modals.

### 4. Logic Alignment
- **Free Trial**: Confirmed 30-day full access for all new users.
- **Demo Data Isolation**: Reinforced isolation; demo data only appears in explicit "Demo Mode".
- **Source of Truth**: Ensured Supabase is the primary source of truth for bookings, clients, and settings.

## Technical Details
- Added `"use client"` where missing.
- Refactored dialogs to support controlled state.
- Integrated `createBooking` and `checkBookingAvailability` server actions.
- Added hydration protection to data-heavy pages.
