# Fix Back-Button Login Bypass After Logout

## Context

After logging out, pressing the browser Back button restores the authenticated session and lets users view the app without re-authenticating. This is a known limitation of SWA's **free plan** "managed" authentication: the browser cookie is cleared on logout, but the browser's in-memory cache still holds the SPA page. On Back navigation, the cached JS bundle re-renders with the old `UserContext` state before any network request confirms the session is gone.

The fix is to switch to SWA **custom authentication** (standard plan only). With custom auth, the SWA runtime maintains a **server-side session**. When `/.auth/logout` is called, that session is invalidated. Any subsequent request — including a Back-button cache restoration that makes an API call — gets a 401, which `responseOverrides` redirects to the AAD login page.

## Quick Fix: Auto-Login After Logout (no Azure admin required)

**Problem**: After logging out, clicking "Log In" silently reuses the previous AAD session — the user never sees a login screen.

**Cause**: SWA's `/.auth/logout` clears the SWA session cookie, but the AAD session cookie on `login.microsoftonline.com` remains alive. Without a `prompt` parameter, AAD silently reuses it.

**Fix**: Add `?prompt=select_account` to the login link in [public/login.html](../../public/login.html):

```html
<a href="/.auth/login/aad?prompt=select_account" class="btn">Log In</a>
```

This forces AAD to show the account picker on every login, preventing silent re-authentication. `prompt=select_account` is preferred over `prompt=login` for a shared volunteer device: it lets someone switch accounts without forcing a full password re-entry every time.

**Limitation**: This does not fix the back-button bypass described below. For that, the full custom auth migration is required.

---

## Back-Button Bypass After Logout

Related upstream issues:
- [How to properly make my SWA logout from a custom identity provider? · Issue #594](https://github.com/Azure/static-web-apps/issues/594)
- [Impossible to log out with standard aad · Issue #1625](https://github.com/Azure/static-web-apps/issues/1625)

---

## What Changes

### 1. Azure Portal (infrastructure — done during/before deployment)

| Step | Where | Action |
|------|--------|--------|
| Upgrade plan | Azure Portal → Static Web Apps → your app → Hosting plan | Switch from Free to Standard |
| App Registration: change platform | Azure Portal → Entra ID → App registrations → your app → Authentication | Delete the SPA platform entry, add a **Web** platform with redirect URI: `https://black-bush-0857ce61e.6.azurestaticapps.net/.auth/login/aad/callback` |
| App Registration: create client secret | Azure Portal → Entra ID → App registrations → your app → Certificates & secrets | Create a new client secret; copy the value |
| SWA app settings | Azure Portal → Static Web Apps → your app → Configuration | Add two app settings: `AZURE_CLIENT_ID` = App Registration Application (client) ID; `AZURE_CLIENT_SECRET` = the secret value from the step above |

> **Note on Tenant ID**: The tenant ID (a GUID) belongs in the config file. It is **not** a secret — it is embedded publicly in every OAuth URL and JWT token the app issues. It can safely be committed to source control.

---

### 2. Code Change: `staticwebapp.config.json`

**File**: [staticwebapp.config.json](../../staticwebapp.config.json)

Add an `auth` block and a `Cache-Control: no-store` global header. The existing `routes` and `responseOverrides` sections remain unchanged.

```json
{
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/<TENANT_ID>/v2.0",
          "clientIdSettingName": "AZURE_CLIENT_ID",
          "clientSecretSettingName": "AZURE_CLIENT_SECRET"
        }
      }
    }
  },
  "globalHeaders": {
    "Cache-Control": "no-store"
  },
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    { "route": "/login.html", "allowedRoles": ["anonymous"] },
    { "route": "/logout.html", "allowedRoles": ["anonymous"] },
    { "route": "/favicon.ico", "allowedRoles": ["anonymous"] },
    { "route": "/*", "allowedRoles": ["authenticated"] }
  ],
  "responseOverrides": {
    "401": {
      "statusCode": 302,
      "redirect": "/.auth/login/aad"
    }
  }
}
```

Replace `<TENANT_ID>` with the Plymouth Housing Entra directory GUID before committing.

**Why `Cache-Control: no-store`?**
Defense in depth. The custom auth server-side session is the primary fix. `no-store` adds a second layer: it prevents the browser from caching the authenticated SPA response at all, so Back button triggers a fresh network request that is immediately rejected if the session is gone.

---

### 3. No other code changes needed

- `src/layout/MainLayout/Header/HeaderContent/Profile/index.tsx` — `handleLogout` already calls `/.auth/logout?post_logout_redirect_uri=/login.html` ✓
- `src/hooks/useAuthorization.ts` — already calls `/.auth/logout` for role violations ✓
- `src/pages/RootRedirect.tsx` — already handles unauthenticated redirects ✓
- `public/login.html` — already has the correct `/.auth/login/aad` link ✓
- GitHub workflows — no changes needed; Azure app settings are configured in Portal ✓

---

## Verification

1. Deploy the updated `staticwebapp.config.json` to staging
2. Confirm the Azure Portal infrastructure steps above are complete for the staging environment
3. Log in → use the app → click Logout
4. The app should redirect to `login.html`
5. Press browser Back button → should NOT show the app; should redirect to AAD login (or show login.html)
6. Verify both `admin` and `volunteer` roles still function normally after re-authenticating
