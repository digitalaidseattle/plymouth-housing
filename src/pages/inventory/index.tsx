import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Alert, Box, Button, Pagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddItemModal from '../../components/inventory/AddItemModal.tsx';
import AdjustQuantityModal from '../../components/inventory/AdjustQuantityModal.tsx';
import InventoryFilter from '../../components/inventory/InventoryFilter';
import InventoryTable from '../../components/inventory/InventoryTable';
import { UserContext } from '../../components/contexts/UserContext';
import { CategoryItem, InventoryItem } from '../../types/interfaces.ts';
import { getItems, getCategories } from '../../services/itemsService';
import { SETTINGS } from '../../types/constants';
import SnackbarAlert from '../../components/SnackbarAlert';
import { useLocation } from 'react-router-dom';

const Inventory = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [originalData, setOriginalData] = useState<InventoryItem[]>([]);
  const [displayData, setDisplayData] = useState<InventoryItem[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [sortDirection, setSortDirection] = useState<
    'asc' | 'desc' | 'original'
  >('original');
  const [sortColumn, setSortColumn] = useState<keyof InventoryItem | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    search: '',
  });
  const [anchors, setAnchors] = useState({
    type: null as null | HTMLElement,
    category: null as null | HTMLElement,
    status: null as null | HTMLElement,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'warning';
  }>({
    open: location.state && location.state.message,
    message: location.state ? location.state.message : '',
    severity: 'success',
  });
  const [itemsPerPage, setItemsPerPage] = useState(SETTINGS.itemsPerPage);
  const tableContainerRef = useRef<HTMLElement | null>(null);
  const [showResults, setShowResults] = useState(false);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayData.slice(indexOfFirstItem, indexOfLastItem);

  const calculateItemsPerPage = () => {
    if (tableContainerRef.current) {
      const parentHeight =
        tableContainerRef.current?.parentElement?.clientHeight ?? 0; // Calculates the parent container height in px
      const tableHeight = (parentHeight * 80) / 100; // Calculates the table height in px as 80% of the parent height
      const items = Math.floor(tableHeight / 64); // Within the table height, each row has a height of 64px. Sets how many items to be shown within each table
      setItemsPerPage(items > 0 ? items - 1 : 1); // Subtract 1 because of header row
    }
  };

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

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
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
    setCurrentPage(1);
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

  useEffect(() => {
    const handler = setTimeout(() => {
      calculateItemsPerPage();
    }, 0);
    window.addEventListener('resize', calculateItemsPerPage);
    return () => {
      clearTimeout(handler);
      window.removeEventListener('resize', calculateItemsPerPage);
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilter();
    }, 300); // Reduces calls to filter while typing in search
    return () => {
      clearTimeout(handler);
    };
  }, [filters, handleFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilter();
    }, 0);
    return () => clearTimeout(handler);
  }, [sortDirection, handleFilter]);

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

  if (isLoading) {
    return <p>Loading ...</p>;
  }

  return (
    <Box ref={tableContainerRef} sx={{ height: '100%' }}>
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
      {/* Add button */}
      <Box id="add-container" sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button
          sx={{ bgcolor: '#F5F5F5', color: 'black' }}
          onClick={handleAddOpen}
        >
          <AddIcon fontSize="small" sx={{ color: 'black' }} />
          Add
        </Button>
      </Box>

      <AddItemModal
        addModal={addModal}
        handleAddClose={handleAddClose}
        fetchData={fetchData}
        originalData={originalData}
        showResults={showResults}
        setShowResults={setShowResults}
      />

      <AdjustQuantityModal
        showDialog={adjustModal}
        handleClose={() => setAdjustModal(false)}
        fetchData={fetchData}
        itemToEdit={itemToEdit}
        handleSnackbar={setSnackbarState}
      />

      {/* Inventory Filter */}
      <InventoryFilter
        filters={filters}
        anchors={anchors}
        categoryData={categoryData}
        handleFilterClick={handleFilterClick}
        handleMenuClick={handleMenuClick}
        clearFilter={clearFilter}
        handleSearch={handleSearch}
      />

      {/* Inventory Table */}
      <InventoryTable
        currentItems={currentItems}
        sortDirection={sortDirection}
        sortColumn={sortColumn}
        handleSort={handleSort}
        setAdjustModal={setAdjustModal}
        setItemToEdit={setItemToEdit}
      />

      {/* Pagination */}
      <Box
        sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
      >
        <Pagination
          count={Math.ceil(displayData.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
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
