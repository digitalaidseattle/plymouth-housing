# Deploying DAB Configuration Changes

## Overview

This project uses **Azure Files volume mount** to manage the DAB configuration. The `dab-config.json` file is stored in Azure Storage and mounted as a volume in the Container App. This allows you to update the configuration directly through the Azure Portal without rebuilding container images.

## How It Works

```
Azure Files Storage
    └── File Share
        └── dab-config.json
                ↓ (mounted as volume)
        Azure Container App
            └── DAB Container
                └── /App/dab-config.json
```

When you replace `dab-config.json` in Azure Files, the container will use the new configuration after it's restarted. 

## Prerequisites

- Access to the **Azure Portal** ([portal.azure.com](https://portal.azure.com))
- Permissions to modify files in the Azure Storage Account
- `dab-config.json` tested locally before deploying

## Deployment Process

### 1. Test Configuration Locally

Always test your configuration changes locally before deploying to Azure:

```bash
# Ensure DATABASE_CONNECTION_STRING is set
export DATABASE_CONNECTION_STRING="Server=localhost,1433;Database=Inventory;..."
export DAB_HOST_MODE='development'

# Start DAB with the updated config
dab start -c ./dab/dab-config.json

# Verify endpoints in Swagger UI
# http://127.0.0.1:5000/swagger/index.html
```

Test your new entities, permissions, or other changes thoroughly.

### 2. Replace Configuration File in Azure Storage Browser

1. **Navigate to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure credentials

2. **Open Storage Browser**
   - In the left sidebar, search for and select **"Storage browser"**
   - Or navigate directly to: `portal.azure.com/#view/Microsoft_Azure_Storage/StorageBrowserViewV2`

3. **Locate the Configuration File**
   - Expand **"Storage accounts"** in the left panel
   - Find your storage account (e.g., `plymouthhousingdev`)
   - Expand **"File shares"**
   - Find the file share used for DAB config (commonly named `dab-config` or similar)
   - Navigate to find `dab-config.json`

4. **Replace the File**
   - Select `dab-config.json` in the file share
   - Click **"Upload"** in the toolbar. Check the box to replace the existing file. 
   - Select your updated `dab-config.json` from your local `/dab` folder
   - Click **"Upload"** to replace the configuration

## Troubleshooting

### Issue: Changes not reflected after restart

**Possible causes:**
- Volume mount cache - wait a few minutes and restart again
- File not uploaded properly - verify in Storage Browser
- Wrong file share - confirm you replaced the file in the correct environment

**Solutions:**
1. Verify the file content in Azure Storage Browser matches your local file
2. Wait 2-3 minutes for Azure Files cache to clear
3. Restart the Container App again
4. Check container logs for errors

### Issue: Health check returns 503 after changes

**Possible causes:**
- Invalid JSON syntax in configuration file
- Database connection issues
- Invalid entity configuration

**Solutions:**
1. Check container logs in Azure Portal:
   - Go to Container App → **Logs** or **Log stream**
   - Look for DAB startup errors
2. Validate JSON syntax using an online validator
3. Restore from backup and try again
4. Test the configuration locally first

### Issue: New entity not appearing in Swagger

**Possible causes:**
- Configuration not reloaded
- REST endpoint not enabled
- Permissions blocking access

**Solutions:**
1. Verify `"rest": { "enabled": true }` in entity config
2. Check that the entity has appropriate permissions
3. Restart the Container App again
4. Clear browser cache and refresh Swagger UI

### Issue: Cannot upload/delete file in Storage Browser

**Possible causes:**
- Insufficient permissions
- File locked by container
- Storage account access issues

**Solutions:**
1. Verify you have **Storage Blob Data Contributor** or **Storage File Data SMB Share Contributor** role
2. Check that the file share is accessible
3. Contact your Azure administrator for permissions

## Monitoring and Logs

### View Container Logs

**Azure Portal:**
1. Navigate to your Container App
2. Select **"Log stream"** or **"Logs"** from the left menu
3. View real-time logs from the container

**Azure CLI:**
```bash
az containerapp logs show \
  --name $API_CONTAINER_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --follow
```

### Check Container App Status

```bash
az containerapp show \
  --name $API_CONTAINER_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --query "properties.runningStatus" \
  --output tsv
```

## Additional Resources

- [Azure Files Documentation](https://learn.microsoft.com/en-us/azure/storage/files/)
- [Azure Container Apps Volumes](https://learn.microsoft.com/en-us/azure/container-apps/storage-mounts)
- [DAB Configuration Reference](https://learn.microsoft.com/en-us/azure/data-api-builder/configuration-file)
- [Azure Storage Browser](https://learn.microsoft.com/en-us/azure/storage/storage-explorer/vs-azure-tools-storage-manage-with-storage-explorer)
- [Local DAB Setup](./DAB-setup.md)
