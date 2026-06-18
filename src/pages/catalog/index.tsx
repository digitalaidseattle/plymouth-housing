/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert, Tabs, Tab } from '@mui/material';
import MainCard from '../../components/MainCard';
import SnackbarAlert from '../../components/SnackbarAlert';
import { useCatalog } from './useCatalog';
import ItemsTable from './ItemsTable';
import CategoriesTable from './CategoriesTable';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
};

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  // Keep inactive panels mounted (display: none) so each table's search,
  // pagination, and edit state survives tab switches.
  const isActive = value === index;
  return (
    <Box
      role="tabpanel"
      hidden={!isActive}
      sx={{ pt: 2, flex: 1, minHeight: 0, flexDirection: 'column', display: isActive ? 'flex' : 'none' }}
    >
      {children}
    </Box>
  );
};

const Catalog = () => {
  const {
    items,
    categories,
    isLoading,
    error,
    fetchData,
    createItem,
    updateItem,
    createCategory,
    updateCategory,
    clearError,
  } = useCatalog();

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuccess = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success',
    });
  };

  const handleError = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          onClose={clearError}
          action={
            <Typography
              component="span"
              sx={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              onClick={() => {
                clearError();
                fetchData();
              }}
            >
              Retry
            </Typography>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <MainCard
        border={false}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}
        contentSX={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Items" sx={{ typography: 'body1' }} />
            <Tab label="Categories" sx={{ typography: 'body1' }} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ItemsTable
            items={items}
            categories={categories}
            onUpdate={updateItem}
            onCreate={createItem}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CategoriesTable
            categories={categories}
            onUpdate={updateCategory}
            onCreate={createCategory}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </TabPanel>
      </MainCard>

      <SnackbarAlert
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
      >
        {snackbar.message}
      </SnackbarAlert>
    </Box>
  );
};

export default Catalog;

