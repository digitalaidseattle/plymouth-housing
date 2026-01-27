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

### Formatting (Prettier)
- **2 spaces** for indentation (no tabs)
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** on all multi-line structures
- **80 character** line width
- Arrow function parens always included
- Bracket spacing enabled

### React/JSX
- Use functional components with hooks
- Use `React.FC` type for components with props
- Prefer `forwardRef` when ref forwarding needed
- Default exports for page components, named exports acceptable for utilities
- Component files use PascalCase naming

### ESLint Rules
- Follow recommended TypeScript and React Hooks rules
- React Refresh: only export components (warnings allowed for constants)
- Test files (`*.test.ts`, `*.test.tsx`) are excluded from linting

## Naming Conventions

- **Components**: PascalCase (e.g., `MainCard.tsx`, `UserTable.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Directories**: kebab-case or PascalCase (both used in codebase)
- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE (in `src/types/constants.ts`)

## Git Workflow

### Branch Naming
Follow git flow convention with task numbers:
```
{name}/{ticket-number}-brief-description
```
Examples:
- `john/123-add-checkout-feature`
- `jane/456-fix-drawer-mobile`

### Pull Requests
- All code merges to `main` through PRs
- PRs require **one approval** from a DAS team member
- Review existing PRs before starting new work
- Treat documentation as code (same standards for Markdown)
- PRs reviewed at end of standups to ensure all have reviewers

**ALWAYS use the PR template** (`.github/pull_request_template.md`) when creating pull requests:

1. **Description**: Provide context and highlight what reviewers should focus on
2. **Jira Ticket**: Link the relevant ticket (format: `Closes: [PIT-XXX](https://das-ph-inventory-tracker.atlassian.net/browse/PIT-XXX)`)
3. **Type of Change**: Specify type (Bug fix / New feature / Breaking change / Refactoring / Documentation / Configuration / Performance)
4. **Changes Made**: List key changes in bullet points
5. **Checklist**: Complete all items (style guidelines, prettier, self-review, comments, docs, warnings, tests)
6. **QA Instructions**: Provide testing instructions and screenshots for UI changes

When creating PRs, review ALL commits from branch divergence using `git diff [base-branch]...HEAD` to write a comprehensive summary covering the full scope of changes.

### Commit Messages
- Clear, descriptive commit messages
- Reference ticket numbers when applicable

## Testing

### Unit Tests
- Located alongside source files (`*.test.ts`, `*.test.tsx`)
- Use **Vitest** with React Testing Library
- Mock external dependencies
- Use `jsdom` environment for component tests
- Coverage reports available via `npm run test:coverage`

### Test Structure
- Organize tests with `describe` blocks
- Clear test names describing expected behavior
- Use Testing Library queries (`getByRole`, `getByText`, etc.)
- Test user interactions, not implementation details

## Component Patterns

### Material-UI Usage
- Import from `@mui/material` for components
- Use `useTheme()` hook for theme access
- Apply custom styles via `sx` prop (preferred) or styled components
- Component overrides in `src/themes/overrides/`
- Support both light and dark modes

### Context Pattern
- Contexts in `src/components/contexts/`
- Examples: `DrawerOpenContext`, `ActiveMenuItemContext`, `UserContext`
- Use Context for shared state across component tree

### Extended Components
- Enhanced base components in `src/components/@extended/`
- Examples: `AnimateButton`, `Breadcrumbs`, `Transitions`, `Dot`

### Cards
- Use `MainCard` component for consistent card styling
- Props: `border`, `boxShadow`, `title`, `content`, `sx`
- CardContent has id="scrollContainer" for scroll reset

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

## Build Optimization

- Manual chunks: `react-vendor` for React/ReactDOM
- Tree-shaking enabled
- Bundle visualization available (see `bundle-visualization.html`)
- Chunk size warning limit: 1000KB

## Accessibility

- Use semantic HTML
- Include ARIA labels where needed
- Keyboard navigation support
- Test with screen readers when implementing new UI

## Common Pitfalls

- **MUI ref types**: Use `ref as any` workaround for ref forwarding with MUI components (see `MainCard.tsx:59`)
- **Drawer mobile blocking**: Fixed in recent commit - ensure drawer doesn't block clicks in tablet mode
- **ScrollContainer**: Card content uses id="scrollContainer" for scroll reset in checkout page
- **Test file exclusions**: Remember test files are ESLint-ignored

## Development Workflow

1. Check out the [database setup guide](docs/database-setup.md)
2. Set up [DAB locally](docs/DAB-setup.md)
3. Create feature branch following naming convention
4. Run dev server with `npm run dev`
5. Write tests alongside features
6. Run linter before committing
7. Create PR and request review
8. Review open PRs at standup

## Documentation

- Working agreement: `docs/working-agreement.md`
- Database setup: `docs/database-setup.md`
- DAB setup: `docs/DAB-setup.md`
- Deployment: `docs/deployment-guide.md`
- Solution architecture: `docs/overall-solution-arch.md`

## Team Practices

- **Kanban workflow** without sprints
- Async standup Monday 5:30pm PST (Slack)
- Project standup Thursday 5:30pm PST
- Dev sync Friday 5:45pm PST
- Minimum 4 hours/week commitment
- Board: [Jira](https://das-ph-inventory-tracker.atlassian.net/jira/core/projects/PIT/board)
- Design files: Figma

## Key Principles

- Quality over quantity
- Make everyone's voice heard
- Spread expertise across team (no single points of failure)
- All technical decisions documented via async design reviews in PRs
- Respect work-life balance in volunteer context
