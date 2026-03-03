# AAD Groups as SWA Roles

## Objective

Plymouth Housing uses Azure Static Web Apps (SWA) with AAD authentication. Currently, access control uses only the built-in `authenticated` role. We want to assign the existing custom roles (`admin`, `volunteer`) based on Azure Active Directory (AAD/Entra ID) group membership, so that role assignment is automatic and consistent — without manually inviting each user via the Azure portal.

---

## Background

### Roles in this project

The app has two custom roles, as defined in [login-design.md](../designs/login-design.md) and [overall-solution-arch.md](../overall-solution-arch.md):

| Role | Behavior |
|---|---|
| `admin` | Full CRUD access; no PIN required; routed to admin dashboard |
| `volunteer` | Limited API permissions; requires PIN verification after AAD login; routed to volunteer home |

> **Important**: A user must have exactly one of these roles. Having both causes an error — see [swa-setup.md](../swa-setup.md).

These roles currently flow into the DAB API layer via the `X-MS-API-ROLE` header on every REST request. DAB enforces permissions per role in `dab/dab-config.json`. See [authorization_roles.md](authorization_roles.md) for the prior investigation into this.

### Current role assignment method

Roles are currently assigned **manually per user** via the Azure portal (invitation-based), as documented in [deployment-guide.md](../deployment-guide.md). This does not scale and requires manual maintenance when staff changes.

### Why AAD groups

Mapping AAD groups to SWA roles means that managing group membership in Entra ID is sufficient — no portal invitations needed per person.

### Platform requirement

SWA does not natively map AAD groups to custom roles via config. A `rolesSource` function is required. This is a hard platform requirement — there is no config-only alternative.

See also: [SWA built-in role limitations](https://github.com/Azure/static-web-apps/issues/1425)

---

## Approach

The solution involves three parts:

1. An Entra app registration with Microsoft Graph permissions
2. A small `GetRoles` serverless function in the `/api` folder
3. An updated `staticwebapp.config.json` pointing to the function

### Requirements

- SWA **Standard plan** (function-based role management is not available on the Free plan)
- Entra ID permissions to create an app registration
- Two AAD groups — one for admins, one for volunteers — with the relevant Plymouth Housing staff as members
- `User.Read.All` Microsoft Graph API permission (application permission, not delegated)

---

## Implementation Steps

### 1. Create two AAD groups in Entra ID

Create two security groups in **Microsoft Entra ID → Groups**:

- `plymouth-housing-admins`
- `plymouth-housing-volunteers`

Add the appropriate Plymouth Housing staff as members. Note the **Object ID** of each group — needed in step 2.

### 2. Create an Entra App Registration

1. In the Azure portal, go to **Microsoft Entra ID → App registrations → New registration**
2. Set the redirect URI to:
   ```
   https://<your-swa-url>/.auth/login/aad/callback
   ```
3. After registration, note the **Application (client) ID** and **Directory (tenant) ID**
4. Under **Authentication**, enable **ID tokens** (implicit grant)
5. Under **Certificates & secrets**, create a new client secret and note the value
6. Under **API permissions**, add `User.Read.All` (Microsoft Graph, application permission) and grant admin consent

### 3. Add the `GetRoles` API Function

Create the file `api/GetRoles/index.js`. This function is called by SWA after every successful AAD login and returns the user's Plymouth Housing role.

```js
const https = require('https');

// Map Plymouth Housing SWA roles to Entra group object IDs
const roleGroupMappings = {
  admin:     '<OBJECT_ID_OF_plymouth-housing-admins_GROUP>',
  volunteer: '<OBJECT_ID_OF_plymouth-housing-volunteers_GROUP>',
};

module.exports = async function (context, req) {
  const accessToken = req.headers['x-ms-token-aad-access-token'];

  if (!accessToken) {
    context.res = { status: 200, body: { roles: [] } };
    return;
  }

  const groups = await getUserGroups(accessToken);
  const roles = Object.entries(roleGroupMappings)
    .filter(([, groupId]) => groups.includes(groupId))
    .map(([role]) => role);

  // A user should have exactly one role (admin OR volunteer, not both)
  context.res = { status: 200, body: { roles } };
};

function getUserGroups(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.microsoft.com',
      path: '/v1.0/me/memberOf?$select=id',
      headers: { Authorization: `Bearer ${token}` },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve((parsed.value || []).map((g) => g.id));
        } catch {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}
```

> Ensure each Plymouth Housing staff member is a member of exactly one of the two groups. A user in both groups will have both roles, which causes an error in the app.

### 4. Update `staticwebapp.config.json`

Add the `auth` block and `rolesSource`. The existing route restriction to `authenticated` can be replaced with the actual roles:

```json
{
  "auth": {
    "rolesSource": "/api/GetRoles",
    "identityProviders": {
      "azureActiveDirectory": {
        "userDetailsClaim": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/<TENANT_ID>",
          "clientIdSettingName": "ENTRA_CLIENT_ID",
          "clientSecretSettingName": "ENTRA_CLIENT_SECRET"
        },
        "login": {
          "loginParameters": ["resource=https://graph.microsoft.com"]
        }
      }
    }
  },
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    { "route": "/login.html",  "allowedRoles": ["anonymous"] },
    { "route": "/logout.html", "allowedRoles": ["anonymous"] },
    { "route": "/favicon.ico", "allowedRoles": ["anonymous"] },
    { "route": "/*",           "allowedRoles": ["admin", "volunteer"] }
  ],
  "responseOverrides": {
    "401": { "statusCode": 302, "redirect": "/.auth/login/aad" }
  }
}
```

> Note: Client-side React routing means per-route role restrictions in this config are not enforced for in-app navigation — only for initial page loads. Role-based access for the API is enforced by DAB. See [deployment-guide.md](../deployment-guide.md).

### 5. Add App Settings in Azure Portal

In the SWA resource → **Configuration → Application settings**, add:

| Name | Value |
|---|---|
| `ENTRA_CLIENT_ID` | Application (client) ID from step 2 |
| `ENTRA_CLIENT_SECRET` | Client secret value from step 2 |

### 6. Update DAB Role Permissions

Once roles flow through correctly, the DAB config (`dab/dab-config.json`) can be updated to replace `anonymous` permissions with `admin` and `volunteer` as appropriate. See [authorization_roles.md](authorization_roles.md) for the prior investigation into why this was left as `anonymous`, and the requirement for the `X-MS-API-ROLE` header.

---

## Local Development

The SWA CLI emulates auth but does **not** call `rolesSource` locally. Use the SWA CLI login emulation screen to manually set the role to `admin` or `volunteer` when testing locally — as documented in [swa-setup.md](../swa-setup.md).

---

## Considerations

- **Client secret expiry**: The secret must be rotated before it expires. Set a calendar reminder or consider automating rotation via Azure Key Vault.
- **Exactly one role per user**: Ensure group membership is mutually exclusive. A user in both groups will receive both roles, which causes an error in the current app.
- **Graph API paging**: If users belong to more than 100 groups, the Graph response will be paginated (`@odata.nextLink`). The function above does not handle pagination — extend it if needed.
- **Domain restriction**: The login design requires `@plymouthhousing.org` emails. This can be enforced at the Entra app registration level under **Supported account types**.

---

## References

- [Tutorial: Assign SWA roles with Microsoft Graph](https://learn.microsoft.com/en-us/azure/static-web-apps/assign-roles-microsoft-graph)
- [Custom authentication in Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-custom)
- [SWA authentication and authorization overview](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-authorization)
- [login-design.md](../designs/login-design.md) — role definitions and auth flow
- [overall-solution-arch.md](../overall-solution-arch.md) — role usage across the stack
- [authorization_roles.md](authorization_roles.md) — prior research on DAB role permissions
- [deployment-guide.md](../deployment-guide.md) — current deployment and auth setup
- [swa-setup.md](../swa-setup.md) — local development with roles
