# Data API Builder (DAB) Setup

## Introduction

This project uses [Data API Builder (DAB)](https://learn.microsoft.com/en-us/azure/data-api-builder/) to provide REST API access to our Azure SQL Database. DAB is a containerized API layer that sits between our Static Web App (SWA) frontend and the database.

**Why DAB in a Container?**
- The SWA Database Connections feature has been deprecated by Microsoft
- DAB in containers provides a modern, scalable API layer
- Better separation of concerns between frontend and backend
- Enhanced security through Azure Container Apps managed identity
- Consistent configuration across local development and production environments

For more information, see:
- [Azure Static Web Apps with Container Apps API](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-container-apps)
- [DAB Official Documentation](https://learn.microsoft.com/en-us/azure/data-api-builder/)

## Architecture Overview

The architecture consists of:
1. **Static Web App (SWA)** - Hosts the React frontend
2. **Azure Container Apps** - Runs the DAB container (production)
3. **Local DAB CLI** - Runs DAB locally for development
4. **Azure SQL Database** - Stores application data

Authentication flows through Azure Entra ID, and DAB enforces role-based permissions defined in `dab-config.json`.

---

## Local Development Setup

### Prerequisites

Before setting up DAB locally, ensure you have:
- **.NET 8 SDK** with ASP.NET Core runtime installed ([Download here](https://dotnet.microsoft.com/download/dotnet/8.0))
- A local or remote **SQL Server database** (see [database-setup.md](database-setup.md))
- **DATABASE_CONNECTION_STRING** environment variable set (see [database-setup.md](database-setup.md))

### Install DAB CLI

Follow the official installation instructions:
[https://learn.microsoft.com/en-us/azure/data-api-builder/command-line/install](https://learn.microsoft.com/en-us/azure/data-api-builder/command-line/install)

**Quick installation:**
```bash
dotnet tool install -g Microsoft.DataApiBuilder
```

**Verify installation:**
```bash
dab --version
```

### Configuration File

The DAB configuration is stored in `/dab/dab-config.json`. This file defines:
- Database connection settings
- REST API endpoints for each entity
- Role-based permissions (admin, volunteer, anonymous)
- Exposed stored procedures

The configuration uses the environment variable `DATABASE_CONNECTION_STRING` for the database connection.

### Start DAB Locally

1. **Ensure your database is running** and the connection string is set:
   ```bash
   # Linux/macOS
   export DATABASE_CONNECTION_STRING="Server=localhost,1433;Database=Inventory;..."

   # Windows PowerShell
   $env:DATABASE_CONNECTION_STRING='Server=localhost\SQLEXPRESS;Database=Inventory;...'
   ```

2. **Start DAB** from the project root:
   ```bash
   dab start -c ./dab/dab-config.json
   ```

3. **Verify DAB is running** by visiting the Swagger UI:
   ```
   http://127.0.0.1:5000/swagger/index.html
   ```

4. **Keep DAB running** in this terminal while you develop. Open a new terminal for other commands.

### Testing the API

Once DAB is running, you can test the API endpoints:

- **Swagger UI**: [http://127.0.0.1:5000/swagger/index.html](http://127.0.0.1:5000/swagger/index.html)
- **REST endpoints**: Available at `http://127.0.0.1:5000/api/<entity-path>`
  - Example: `http://127.0.0.1:5000/api/items`
  - Example: `http://127.0.0.1:5000/api/categories`

### Local Development Workflow

When developing locally:

1. Start your local SQL Server database
2. Start DAB in one terminal: `dab start -c ./dab/dab-config.json`
3. In another terminal, start the SWA CLI for the frontend:
   ```bash
   npm run dev
   # or
   swa start
   ```

The frontend will make API calls to the local DAB instance.

---

## Production/Staging Deployment

### Overview

In production and staging environments, DAB runs as a containerized application in **Azure Container Apps**, linked to your Static Web App.

### Prerequisites

- An existing Azure Static Web App (see [deployment-guide.md](deployment-guide.md))
- An Azure SQL Database (see [database-setup.md](database-setup.md))
- Azure CLI installed and authenticated
- Your `dab-config.json` file configured for production

### Deployment Steps

This project uses the official DAB container image from Microsoft Container Registry (MCR), so you don't need to build or maintain your own container registry.

Follow Microsoft's official guide for publishing DAB to Container Apps:
[https://learn.microsoft.com/en-us/azure/data-api-builder/deployment/how-to-publish-container-apps](https://learn.microsoft.com/en-us/azure/data-api-builder/deployment/how-to-publish-container-apps)

**High-level steps:**

1. **Prepare your DAB configuration file** for production:
   - Ensure `dab/dab-config.json` is configured correctly
   - Update the `host.mode` to `production` if needed
   - Verify all entity permissions are set appropriately

2. **Create an Azure Container App Environment** (if you don't have one):
   ```bash
   az containerapp env create \
     --name <environment-name> \
     --resource-group <resource-group> \
     --location <location>
   ```

3. **Deploy DAB using the official MCR image**:
   ```bash
   az containerapp create \
     --name <container-app-name> \
     --resource-group <resource-group> \
     --environment <environment-name> \
     --image mcr.microsoft.com/azure-databases/data-api-builder:latest \
     --target-port 5000 \
     --ingress external \
     --env-vars DATABASE_CONNECTION_STRING=<your-connection-string>
   ```

4. **Upload your configuration file** to the Container App:
   - You can mount the config file as a volume or pass it via environment variables
   - See Microsoft's documentation for configuration management options

5. **Link the Container App to your Static Web App**:
   ```bash
   az staticwebapp backends link \
     --resource-group <resource-group> \
     --name <swa-name> \
     --backend-resource-id <container-app-resource-id> \
     --backend-name dab-api
   ```

### Using Managed Identity (Recommended)

For enhanced security, use Managed Identity instead of connection strings:

1. **Enable managed identity** on the Container App
2. **Grant the managed identity access** to Azure SQL (see [database-setup.md](database-setup.md))
3. **Update the connection string** in the Container App environment to use managed identity authentication

See: [Tutorial on Managed Identity with Azure SQL](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-azure-database)

### Environment Variables

Set the following environment variables in your Container App:

- `DATABASE_CONNECTION_STRING` - Connection to Azure SQL Database
- Any other custom configuration needed for your environment

---

## DAB Configuration Guide

### Configuration File Structure

The `dab-config.json` file contains:

```json
{
  "$schema": "...",
  "data-source": {
    "database-type": "mssql",
    "connection-string": "@env('DATABASE_CONNECTION_STRING')"
  },
  "runtime": {
    "rest": { "enabled": true },
    "host": { "mode": "development" }
  },
  "entities": { ... }
}
```

### Adding New Entities

To expose a new database table or stored procedure via the API:

1. **Add an entity** to the `entities` section in `dab-config.json`:

```json
"MyEntity": {
  "source": {
    "object": "dbo.MyTable",
    "type": "table",
    "key-fields": ["id"]
  },
  "rest": {
    "enabled": true,
    "path": "/my-entity"
  },
  "permissions": [
    {
      "actions": ["read", "create", "update", "delete"],
      "role": "admin"
    },
    {
      "actions": ["read"],
      "role": "volunteer"
    }
  ]
}
```

2. **Restart DAB** to apply the changes

3. **Test the new endpoint** at `http://127.0.0.1:5000/api/my-entity`

### Permissions and Roles

DAB enforces role-based access control. The available roles in this application are:
- `admin` - Full access to all entities
- `volunteer` - Limited access, primarily read operations
- `anonymous` - Minimal or no access (used sparingly)

Each entity defines which actions each role can perform:
- `read` - GET requests
- `create` - POST requests
- `update` - PATCH/PUT requests
- `delete` - DELETE requests
- `execute` - For stored procedures
- `*` - All actions

---

## Troubleshooting

### DAB won't start
- Verify .NET 8 SDK is installed: `dotnet --version`
- Check that `DATABASE_CONNECTION_STRING` is set: `echo $DATABASE_CONNECTION_STRING`
- Ensure the database is running and accessible
- Check the connection string format matches your database type

### API returns 401/403 errors
- Verify role configuration in `dab-config.json`
- Check that the `X-MS-API-ROLE` header is being sent with requests
- Review permissions for the specific entity

### Database connection fails
- Test the connection string directly with a SQL client
- Ensure firewall rules allow access (for Azure SQL)
- For managed identity, verify the identity has proper SQL permissions

### Swagger UI shows no endpoints
- Check that `runtime.rest.enabled` is `true` in config
- Verify entities have `rest.enabled: true`
- Restart DAB after configuration changes

---

## Migration Notes

### Migrating from SWA Database Connections

If you're migrating from the deprecated SWA Database Connections:

1. **Configuration file differences**:
   - Old: `staticwebapp.database.config.json`
   - New: `dab/dab-config.json`
   - The structure is similar but DAB config has additional options

2. **API endpoint changes**:
   - Old: `/data-api/rest/<entity>`
   - New: `/api/<entity>` (or custom path defined in config)
   - Update frontend API calls accordingly

3. **Authentication**:
   - The role-based authentication mechanism remains the same
   - Ensure `staticwebapp.config.json` routes are properly configured

4. **Local development**:
   - Old: Used `swa start` with built-in database connections
   - New: Run DAB separately with `dab start`

---

## Additional Resources

- [Data API Builder Documentation](https://learn.microsoft.com/en-us/azure/data-api-builder/)
- [DAB CLI Reference](https://learn.microsoft.com/en-us/azure/data-api-builder/command-line/)
- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Static Web Apps with Container Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-container-apps)
- [DAB GitHub Repository](https://github.com/Azure/data-api-builder)

---

## Next Steps

- Review [database-setup.md](database-setup.md) for database configuration
- See [deployment-guide.md](deployment-guide.md) for full deployment instructions
- Check [overall-solution-arch.md](overall-solution-arch.md) for architecture overview
