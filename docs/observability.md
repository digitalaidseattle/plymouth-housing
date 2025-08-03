# Observability with Microsoft Clarity

This project uses **Microsoft Clarity** for observability and user interaction tracking.

## How It Works

- **Microsoft Clarity** is initialized in [`App.tsx`](../src/App.tsx) using the project ID.
- The Clarity project ID is stored securely as a GitHub environment secret (`VITE_CLARITY_PROJECT_ID`).
- During deployment, the project ID is injected into the build via the GitHub Actions workflow (see `.github/workflows/azure-static-web-apps-CD.yml`).
- The initialization code ensures Clarity is only enabled when a project ID is present, typically in staging and production environments.

## Initialization Code

In [`App.tsx`](../src/App.tsx):

```tsx
useEffect(() => {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
  if (projectId) {
    Clarity.init(projectId);
  }
}, []);
```

## Secrets Management
- The Clarity project ID is not hardcoded in the repository.
- It is stored as a secret in the GitHub environment and referenced in the workflow as ```${{ secrets.VITE_CLARITY_PROJECT_ID }}```.

## Deployment
- The GitHub Actions workflow passes the secret to the build environment, making it available as an environment variable for the app.

## Summary
This setup ensures that user tracking and observability are enabled securely and only in the appropriate environments, with sensitive keys managed via GitHub secrets. ``````