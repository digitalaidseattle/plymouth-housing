# Plymouth Housing
[Plymouth Housing](https://plymouthhousing.org/)’s mission is to eliminate homelessness and address its causes by preserving, developing, and operating safe, quality, supportive housing and by providing adults experiencing homelessness with opportunities to stabilize and improve their lives.

## **Table of Contents**  
1. [About the Project](#about-the-project)  
1. [Getting Started](#getting-started)  
1. [Contributing](#contributing)  
1. [Code Formatting](#code-formatting)

---

## **About the Project**  
At Plymouth Housing, managing in-kind donations efficiently has been a significant challenge. Currently, these donations are tracked manually, leading to frequent errors and inconsistencies. This outdated system complicates the distribution of essential items to residents, delaying their access to necessary resources and impacting their quality of life.

Digital Aid Seattle is stepping in to revolutionize Plymouth Housing’s operations with a new, centralized inventory management system. Designed with ease of use in mind, the system will require minimal training, enabling staff and volunteers to quickly adapt. It will feature real-time updates, straightforward data export capabilities, and comprehensive dashboards.

The deployment of this inventory management system is set to significantly enhance operational efficiency at Plymouth Housing. By ensuring a smoother flow of donations from intake to distribution, we will facilitate faster and more reliable access to necessary resources for residents.

### **Built With**
- [React](https://reactjs.org/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Azure Static Web Apps](https://azure.microsoft.com/en-us/services/app-service/static/) - Frontend hosting
- [Data API Builder (DAB)](https://learn.microsoft.com/en-us/azure/data-api-builder/) - API layer running in Azure Container Apps
- [Azure SQL Server](https://azure.microsoft.com/en-us/products/azure-sql/database/) - Database

## **Getting Started**  

### **Prerequisites**

- [**Visual Studio Code**](https://code.visualstudio.com/download)

- [**Node.js and npm**](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

- [**.NET 8 SDK**](https://dotnet.microsoft.com/download/dotnet/8.0) - Required for Data API Builder

- **PowerShell** - Required for bootstrapping the database. PowerShell is already installed on Windows. See [database-setup.md](/docs/database-setup.md) for Mac/Linux installation.

- **SQL Server** - Either a locally running edition (highly recommended) or your own running in Azure. Developing against Staging will lead to conflicts.

    See [database-setup.md](/docs/database-setup.md) for setup instructions. 

### **Installation**  
Steps to set up the project locally:  
1. Clone the repository:  
   ```bash
   git clone https://github.com/digitalaidseattle/plymouth-housing.git
   ```  
1. Navigate to the project directory:  
   ```bash
   cd plymouth-housing
   ```  
1. Install dependencies:  
   ```bash
   npm install
   ```  
1. Set up the database by following [database-setup.md](/docs/database-setup.md).

1. Set up Data API Builder (the API layer) by following [DAB-setup.md](/docs/DAB-setup.md).

1. Start the development environment as described in [DAB-setup.md](/docs/DAB-setup.md#local-development-workflow).


---

## **Contributing**  

### **How to Contribute**  
1. Clone the repository.  
2. Create your feature branch:  
   ```bash
   git checkout -b {name}/ticketnumber-YourFeatureName
   ```  
3. Commit your changes:  
   ```bash
   git commit -m 'Add a meaningful commit message'
   ```  
4. Push to the branch:  
   ```bash
   git push origin {feature branch}
   ```  
5. Open a Pull Request.  

### **Code of Conduct**
Please read our [Working Agreement](docs/working-agreement.md) for the project guidelines.

### **Documentation**
- [Database Setup](docs/database-setup.md) - SQL Server configuration and bootstrapping
- [DAB Setup](docs/DAB-setup.md) - Data API Builder configuration and local development
- [Deployment Guide](docs/deployment-guide.md) - Azure deployment instructions
- [Observability](docs/observability.md) - Microsoft Clarity and Azure Application Insights setup
- [Working Agreement](docs/working-agreement.md) - Team guidelines and practices

---


## Code Formatting

This project uses [Prettier](https://prettier.io/) to maintain a consistent code style. The configuration for Prettier is defined in the `.prettierrc` file at the root of the project.

To exclude specific files or directories from formatting, you can add them to the `.prettierignore` file.

To format your code, you can run the following command in your terminal:

```bash
npx prettier --write .
```
This command will automatically format all the files in your project according to the rules specified in the .prettierrc file.

If you're using Visual Studio Code, you can also set up Prettier to automatically format your code every time you save a file. Here's how:

- Install the Prettier extension from the VS Code marketplace.
- Open the settings (File > Preferences > Settings or Ctrl + , on Windows, Cmd + , on Mac).
- Search for "Format On Save" and make sure the "Editor: Format On Save" option is checked.
- Search for "Default Formatter" and select "Prettier - Code formatter".
- Now, every time you save a file, Prettier will automatically format it for you.

## Automated Tests
### For detailed setup instructions, dependency management, and test execution

- **UI tests**: [docs/e2e-automation-test.md](./docs/e2e-automation-test.md)
