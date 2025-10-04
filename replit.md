# Replit.md - Market Intelligence Platform

## Overview

This platform is a comprehensive market intelligence and startup ecosystem tracker designed for investors, founders, and analysts. It provides structured, real-time insights into startups, funding rounds, rankings, and investment opportunities through a modern web application built with TypeScript, React, and PostgreSQL.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth for user management
- **File Storage**: Supabase Storage for images and assets
- **API Design**: RESTful endpoints with structured error handling

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: Neon Database (serverless PostgreSQL)
- **Schema**: Comprehensive schema covering multiple data domains:
  - User management (authentication, roles)
  - Company data (startups, growth companies, franchises, VCs)
  - Funding ecosystem (rounds, exits, M&A deals, unicorns)
  - Investment network (investors, accelerators, incubators)
  - Market intelligence (events, grants, rankings, sanctions)

## Key Components

### Authentication System
- **Provider**: Supabase Auth with email/password and OAuth
- **Session Management**: JWT tokens with refresh token rotation
- **Role-Based Access**: Investor, founder, and analyst roles
- **Email Verification**: Required for account activation

### Data Management
- **Companies Directory**: Multi-category company database (startups, growth, franchises, VCs)
- **Funding Intelligence**: Live funding rounds, exits, M&A deals, and unicorn tracking
- **Investment Network**: Investor profiles, accelerator/incubator programs
- **Market Intelligence**: Events, grants, rankings, and compliance data

### User Interface
- **Design System**: Material Design 3 inspired with custom color palette
- **Component Library**: Comprehensive UI components with consistent styling
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Data Visualization**: Interactive charts and analytics dashboards

## Data Flow

### Client-Side Data Flow
1. **Authentication**: User login/register → Supabase Auth → Session management
2. **Data Fetching**: TanStack Query → API requests → Server endpoints
3. **State Management**: Server state (TanStack Query) + Local state (React hooks)
4. **UI Updates**: Reactive updates based on query state changes

### Server-Side Data Flow
1. **Request Processing**: Express middleware → Route handlers → Business logic
2. **Database Operations**: Drizzle ORM → PostgreSQL queries → Data transformation
3. **Response Generation**: Structured JSON responses with error handling
4. **File Management**: Supabase Storage for image uploads and retrieval

### Data Sources
- **Companies**: Startup ranking data, growth company metrics, franchise information
- **Funding**: Investment round data, exit information, M&A transactions
- **Market Intelligence**: Event calendars, grant opportunities, industry rankings
- **Compliance**: Sanctions lists and regulatory data

## External Dependencies

### Core Infrastructure
- **Supabase**: Authentication, database hosting, file storage
- **Neon Database**: Serverless PostgreSQL for production
- **Vercel/Replit**: Deployment and hosting platform

### Third-Party Services
- **Image Storage**: Supabase Storage with CDN delivery
- **Email Services**: Supabase Auth email templates
- **Analytics**: Built-in query performance monitoring

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast production builds
- **Vite**: Development server with HMR
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Local PostgreSQL or Neon development database
- **Environment Variables**: Supabase credentials and database URLs

### Production Deployment
- **Frontend**: Static build deployed to CDN
- **Backend**: Node.js server with Express
- **Database**: Neon serverless PostgreSQL
- **File Storage**: Supabase Storage with global CDN

### Build Process
1. **Frontend Build**: Vite builds React app to static files
2. **Backend Build**: ESBuild bundles server code with external dependencies
3. **Database Migration**: Drizzle Kit pushes schema changes
4. **Deployment**: Combined frontend and backend deployment

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- August 11, 2025: Comprehensive Companies Section Enhancement - Complete
  - ✅ **Fully Functional API Integration**: Successfully integrated TheCompaniesAPI.com with proper data transformation and error handling
  - ✅ **Complete Field Display Implementation**: All requested fields now displayed beautifully:
    - **Name**: Company name with logo fallbacks and proper formatting
    - **Industries**: Categorical badges with overflow handling (+N more)
    - **Total Employees**: Formatted numbers (1K, 1M) with proper string/number handling
    - **Revenue**: Formatted currency display with fallback handling
    - **Business Type**: Color-coded badges (public=green, private=blue, startup=purple)
    - **Monthly Visitors**: Analytics data with number formatting
    - **Country/City**: Location display with proper geographical formatting
    - **Year Founded**: Historical company information
    - **Social Networks**: Interactive social media links (LinkedIn, Twitter, Facebook, Website)
    - **Technologies**: Tech stack badges with smart truncation
    - **Application**: Company description and purpose
    - **Data Score**: Quality scoring with star rating display (/100)
    - **Last Sync**: Timestamp information with proper date formatting
  - ✅ **Enhanced Card-Based Layout**: Beautiful responsive cards replacing table format
  - ✅ **Interactive Modal Details**: Click-through detailed company views with comprehensive information
  - ✅ **Intelligent Search with Smart Sorting**: Enhanced natural language search with automatic sorting detection
    - **Smart Intent Detection**: Queries like "top 10 saas" automatically sort by data score
    - **Context-Aware Sorting**: "largest companies by employees" sorts by employee count
    - **Revenue Queries**: "most profitable companies" sorts by revenue
    - **Temporal Queries**: "newest startups" sorts by founding year (desc), "established companies" sorts by founding year (asc)
    - **Quality Queries**: "best companies" and "high quality" sort by meta score
    - **Supported Sort Keys**: meta.score, about.totalEmployees, finances.revenue, analytics.monthlyVisitors, about.yearFounded
  - ✅ **Advanced Search Conditions Modal**: Complete filtering interface with TheCompaniesAPI.com integration
    - **Multiple Filter Types**: Industries, Country, Business Type, Employees, Revenue, Year Founded, Monthly Visitors
    - **Smart Condition Logic**: Equals, Exact Match, Greater Than, Lower Than, Not Equals operators
    - **Quick-Add Suggestions**: Pre-populated values for popular industries, countries, and business types  
    - **Multiple Conditions**: Combine filters with AND/OR operators for precise targeting
    - **Real-Time Validation**: Live API integration with comprehensive error handling
    - **Floating Search Integration**: Conditions automatically filter results from floating search icon
    - **Hybrid Search System**: When both search prompts and conditions are present, system uses conditions endpoint with search as additional filter
  - ✅ **Enhanced Revenue Data Display**: Fixed revenue fields to show actual financial data
    - **Real Financial Data**: Displays actual revenue ranges (e.g., "100m-200m", "over-1b", "1m-10m") 
    - **Multiple Revenue Sources**: Extracts from finances.revenue, estimatedRevenue, and annualRevenue fields
    - **Formatted Display**: Properly formatted currency display with fallback handling
  - ✅ **Advanced Pagination System**: Interactive page navigation with clickable page numbers
    - **Smart Page Navigation**: Shows 5 visible pages with intelligent range calculation
    - **Page State Management**: Automatically resets to page 1 on new searches or condition changes
    - **Comprehensive Page Info**: Displays current page, total pages, and result count
    - **Next/Previous Controls**: Navigate between pages with disabled state handling
    - **API Integration**: Full pagination support for both search and conditions endpoints
    - **Smart Endpoint Selection**: Uses search endpoint for prompt-only queries, conditions endpoint for filtered searches
  - ✅ **Floating Search Integration**: Natural language search with intelligent result ranking
  - ✅ **Real Data Implementation**: Live company data from external API with proper transformation
  - ✅ **Error Handling**: Comprehensive error states and loading indicators
  - ✅ **Responsive Design**: Mobile-friendly layout with grid responsiveness
  - **Note**: Requires COMPANIES_API_TOKEN environment variable for external API access

- July 11, 2025: All Suggested Deployment Fixes Applied Successfully - Deployment Ready
  - ✅ **Enhanced Environment Variable Handling**: Updated server/storage.ts with robust fallback patterns (VITE_SUPABASE_URL || SUPABASE_URL)
  - ✅ **Removed Crash Loop Causes**: Eliminated problematic dotenv/config import and added graceful error handling to prevent server crashes
  - ✅ **Added Supabase Availability Helper**: Created ensureSupabase() function to check database availability before operations
  - ✅ **Enhanced Error Handling**: Updated all storage methods with try-catch blocks and proper error reporting
  - ✅ **Updated API Error Responses**: Added specific 503 status codes for service unavailable states
  - ✅ **Improved Server Validation**: Enhanced environment variable validation with clear error messages and fallback support
  - ✅ **Created Deployment Verification**: Added scripts/check-deployment.cjs for pre-deployment validation
  - ✅ **Verified Application Startup**: Confirmed server starts successfully with all environment variables configured

- July 08, 2025: Critical Deployment Fixes Applied - Ready for Production
  - ✅ **Fixed Crash Loop Prevention**: Removed initialization errors that caused server crashes - application now starts with graceful degradation
  - ✅ **Enhanced Environment Variables**: Added robust fallback patterns (VITE_SUPABASE_URL || SUPABASE_URL) for Cloud Run compatibility  
  - ✅ **Improved Error Handling**: Updated all storage methods with try-catch blocks and ensureSupabase() helper function
  - ✅ **Port Configuration**: Enhanced PORT environment variable handling with validation for Cloud Run deployment
  - ✅ **API Error Responses**: Added specific error messages for service unavailable states (503 status codes)
  - ✅ **Deployment Verification**: Created scripts/deployment-check.js for pre-deployment validation
  - ✅ **Server Startup**: Added comprehensive environment validation without blocking server startup

- July 08, 2025: Deployment Fully Ready - All Suggested Fixes Applied & Tested
  - ✅ **Environment Variables**: Enhanced configuration with multiple fallback patterns (VITE_SUPABASE_URL || SUPABASE_URL)
  - ✅ **Crash Loop Prevention**: Removed initialization errors that caused server crashes - stores error without throwing
  - ✅ **Port Configuration**: Server uses PORT environment variable for Cloud Run compatibility with 0.0.0.0 binding
  - ✅ **Error Handling**: Enhanced Supabase client initialization with comprehensive validation and graceful degradation
  - ✅ **Client-Side Validation**: Added robust environment variable validation in client/src/lib/supabase.ts with logging
  - ✅ **Server-Side Validation**: Enhanced server/storage.ts with comprehensive error reporting and fallback handling
  - ✅ **API Error Handling**: Updated API routes with specific error messages and service unavailable status codes
  - ✅ **Deployment Verification**: Created scripts/deployment-check.js for pre-deployment validation
  - ✅ **Environment Validation**: Added startup validation in server/index.ts to check required variables
  - ✅ **Production Ready**: All deployment issues resolved - deployment check passes with all green lights

- July 06, 2025: Fixed deployment issues  
  - ✅ Resolved dotenv import error by removing dependency and adding fallback environment variable handling
  - ✅ Created improved production build scripts with external package handling
  - ✅ Added robust Supabase client initialization with null checks
  - ✅ Updated build process to avoid bundling complex dependencies that cause deployment failures
  - ✅ Fixed server port configuration for Cloud Run deployment (PORT environment variable support)
  - ✅ Created production deployment script (scripts/production-deploy.js) for tsx-based deployment
  - ✅ Updated environment variable handling to support both VITE_ and non-VITE_ prefixed variables
  - ✅ Verified API functionality and Supabase connectivity working correctly

## Changelog

- July 05, 2025: Initial setup
- July 06, 2025: Deployment fixes applied