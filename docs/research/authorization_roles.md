# API Roles and Authorization
Static Web Apps allow for authorization by configuration. 
You can use it on [routes](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#routes)
as well as [API calls](https://learn.microsoft.com/en-us/azure/static-web-apps/database-overview#role-based-security).


## Objective
The Plymouth Housing Inventory app has two kinds of users: admins and volunteers. 
Depending on this role, the user has different permissions on the backend API. 
For example, admin users can add new volunteers to the database; volunteers can not. 
This does not appear to be working by default. 
All necessary steps have been taken (e.g., Volunteer and Admin are member of the SWA roles via invites).

## Approach
We analyzed the workings of the roles in the config file. We used 
- volunteer
- admin
- authenticated 
- anonymous

The last two are added implicitly. 

For example we gave **admin** all access to the items API and **volunteer** just read. 
Neither of those appeared to work. 
Only giving full rights to **anonymous** allowed the call to the API. 

## Results
It appears there is a correlation between the use of ```staticwebapp.config.json``` and passing on of the roles. 
When the contents of the file is empty ({}), the roles are not passed to the API (as witnessed in the browsers devtools, networking section). 
However, when some [boilerplate contents](https://learn.microsoft.com/en-us/azure/static-web-apps/add-authentication#add-authentication) is added to the file, the REST calls contain a base64 encoded Cookie: 

```
{
    "userId": "368df1fbd5179b7f42ae06d33c3c3500",
    "userRoles": ["anonymous", "authenticated", "admin"],
    "claims": [],
    "identityProvider": "aad",
    "userDetails": "Maarten"
}
```

Unfortunately, this only improves the situation a bit. 
Now we can use **authenticated** for the REST calls (The StoredProc still only works with anonymous.) 

We also tried adding the ```X-MS-API-ROLE``` to the header of the REST API call. 
This also did not change the behavior. 

It appears you need to do both according to the [DAP documentation](https://learn.microsoft.com/en-us/azure/data-api-builder/authorization):
- use the json file
- hard code a role in the ```X-MS-API-ROLE``` header. 

However, it looks like the current implementation of Authentication collides with the use of the ```staticwebapp.config.json```.  

## Next Steps
We will leave the current situation as-is during MVP and allow full access for anonymous on the API calls. 
A bug is logged to fix this post MVP. 

Current situation
- empty ```staticwebapp.config.json```
- full access for anonymous on API calls:
```      "permissions": [
        {
          "actions": ["*"],
          "role": "anonymous"
        }
```