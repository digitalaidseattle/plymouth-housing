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
- All code merges to `dev` through PRs (require one approval)
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
- Use values from `src/themes/typography.ts` for all font styles; never hardcode font sizes, weights, or families
- Use the `sx` numeric shorthand for all spacing; use `theme.spacing()` directly when you need computed values. Avoid hardcoded `rem` or `px` values for spacing
- Match icon sizes to existing project patterns; avoid arbitrary icon sizes

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

## Common Pitfalls

- **MUI ref forwarding**: May require `ref as any` workaround (see `MainCard.tsx` for example)

## Development Workflow

1. Create feature branch following naming convention
2. Run dev servers (`npx swa start` and `dab start`)
3. Write tests alongside features
4. Run linter before committing
5. Create PR and request review

## AI Coding Guidelines

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.