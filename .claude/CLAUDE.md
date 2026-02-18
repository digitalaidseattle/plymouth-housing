# Plymouth Housing Inventory Management System

## Project Overview

Plymouth Housing's centralized inventory management system for tracking in-kind donations and distribution to residents experiencing homelessness. Built by Digital Aid Seattle as a volunteer project.

**Mission**: Revolutionize donation tracking from manual processes to real-time inventory management with minimal training requirements.

## Technology Stack

### Frontend
- **React 19** with TypeScript (strict mode)
- **Vite** as build tool and dev server
- **Material-UI (MUI) v7** for UI components
- **React Router v7** for routing
- **Vitest** for unit testing with jsdom environment

### Backend & Infrastructure
- **Azure Static Web Apps** for frontend hosting
- **Data API Builder (DAB)** as API layer (runs in Azure Container Apps)
- **Azure SQL Server** for database
- **Microsoft Clarity** for analytics

### Development Tools
- ESLint with TypeScript plugin
- Prettier for code formatting
- Azure Static Web Apps CLI for local development

## Commands

```bash
npx swa start        # Start dev server on port 3000
dab start -c ./dab/dab-config.json  # Start Data API Builder (backend API)
npm run build        # TypeScript compile + Vite build
npm run lint         # Run ESLint
npm test             # Run Vitest in watch mode
npm run test:unit    # Run unit tests
npm run test:coverage # Generate coverage report
npm run preview      # Preview production build
```

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── @extended/   # Extended/enhanced base components (ESLint ignored)
│   ├── Checkout/    # Checkout-specific components
│   ├── contexts/    # React contexts (DrawerOpenContext, UserContext, etc.)
│   └── cards/       # Card components (statistics, analytics)
├── pages/           # Page-level components
│   ├── authentication/  # Auth flows (EnterPinPage, PickNamePage)
│   ├── dashboard/      # Dashboard views (ESLint ignored)
│   ├── people/         # User management
│   └── VolunteerHome/  # Volunteer interface
├── layout/          # Layout components
│   ├── MainLayout/  # Main app layout with drawer/header
│   └── MinimalLayout/ # Minimal layout for auth pages
├── themes/          # MUI theme customization
│   ├── overrides/   # Component-specific theme overrides
│   ├── palette.tsx  # Color palette
│   └── theme.ts     # Theme configuration
├── hooks/           # Custom React hooks
├── types/           # TypeScript types and interfaces
├── menu-items/      # Navigation menu configuration
├── toolbar-items/   # Toolbar configuration
└── assets/          # Static assets (images, SVGs, CSS)

database/            # SQL scripts and migrations
dab/                 # Data API Builder configuration
docs/                # Project documentation
tests/               # End-to-end tests
```

## Code Style

Only add comments if reading the code is insufficient.

### TypeScript
- Use **strict mode** (all strict checks enabled)
- No unused locals or parameters
- Use ES2020 target with ESNext modules
- Prefer type inference, explicit types when needed
- Use interfaces from `src/types/interfaces.ts` for shared types

### Formatting
- Enforced by Prettier (see `.prettierrc`)

### React/JSX
- Use functional components with hooks
- Use `React.FC` type for components with props
- Prefer `forwardRef` when ref forwarding needed
- Default exports for page components, named exports acceptable for utilities
- Component files use PascalCase naming

### Linting
- Follow ESLint configuration (TypeScript and React Hooks rules)

## Naming Conventions

- **Components**: PascalCase (e.g., `MainCard.tsx`, `UserTable.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Directories**: kebab-case or PascalCase (both used in codebase)
- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE (in `src/types/constants.ts`)

## Git Workflow

### Branch Naming
Follow git flow convention: `{name}/{ticket-number}-brief-description`

### Pull Requests
- All code merges to `main` through PRs (require one approval)
- Review existing PRs before starting new work
- Treat documentation as code (same standards for Markdown)
- **ALWAYS use the PR template** (`.github/pull_request_template.md`)
- Review ALL commits from branch divergence using `git diff [base-branch]...HEAD` to write comprehensive summaries

### Commit Messages
- Clear, descriptive commit messages
- Reference ticket numbers when applicable

## Testing

- Use **Vitest** with React Testing Library
- Tests located alongside source files (`*.test.ts`, `*.test.tsx`)
- Test user interactions, not implementation details
- Coverage reports: `npm run test:coverage`

## Component Patterns

### Material-UI
- Apply custom styles via `sx` prop (preferred) or styled components
- Component overrides in `src/themes/overrides/`
- Support both light and dark modes

### Context Pattern
- Contexts in `src/components/contexts/`
- Use Context for shared state across component tree

## Authentication & Authorization

- PIN-based authentication flow (`EnterPinPage`, `PickNamePage`)
- Custom `useAuthorization` hook for role checks
- Volunteer switcher in header for multi-account scenarios

## State Management

- React Context for global state
- `usePersistentState` hook for localStorage persistence
- Component-level state with `useState` for local concerns

## API Integration

- API calls through Data API Builder (DAB)
- Custom `fetchWithRetry` utility for resilient network requests
- Environment variables for configuration (`.env.local`)

## Accessibility

- Use semantic HTML
- Include ARIA labels where needed
- Keyboard navigation support
- Test with screen readers when implementing new UI

## Common Pitfalls

- **MUI ref forwarding**: May require `ref as any` workaround (see `MainCard.tsx` for example)

## Development Workflow

1. Set up database (see `docs/database-setup.md`) and DAB (see `docs/DAB-setup.md`)
2. Create feature branch following naming convention
3. Run dev servers (`npx swa start` and `dab start`)
4. Write tests alongside features
5. Run linter before committing
6. Create PR and request review

## Key Principles

- Quality over quantity
- Make everyone's voice heard
- Spread expertise across team (no single points of failure)
- All technical decisions documented via async design reviews in PRs
- Respect work-life balance in volunteer context
