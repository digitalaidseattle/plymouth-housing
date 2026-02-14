# Observability

This project uses two complementary Azure observability tools to monitor and improve the application:
- **Microsoft Clarity** for user interaction tracking and behavioral insights
- **Azure Application Insights** for application diagnostics, performance monitoring, and exception tracking

## Microsoft Clarity

### How It Works

- **Microsoft Clarity** is initialized in [`App.tsx`](../src/App.tsx) using the project ID.
- The Clarity project ID is stored securely as a GitHub environment secret (`VITE_CLARITY_PROJECT_ID`).
- During deployment, the project ID is injected into the build via the GitHub Actions workflow (see `.github/workflows/azure-static-web-apps-CD.yml`).
- The initialization code ensures Clarity is only enabled when a project ID is present, typically in staging and production environments.

### Initialization Code

In [`App.tsx`](../src/App.tsx):

```tsx
useEffect(() => {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
  if (projectId) {
    Clarity.init(projectId);
  }
}, []);
```

### Secrets Management
- The Clarity project ID is not hardcoded in the repository.
- It is stored as a secret in the GitHub environment and referenced in the workflow as ```${{ secrets.VITE_CLARITY_PROJECT_ID }}```.

### Deployment
- The GitHub Actions workflow passes the secret to the build environment, making it available as an environment variable for the app.

## Azure Application Insights

**Azure Application Insights** provides real-time application performance monitoring, exception tracking, and diagnostics. It helps identify and diagnose issues in production by capturing detailed telemetry about application errors and their context.

### How It Works

- Initialized in [`main.tsx`](../src/main.tsx) before the React app mounts using [`utils/appInsights.ts`](../src/utils/appInsights.ts).
- Automatically tracks unhandled exceptions and failed network requests (fetch calls).
- Supports manual exception tracking via `trackException()` with custom context properties.
- Only active in staging/production (disabled in development mode).

### Initialization Code

In [`main.tsx`](../src/main.tsx):

```tsx
import { initializeAppInsights } from './utils/appInsights';

initializeAppInsights();
```

See [`utils/appInsights.ts`](../src/utils/appInsights.ts) for the complete initialization logic.

### Configuration

Application Insights requires a connection string from your Azure Application Insights resource. This is provided via the `VITE_APPINSIGHTS_CONNECTION_STRING` environment variable, which is automatically injected during the build process in staging and production environments.

### Usage Example

Manual exception tracking with context properties (see [`EnterPinPage.tsx:61-65`](../src/pages/authentication/EnterPinPage.tsx#L61-L65)):

```typescript
import { trackException } from '../../utils/appInsights';

trackException(err, {
  component: 'EnterPinPage',
  action: 'verifyPin',
  volunteerId: id.toString(),
});
```

### Secrets Management & Deployment

- The connection string is **not hardcoded** in the repository.
- **Separate Application Insights instances are used for staging and production** to keep telemetry data isolated and ensure staging test data doesn't pollute production metrics.
- Each environment has its own GitHub environment secret named `VITE_APPINSIGHTS_CONNECTION_STRING`:
  - **Staging environment**: Uses the staging Application Insights connection string
  - **Production environment**: Uses the production Application Insights connection string
- The GitHub Actions workflows ([CD](.github/workflows/azure-static-web-apps-CD.yml) for staging and [production](.github/workflows/azure-static-web-apps-prod.yml)) automatically use the correct connection string from their respective GitHub environments.
- **Action Required**: A repository administrator must configure both environment secrets:
  1. Navigate to Settings → Environments → staging → Add secret
  2. Add `VITE_APPINSIGHTS_CONNECTION_STRING` with the staging Application Insights connection string
  3. Navigate to Settings → Environments → production → Add secret
  4. Add `VITE_APPINSIGHTS_CONNECTION_STRING` with the production Application Insights connection string

## Summary

This project uses a comprehensive observability strategy combining two Azure tools:

- **Microsoft Clarity** provides insights into user behavior, session recordings, and heatmaps to understand how users interact with the application.
- **Azure Application Insights** tracks application health, performance, and exceptions to identify and diagnose technical issues.

Together, these tools enable both user experience optimization and technical reliability monitoring. All sensitive keys (Clarity project ID and Application Insights connection string) are securely managed via GitHub secrets and only injected during deployment to staging and production environments. ``````