/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Alert, Box, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddItemModal from '../../components/inventory/AddItemModal.tsx';
import AdjustQuantityModal from '../../components/inventory/AdjustQuantityModal.tsx';
import InventoryFilter from '../../components/inventory/InventoryFilter';
import InventoryTable from '../../components/inventory/InventoryTable';
import { UserContext } from '../../components/contexts/UserContext';
import { CategoryItem, InventoryItem } from '../../types/interfaces.ts';
import { getItems, getCategories } from '../../services/itemsService';
import SnackbarAlert from '../../components/SnackbarAlert';
import { useLocation } from 'react-router-dom';

const Inventory = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  // Set by the Home page's Restock button and the Inventory sub-menu items.
  const navState = location.state as {
    inventoryType?: 'General' | 'Welcome Basket';
    openAddModal?: boolean;
    message?: string;
  } | null;
  const [originalData, setOriginalData] = useState<InventoryItem[]>([]);
  const [displayData, setDisplayData] = useState<InventoryItem[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [sortDirection, setSortDirection] = useState<
    'asc' | 'desc' | 'original'
  >('original');
  const [sortColumn, setSortColumn] = useState<keyof InventoryItem | null>(null);
  const [addModal, setAddModal] = useState(Boolean(navState?.openAddModal));
  const [adjustModal, setAdjustModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    type: navState?.inventoryType ?? '',
    category: '',
    status: '',
    search: '',
  });
  const [anchors, setAnchors] = useState({
    type: null as null | HTMLElement,
    category: null as null | HTMLElement,
    status: null as null | HTMLElement,
  });
  const [error, setError] = useState<string | null>(null);
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning';
  }>({
    open: Boolean(navState?.message),
    message: navState?.message ?? '',
    severity: 'success',
  });
  const [showResults, setShowResults] = useState(false);

  const handleAddOpen = () => {
    setAddModal(true);
    setShowResults(false);
  };

  const handleAddClose = () => {
    setAddModal(false);
  };

  // Consolidated function for handling all filter clicks
  const handleFilterClick = (
    filter: 'type' | 'category' | 'status',
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setAnchors((prev) => ({ ...prev, [filter]: event.currentTarget }));
  };

  const handleSort = (column: keyof InventoryItem) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection('original');
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleMenuClose = (menu: keyof typeof anchors) => {
    setAnchors((prev) => ({ ...prev, [menu]: null }));
  };

  // Consolidated function for handling all menu item clicks (type, category, status)
  const handleMenuClick = (
    filter: 'type' | 'category' | 'status',
    value: string,
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: value,
    }));
    handleMenuClose(filter);
  };

  // Consolidated filter clearing function
  const clearFilter = (filter: 'type' | 'category' | 'status') => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: '',
    }));
  };

  const handleSearch = (value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search: value,
    }));
  };

  const negativeItemCount = originalData.filter(
    (item) => item.quantity < 0,
  ).length;

  const handleFilter = useCallback(() => {
    const searchFiltered = originalData.filter(
      (row: {
        name: string;
        type: string;
        description: string;
        category: string;
        quantity: number;
        status: string;
      }) => {
        const matchesType = filters.type
          ? row.type.toLowerCase().includes(filters.type.toLowerCase())
          : true;

        const matchesCategory = filters.category
          ? row.category.toLowerCase().includes(filters.category.toLowerCase())
          : true;

        const matchesStatus = filters.status
          ? row.status.toLowerCase().includes(filters.status.toLowerCase())
          : true;

        const lowerCaseSearch = filters.search.toLowerCase();

        const matchesSearch = filters.search
          ? row.name.toLowerCase().includes(lowerCaseSearch) ||
            row.description?.toLowerCase().includes(lowerCaseSearch) ||
            row.type.toLowerCase().includes(lowerCaseSearch) ||
            row.category.toLowerCase().includes(lowerCaseSearch) ||
            row.status.toLowerCase().includes(lowerCaseSearch) ||
            row.quantity.toString().toLowerCase().includes(lowerCaseSearch)
          : true;

        return matchesType && matchesCategory && matchesSearch && matchesStatus;
      },
    );

    if (sortColumn && sortDirection !== 'original') {
      searchFiltered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortDirection === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    setDisplayData(searchFiltered);
  }, [filters, sortDirection, sortColumn, originalData]);

  const fetchData = useCallback(async () => {
    try {
      const inventoryList = await getItems(user);
      setOriginalData(inventoryList);
      setDisplayData(inventoryList);
    } catch (error) {
      setError('Could not get inventory. \r\n' + error);
      console.error('Could not get inventory:', error);
    }
    setIsLoading(false);
  }, [user]);

  const fetchCategories = useCallback(async () => {
    try {
      const categories = await getCategories(user);
      setCategoryData(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [user]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
      fetchCategories();
    }, 0);
    return () => clearTimeout(handler);
  }, [user, fetchData, fetchCategories]);

  // /inventory is one route, so switching sub-items does not remount this
  // component and the useState initialisers above do not re-run.
  useEffect(() => {
    if (navState?.inventoryType) {
      setFilters((prev) => ({ ...prev, type: navState.inventoryType! }));
    }
    if (navState?.openAddModal) {
      setAddModal(true);
      setShowResults(false);
    }
  }, [navState]);


  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilter();
    }, 300); // Reduces calls to filter while typing in search
    return () => clearTimeout(handler);
  }, [handleFilter]);

  useEffect(() => {
    if (error) {
      const handler = setTimeout(() => {
        setSnackbarState({ open: true, message: error, severity: 'warning' });
      }, 0);
      return () => clearTimeout(handler);
    }
  }, [error]);

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarState({ ...snackbarState, open: false });
  };

  // When the table is scoped to one inventory type, lock the Add dialog to it.
  const modalInventoryType =
    filters.type === 'General' || filters.type === 'Welcome Basket'
      ? filters.type
      : undefined;

  if (isLoading) {
    return <p>Loading ...</p>;
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Negative item warning */}
      <Box
        id="negative-warning-container"
        sx={{ display: 'flex', justifyContent: 'start', mt: 2 }}
      >
        {negativeItemCount > 0 ? (
          <Alert severity="warning">
            {negativeItemCount}{' '}
            {negativeItemCount === 1 ? 'item needs' : 'items need'} review.
          </Alert>
        ) : (
          <></>
        )}
      </Box>
      <AddItemModal
        key={filters.type}
        addModal={addModal}
        handleAddClose={handleAddClose}
        fetchData={fetchData}
        originalData={originalData}
        showResults={showResults}
        setShowResults={setShowResults}
        inventoryType={modalInventoryType}
      />

      <AdjustQuantityModal
        showDialog={adjustModal}
        handleClose={() => setAdjustModal(false)}
        fetchData={fetchData}
        itemToEdit={itemToEdit}
        handleSnackbar={setSnackbarState}
      />

      {/* Toolbar: filters + add */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', width: '100%' }}>
        <Box sx={{ flexGrow: 1 }}>
          <InventoryFilter
            filters={filters}
            anchors={anchors}
            categoryData={categoryData}
            handleFilterClick={handleFilterClick}
            handleMenuClick={handleMenuClick}
            clearFilter={clearFilter}
            handleSearch={handleSearch}
          />
        </Box>
        <Button variant="contained" onClick={handleAddOpen}>
          <AddIcon fontSize="small" />
          Add
        </Button>
      </Stack>

      {/* Inventory Table */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <InventoryTable
          items={displayData}
          sortDirection={sortDirection}
          sortColumn={sortColumn}
          handleSort={handleSort}
          setAdjustModal={setAdjustModal}
          setItemToEdit={setItemToEdit}
        />
      </Box>

      <SnackbarAlert
        open={snackbarState.open}
        onClose={handleSnackbarClose}
        severity={snackbarState.severity}
      >
        {snackbarState.message}
      </SnackbarAlert>
    </Box>
  );
};

export default Inventory;
