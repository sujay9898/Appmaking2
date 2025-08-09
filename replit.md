# Overview

MovieWatch is a personal movie watchlist application that helps users manage their movies to watch and receive email reminders. The application allows users to search for movies using The Movie Database (TMDB) API, add them to their watchlist with custom reminder dates and times, and receive automated email notifications when it's time to watch. Built as a full-stack web application with a React frontend and Express.js backend, it provides a clean, modern interface for movie management with real-time scheduling capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod for runtime type validation
- **Storage**: In-memory storage with interface for database abstraction
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution in development

## Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema**: Movie entities with TMDB integration fields (tmdbId, title, posterPath, releaseYear)
- **Reminder System**: Date and time fields for scheduling with user email association
- **Migration**: Drizzle Kit for database schema management and migrations

## Authentication and Authorization
- **Current State**: No authentication system implemented (uses email field per movie)
- **Session Storage**: PostgreSQL-based session store configured but not actively used
- **Future Consideration**: Ready for session-based authentication implementation

## Background Services
- **Reminder Scheduler**: Cron-based job system that runs every minute to check for due reminders
- **Email Service**: Nodemailer integration with Gmail SMTP for automated reminder emails
- **Service Architecture**: Modular service pattern for easy testing and maintenance

## External Dependencies
- **TMDB API**: Movie search and metadata retrieval with poster image handling
- **Gmail SMTP**: Email delivery service for reminder notifications
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Replit Integration**: Development environment with live reload and error handling
- **CDN Dependencies**: Font Awesome for icons, Google Fonts for typography

## Development and Deployment
- **Monorepo Structure**: Shared schema between client and server with path aliases
- **Hot Reload**: Vite development server with Express.js integration
- **Error Handling**: Comprehensive error boundaries and API error management
- **Build Process**: Separate client and server builds with esbuild for server bundling
- **Environment**: Support for both development and production configurations

## Recent Enhancements (August 2025)
- **Disabled Auto-Feed Posts**: Removed automatic feed post creation when adding movies to watchlist
- **UI Improvements**: Reduced card corner radius for less curved appearance  
- **Duplicate Content Fix**: Resolved issue where post content appeared twice in feed
- **Create Post Enhancement**: Improved "Write About Movies" modal with clearer messaging
- **Feed Separation**: Watchlist and feed are now completely separate features