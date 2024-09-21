# Plymouth Housing

This repo is bootstrapped from our DAS admin template, that forms the basis for line-of-business web applications.  Frequently, partners need a simple CRUD interface for applications like:
* inventory management
* project/task tracking
* document submittal

The template supports these application types by providing an application shell with common features such as:
* authentication
* dialogs for data entry
* data tables
* form validation
* file uploads
* drag-and-drop
* Excel spreadsheet support

A venture squad will be able to copy this template and modify it to suit their venture's need.

## Dependencies
The template is built with:
* React
* TypeScript
* Material UI
* Vite
* Supabase
* Prettier


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



## Features
### Application Shell
The responsive shell that provides a toolbar, navbar, and aside. 

### Authentication
The DAS template uses Supabase for user authentication and authorization.  Implementation for Google and Microsoft authentication is provided.

### CRUD
The DAS template uses Supabase for data storage.  It is anticipated that applications requiring RDBMS support would use this.  Examples of lists, dialogs, and forms with validation are available.

### Markdown
The DAS template includes support for displaying Markdown. The typical use-case is to display privacy policies and/or terms and conditions.  The content on the page can be stored as a application resource to allow changes withou redployment.  One consequence of supporting Markdown is not using Tailwind CSS.  Tailwind removes default formatting from HTML components (e.g. h1 renders plainly with default font size and weight). Markdown is implemented with react-markdown.

### File Storage
The DAS template includes an example of uploading, reading, as listing of files in Supabase's storage system.  The use-case for this could include storing documents, like release forms, for an application. The file `src/pages/UploadPage.tsx` is the entry point for the example.

### Maps
The DAS template includes an example mapping page `src/pages/MapPage.tsx`.  Maps were implemented with react-map-gl & maplibre-gl.

### Drag & Drop
The DAS template includes an example of drag-and-drop use. Drag and drop is implemented with @dnd-kit/core and @dnd-kit/sortable.

### Polling
The application shell includes a 10 second timer. The refresh context can be used to refresh components with current data.

```
    const { refresh } = useContext(RefreshContext)

    useEffect(() => {
        // Refresh action
        ticketService.getTickets(NUM_TIX)
            .then((tix) => setTickets(tix))
    }, [refresh])
```

## Deployment
The application is deployed at Google's Firebase as a static website.  GitHub's workflow action adds site secrets to the build before deploying.

## FAQ
### How do I connect to Supabase?
Environment variables for the connecting to Supabase must be added to the hosting platform as well as the `.env.local` file.  Squad members must obtain the supabase url and auth_anon_key for accessing the Supabase project.

### How do I change the menu items?
Contents of the navbar, the drawer of links on the left of the application window, can be modified by changing the contents of `/src/menu-items/index.tsx`.

### How do I change the toolbar items?
Contents of the toolbar, the links at the top the application window and left of the profile button, can be modified by changing the contents of `/src/toolbar-items/index.tsx`. The file `/src/sections/tickets/TicketToolbarItem` contains an example of what can be done with a toolbar item.

### How do I add a page to the application?
Since the template uses `react-router-dom` for application routing, there is no requirement to placement new pages in the `pages` folder.  It is by convention that new pages are placed there.  For the page to be included in the application `src/pages/routes.tsx` must be updated to include the new page.

### Where does the partner logo get changed?
The logo, displayed in the upper left hand of the application window and elsewhere, can be modified in `/src/components/Logo/Logo.tsx`.  The image files should be placed in the `/src/assets/images/` directory.
