# RatPlace Marketplace Application

## Overview

RatPlace is a marketplace platform for distributing software programs and announcements. The application provides a public-facing marketplace where users can browse programs by category, view detailed program information, and access announcements. An admin panel allows authorized users to manage programs, announcements, and other administrative settings.

The application is built with Next.js 14 (App Router), deployed on Vercel, and originally generated through v0.app. It features a modern, responsive UI with dark/light theme support and uses Supabase for backend data storage and authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14 with App Router and React Server Components
- The application uses the modern App Router pattern (`app/` directory)
- Pages are organized with route groups: root marketplace (`/`), admin panel (`/admin`), and dynamic program details (`/program/[id]`)
- Client-side interactivity is handled through "use client" components while maintaining server-side rendering where beneficial

**UI Component System**: shadcn/ui with Radix UI primitives
- Follows the "New York" style variant from shadcn/ui
- Uses Radix UI components for accessibility (dialogs, dropdowns, selects, checkboxes, etc.)
- Custom theming system with CSS variables using OKLCH color space for better color perception
- Tailwind CSS for styling with custom configuration in `components.json`

**State Management**: React hooks with local component state
- No global state management library (Redux, Zustand, etc.) is used
- Component-level state via `useState` for UI interactions
- Data fetching happens in individual components with `useEffect`

**Theme System**: Custom dark/light mode implementation
- Manual theme toggle stored in localStorage
- Includes an "easter egg" rainbow theme activated by rapid clicking
- Theme classes applied at document root level
- Uses CSS custom properties for consistent theming across components

### Backend Architecture

**Database & Backend**: Supabase
- Acts as the primary backend service providing PostgreSQL database, authentication, and real-time capabilities
- Client and server-side Supabase clients are separated (`lib/supabase/client.ts` and `lib/supabase/server.ts`)
- Server client uses cookie-based session management for SSR compatibility

**Data Models**:
- **Programs**: Main marketplace items with fields for title, descriptions (short/long), category, pricing, media (images/videos), file URLs, and creator information
- **Announcements**: News/updates with title, content, creator, and timestamp
- **Admins**: User management table with username, password (stored as plain text - security concern), and super admin flag
- **Settings**: Key-value configuration store (e.g., Discord invite link)

**Authentication**: Custom client-side authentication system
- Uses a combination of hardcoded credentials (`VALID_USERS` in `lib/auth.ts`) and database-stored admin accounts
- Admin credentials validated against both hardcoded users and Supabase `admins` table
- Session persistence via localStorage (browser-based, not secure for production)
- Role-based access with "super admin" designation for elevated privileges
- **Security Issue**: Passwords are stored and compared in plain text, which is a significant security vulnerability

**API Pattern**: Direct Supabase client queries from components
- No dedicated API routes or backend endpoints
- Components directly query Supabase using the JavaScript client
- Data fetching happens client-side with real-time subscription capabilities available but not currently utilized

### Design Patterns

**Component Organization**:
- Page components (`app/**page.tsx`) act as route handlers and render client components
- Business logic components (`components/*-client.tsx`) handle data fetching and user interactions
- UI primitives (`components/ui/*.tsx`) are reusable, styled components
- Clear separation between page routing and component logic

**Category System**: 
- Fixed categories: "rats", "cracked", "free", "paid", "crypters", "malware", "binders"
- Categories used for filtering and organization throughout the marketplace
- Multiple category selection supported in the UI

**File Upload Pattern**:
- Files (images, videos, program files) are referenced by URL strings
- No direct file upload implementation visible - likely handled externally or via Supabase Storage (not shown in code)

## External Dependencies

### Core Framework Dependencies
- **Next.js**: React framework for server-side rendering and routing
- **React**: UI library (version managed by Next.js)
- **TypeScript**: Type safety throughout the application

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **shadcn/ui**: Component collection built on Radix UI
- **Radix UI**: Unstyled, accessible component primitives (dialogs, dropdowns, checkboxes, selects, etc.)
- **class-variance-authority**: Utility for managing component variants
- **clsx & tailwind-merge**: Class name utilities
- **Lucide React**: Icon library (Sun, Moon, Search, Trash, Edit icons, etc.)
- **Geist & Geist Mono fonts**: Typography from Vercel

### Backend Services
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`): 
  - PostgreSQL database hosting
  - Real-time subscriptions (capability available, not actively used)
  - Authentication infrastructure (available but using custom auth instead)
  - Row Level Security policies (not visible in code, may or may not be configured)

### Additional Libraries
- **React Hook Form** (`@hookform/resolvers`): Form validation and management
- **date-fns**: Date formatting and manipulation
- **embla-carousel-react**: Carousel/slider functionality
- **input-otp**: OTP input component
- **cmdk**: Command menu component

### Analytics & Deployment
- **Vercel Analytics** (`@vercel/analytics`): Usage analytics for production deployment
- **Vercel Platform**: Hosting and deployment infrastructure

### Development Tools
- **ESLint**: Code linting
- **PostCSS & Autoprefixer**: CSS processing

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous/public API key

### Security Considerations
- Authentication system stores passwords in plain text (major vulnerability)
- Admin access controlled via localStorage (not secure, easily bypassed)
- No apparent rate limiting or CSRF protection
- Direct client-side database queries could expose sensitive operations if Row Level Security is not properly configured in Supabase