# MyVerse - Personal Productivity Dashboard

## Overview

MyVerse is a comprehensive personal productivity dashboard that combines study resources, entertainment, health tracking, and productivity tools into a unified platform. Built as a full-stack web application with React frontend and Express backend, it provides users with a personalized workspace to manage various aspects of their digital life.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: Zustand for global state, React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Development**: Hot reloading with Vite integration

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migration Strategy**: Push-based schema updates via `drizzle-kit push`

## Key Components

### User Management
- **Authentication**: Simple email-based login system
- **Profile Customization**: Avatar, daily quotes, portfolio links, themes
- **Focus Mode**: Distraction-free interface toggle

### Study Zone
- **Resource Types**: YouTube videos, personal notes, external resources
- **Organization**: Folder-based categorization system
- **Content Management**: CRUD operations for study materials

### Gaming Section
- **Mini-Games**: Memory Match, 15-Puzzle, Quiz games
- **Scoring System**: Points and star ratings with persistence
- **Performance Tracking**: Game completion statistics

### Music Integration
- **Multi-Platform**: Support for Spotify, YouTube, and local music
- **Playlist Management**: Create and organize music collections
- **Quick Access**: Embedded player controls

### Health & Fitness
- **Gym Exercises**: Muscle group categorization and workout tracking
- **Health Metrics**: Weight, mood, sleep, and custom data points
- **Progress Visualization**: Charts and trends over time

### Entertainment Hub
- **Media Tracking**: Movies, TV shows, books, podcasts
- **Status Management**: To-watch, watching, completed lists
- **Rating System**: Personal ratings and reviews

### Productivity Tools
- **Document Vault**: File storage and organization
- **AI Tools Library**: Curated collection of AI applications
- **Quick Shortcuts**: Customizable productivity shortcuts
- **Performance Dashboard**: Analytics and productivity metrics

## Data Flow

### Client-Server Communication
1. **API Layer**: RESTful endpoints under `/api` prefix
2. **Request Handling**: Express middleware for logging and error handling
3. **Data Validation**: Zod schemas for request/response validation
4. **Query Management**: React Query for caching and synchronization

### State Management
1. **Local State**: React hooks for component-level state
2. **Global State**: Zustand store for user preferences and UI state
3. **Server State**: React Query for API data with automatic cache invalidation
4. **Persistence**: LocalStorage for user session and preferences

### Database Operations
1. **Connection**: Neon serverless PostgreSQL via connection string
2. **Queries**: Drizzle ORM with type-safe query builder
3. **Transactions**: Atomic operations for complex data changes
4. **Schema Evolution**: Version-controlled schema changes

## External Dependencies

### Core Technologies
- **React Ecosystem**: React 18, React DOM, React Query
- **UI Framework**: Radix UI primitives, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Development**: Vite, TypeScript, ESBuild

### Utility Libraries
- **Form Handling**: React Hook Form with Zod validation
- **Date Management**: date-fns for date manipulations
- **Icons**: Lucide React for consistent iconography
- **Animations**: CSS-based transitions and animations
- **Carousels**: Embla Carousel for media galleries

### Development Tools
- **Bundling**: Vite for development and production builds
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint, Prettier (implied by structure)
- **Database Tools**: Drizzle Kit for schema management

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Neon development instance
- **Port Configuration**: Frontend on Vite default, backend on configurable port
- **Hot Reloading**: Full-stack development with file watching

### Production Build
- **Frontend Build**: Vite production build to `dist/public`
- **Backend Build**: ESBuild compilation to `dist/index.js`
- **Static Assets**: Served by Express in production
- **Environment Variables**: Database connection and API keys

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Run Command**: `npm run dev` for development
- **Build Process**: `npm run build` for production assets
- **Auto-scaling**: Configured for Replit's autoscale deployment

### Database Management
- **Connection**: Environment-based DATABASE_URL
- **Schema Sync**: `npm run db:push` for schema updates
- **Migrations**: Located in `./migrations` directory
- **Backup Strategy**: Managed by Neon Database service

## Changelog

```
Changelog:
- June 20, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```