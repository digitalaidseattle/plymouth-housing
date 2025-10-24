# Overall Architecture

Here is a general outline of the architecture for the Plymouth Inventory management app based on the requirements.

![Architecture Diagram](./assets/overall-arch.drawio.svg)

## Components:

1. **Azure Static Web Apps (SWA)**:
   - Acts as the frontend for your inventory management application
   - Serves the React application interface for both admins and volunteers
   - Handles routing based on user roles (admins vs. volunteers), providing different dashboards for each
   - Integrates with Azure Entra ID for authentication

2. **Azure Container Apps (Data API Builder)**:
   - Runs the Data API Builder (DAB) container as the API layer
   - Provides REST API endpoints for the frontend to access database resources
   - Enforces role-based permissions (admin, volunteer, anonymous) on API operations
   - Uses Managed Identity to securely connect to Azure SQL Database
   - Replaces the deprecated SWA Database Connections feature
   - See [DAB-setup.md](DAB-setup.md) for detailed configuration

3. **Azure SQL Database**:
   - Stores inventory data (e.g., kitchen utensils, sheets, cleaning supplies), volunteer names, and PINs
   - Uses Managed Identity for secure connections from the Container App (DAB)
   - Admins can access the SQL database using traditional username and password authentication for management tasks

4. **Azure Entra ID (Azure Active Directory)**:
   - Manages authentication and user identity
   - Distinguishes between **Admins** and **Volunteers** roles
   - Managed Identity is used by the Container App to authenticate to the database

## Authentication and Authorization Flow

1. **Frontend Authentication** (Azure Entra ID):
   - Users authenticate through Azure Entra ID when accessing the Static Web App
   - Roles (admin, volunteer) are assigned through Azure Entra ID

2. **API Authorization** (DAB):
   - All frontend API requests go through the DAB container
   - The `X-MS-API-ROLE` header is sent with each request
   - DAB enforces permissions based on role and entity configuration in `dab-config.json`
   - Each entity (table/stored procedure) defines allowed actions per role

3. **User-Specific Flows**:
   - **Admins**:
     - Authenticate via Azure Entra ID
     - Access admin dashboard with full CRUD operations on inventory, users, and categories
     - API requests use `admin` role for full permissions
   - **Volunteers**:
     - Authenticate via Azure Entra ID
     - Enter PIN for additional verification (verified via stored procedure)
     - Access simplified dashboard for basic inventory operations
     - API requests use `volunteer` role with limited permissions

For more details on setting up authentication and permissions, see:
- [deployment-guide.md](deployment-guide.md) for Azure Entra ID setup
- [DAB-setup.md](DAB-setup.md) for API permissions configuration

