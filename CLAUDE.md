# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plymouth Housing's inventory management system built with React, TypeScript, and Azure Static Web Apps. The application helps manage in-kind donations and track distribution to residents, replacing a manual system with a centralized digital solution.

## Development Setup

### Required Environment
- Node.js and npm
- PowerShell (for database bootstrapping)
- SQL Server (local or Azure)
- Azure Static Web Apps CLI (SWA CLI)

### Starting the Application
```bash
npm install
swa start
```
Access at http://localhost:4280 (not port 3000, which won't have backend API access).

The application requires database connection string in environment variable `DATABASE_CONNECTION_STRING`.

## Common Commands

### Development
- `npm run dev` - Start Vite dev server (without backend API)
- `swa start` - Start full application with SWA emulation and backend API
- `swa start --verbose=silly` - Start with detailed logging

### Testing
- `npm test` or `npm run test` - Run all tests with Vitest
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:unit` - Run unit tests only

### Code Quality
- `npm run lint` - Run ESLint
- `npm run build` - Build for production (runs TypeScript compiler + Vite build)
- `npx prettier --write .` - Format code with Prettier

## Architecture Overview

### Frontend Structure
- **React 18** with **TypeScript** and **Vite** for build tooling
- **Material-UI** for component library with custom theming
- **React Router v7** for client-side routing
- **Vitest** for testing framework

### Key Application Layers
1. **Authentication Layer**: Azure AD integration with role-based access (admin/volunteer)
2. **Data Layer**: Azure Data API Builder provides REST endpoints to SQL Server
3. **State Management**: React Context for user state and persistent storage hooks
4. **Component Architecture**: Modular components with clear separation of concerns

### Core Features
- **Inventory Management**: CRUD operations for items, categories, and stock levels
- **Checkout System**: Multi-category item distribution with limits and validation
- **User Management**: Admin and volunteer role management with PIN authentication
- **People Management**: Resident information and building/unit tracking

### Database Integration
Backend uses Azure Data API Builder with SQL Server:
- REST API endpoints defined in `swa-db-connections/staticwebapp.database.config.json`
- Stored procedures for complex operations (checkout, inventory changes)
- Role-based permissions enforced at API layer

### Main Routes
- `/volunteer-home` - Dashboard for volunteers
- `/inventory` - Inventory management interface
- `/people` - User and resident management
- `/checkout` - Item distribution interface
- `/pick-your-name` & `/enter-your-pin` - Authentication flow

### State Management Patterns
- `UserContext` - Global user authentication state
- `usePersistentState` - Hook for localStorage-backed state
- `RefreshContext` - Coordination of data refreshes across components

### Key Directories
- `src/components/` - Reusable UI components
- `src/pages/` - Route-level page components
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `src/layout/` - Layout wrapper components
- `database/` - SQL scripts, procedures, and test data
- `docs/` - Project documentation and design specs

### Testing Strategy
- Unit tests for components and utilities using Vitest + Testing Library
- Tests co-located with source files (`.test.tsx` files)
- Coverage reporting available via `npm run test:coverage`

## Development Notes

### Authentication Flow
Users authenticate via Azure AD, then select volunteer name and enter PIN for role-based access. The `UserContext` maintains authentication state throughout the session.

### Database Development
The application requires database setup as documented in `docs/database-setup.md`. Use local SQL Server for development to avoid conflicts with staging environment.

### Branch Strategy
Feature branches follow pattern: `{name}/ticketnumber-YourFeatureName`