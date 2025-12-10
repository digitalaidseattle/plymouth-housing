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
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
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
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
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
    <Box>
      <MainCard>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Items" sx={{ fontSize: '1.1rem' }} />
            <Tab label="Categories" sx={{ fontSize: '1.1rem' }} />
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
