# Overall Architecture

Here is a general outline of the architecture for the Plymouth Inventory management app based on the requirements.

![Architecture Diagram](./assets/overall-arch.drawio.svg)

## Components:

1. Azure Static Web Apps (SWA):
   - Acts as the frontend for your inventory management application.
   - Serves the application interface for both admins and volunteers.
   - Handles routing based on user roles (admins vs. volunteers), providing different dashboards for each.

1. Azure SQL Database:
   - Stores inventory data (e.g., kitchen utensils, sheets, cleaning supplies), volunteer names, and PINs.
   - Uses Managed Identity to securely connect with the Azure SWA without the need for hardcoded credentials.
   - Admins can access the SQL database using traditional username and password authentication.

1. Azure Entra ID (Azure Active Directory):
   - Manages authentication and user identity.
   - Distinguishes between **Admins** and **Volunteers** roles
   - Managed ID is used by the Web App to authenticate to the database.

## Authentication and Authorization Flow
   - **Admins** authenticate via Azure Entra ID and access a specific dashboard tailored to their role, including the ability to manage inventory and other users.
   - **Volunteers**. After logging in, they select their name from a dropdown and enter a PIN, which is verified against the data stored in Azure SQL. They access a simplified dashboard to perform basic inventory tasks, such as checking items in and out.

