# Data API Builder (DAB) Setup

## Introduction

This project uses [Data API Builder (DAB)](https://learn.microsoft.com/en-us/azure/data-api-builder/) to provide REST API access to our Azure SQL Database. DAB is a containerized API layer that sits between our Static Web App (SWA) frontend and the database.

**Why DAB in a Container?**
- DAB in containers provides a modern, scalable API layer
- Better separation of concerns between frontend and backend
- Enhanced security through Azure Container Apps managed identity (future)
- Consistent configuration across local development and production environments

For more information, see:
- [Azure Static Web Apps with Container Apps API](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-container-apps)
- [DAB Official Documentation](https://learn.microsoft.com/en-us/azure/data-api-builder/)

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
- Role-based permissions (admin, volunteer)
- Exposed stored procedures

The configuration uses the environment variables 
- `DATABASE_CONNECTION_STRING` for the database connection 
- `DAB_HOST_MODE` for production/development differentiation.

### Start DAB Locally

1. **Ensure your database is running** and the connection string is set:
   ```bash
   # Linux/macOS
   export DATABASE_CONNECTION_STRING="Server=localhost,1433;Database=Inventory;..."

   # Windows PowerShell
   $env:DATABASE_CONNECTION_STRING='Server=localhost\SQLEXPRESS;Database=Inventory;...'
   ```

2. **Configure DAB for extensive logging** :
   ```bash
   # Linux/macOS
   export DAB_HOST_MODE='development'

   # Windows PowerShell
   $env:DAB_HOST_MODE='development'
   ```

3. **Start DAB** from the project root:
   ```bash
   dab start -c ./dab/dab-config.json
   ```

4. **Verify DAB is running** by visiting the Swagger UI:
   ```
   http://127.0.0.1:5000/swagger/index.html
   ```

5. **Keep DAB running** in this terminal while you develop. Open a new terminal for other commands. 

For starting the front end, see [SWA Setup](./swa-setup.md)

### Testing the API

Once DAB is running, you can view the endpoints in **Swagger UI**: [http://127.0.0.1:5000/swagger/index.html](http://127.0.0.1:5000/swagger/index.html).

SWA adds another cookie parameter to requests, so you can't easily test the APIs themselves, either in Swagger or by calling them directly. 

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

To deploy configuration file changes to an existing Container App, see [dab-deployment.md](dab-deployment.md).

### Environment Variables

Set the following environment variables in your Container App:

- `DATABASE_CONNECTION_STRING` - Connection to Azure SQL Database
- Any other custom configuration needed for your environment

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

### Permissions and Roles

DAB enforces role-based access control. The available roles in this application are:
- `admin` - Full access to all entities
- `volunteer` - Limited access, primarily read operations

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

### Database connection fails
- Test the connection string directly with a SQL client
- Ensure firewall rules allow access (for Azure SQL)
- For managed identity, verify the identity has proper SQL permissions

### Swagger UI shows no endpoints
- Check that `runtime.rest.enabled` is `true` in config
- Verify entities have `rest.enabled: true`
- Restart DAB after configuration changes

## Additional Resources

- [Data API Builder Documentation](https://learn.microsoft.com/en-us/azure/data-api-builder/)
- [DAB CLI Reference](https://learn.microsoft.com/en-us/azure/data-api-builder/command-line/)
- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Static Web Apps with Container Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-container-apps)
- [DAB GitHub Repository](https://github.com/Azure/data-api-builder)
