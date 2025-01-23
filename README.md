# Plymouth Housing
[Plymouth Housing](https://plymouthhousing.org/)’s mission is to eliminate homelessness and address its causes by preserving, developing, and operating safe, quality, supportive housing and by providing adults experiencing homelessness with opportunities to stabilize and improve their lives.

## **Table of Contents**  
1. [About the Project](#about-the-project)  
1. [Getting Started](#getting-started)  
1. [Contributing](#contributing)  
1. [Code Formatting](#code-formatting)

---

## **About the Project**  
This repo provides an inventory management system for Plymouth Housing. 

### **Built With**  
- [React](https://example.com)  
- [Vite](https://example.com)  
- [Azure Static Web Apps](https://example.com)
- [Azure SQL server](https://example.com)

## **Getting Started**  

### **Prerequisites**  

- [**Visual Studio Code**](https://code.visualstudio.com/download). 

- [**Node**](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

- **PowerShell** is required for bootstrapping the database. PowerShell is already installed on Windows. See database setup in next step for instruction to set it up on Mac.

- **SQL Server**. Either a locally running edition (highly recommended) or your own running in Azure. Developing against Staging will lead to conflicts. 

    See the [database section in the setup guide](/docs/setup-guide.md#local-database-for-development) for instructions how to set it up. 

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
1. Follow the steps in the [database-setup](/docs/database-setup.md) to install and bootstrap the database. 

1. The next step will throw errors if it can't find a connection-string as specified in [the config file](./swa-db-connections/staticwebapp.database.config.json). Make sure you have the environment variable for the connection string. 

1. Start the app locally with 
    ```
    swa start 
    ```
    For debugging you can add ```--verbose=silly``` to the ```swa``` command.
   
1. Go to http://localhost:4280.

   NOTE
   - The default Vite port 3000 is also available, but the app won't be able to access the REST API from there. This back end API is bootstrapped with configuration out of [```staticwebapp.database.config.json```](../swa-db-connections/staticwebapp.database.config.json). See documentation for all the settings. 

    - You can start the app with ```npm run dev``` but again, that doesn't set up the Data API layer. That is why you need to use the [SWA CLI](https://azure.github.io/static-web-apps-cli/docs/intro).  


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

