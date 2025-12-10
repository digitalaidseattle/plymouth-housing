import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  TablePagination,
} from '@mui/material';
import { Check, Close, Add } from '@mui/icons-material';
import { AdminItem, CategoryItem } from '../../types/interfaces';
import SearchBar from '../../components/Searchbar/SearchBar';

type ItemsTableProps = {
  items: AdminItem[];
  categories: CategoryItem[];
  onUpdate: (id: number, updates: Partial<AdminItem>) => Promise<boolean>;
  onCreate: (item: Omit<AdminItem, 'id' | 'category_name'>) => Promise<boolean>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

type EditState = {
  id: number | null;
  field: string | null;
  value: string | number;
};

type NewItem = {
  name: string;
  type: string;
  category_id: string;
  description: string;
  quantity: string;
  threshold: string;
  items_per_basket: string;
};

const defaultNewItem: NewItem = {
  name: '',
  type: 'General',
  category_id: '',
  description: '',
  quantity: '0',
  threshold: '10',
  items_per_basket: '',
};

const ItemsTable = ({
  items,
  categories,
  onUpdate,
  onCreate,
  onSuccess,
  onError,
}: ItemsTableProps) => {
  const [editState, setEditState] = useState<EditState>({
    id: null,
    field: null,
    value: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<NewItem>(defaultNewItem);
  const [isSaving, setIsSaving] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter items by search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.category_name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Paginate
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleCellClick = (id: number, field: string, currentValue: string | number | null) => {
    if (editState.id === id && editState.field === field) return;
    setEditState({
      id,
      field,
      value: currentValue ?? '',
    });
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      await handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSave = async () => {
    if (editState.id === null || editState.field === null) return;

    const item = items.find(i => i.id === editState.id);
    if (!item) return;

    // Validate
    if (editState.field === 'name' && !String(editState.value).trim()) {
      onError('Item name cannot be empty');
      return;
    }

    if (editState.field === 'threshold') {
      const threshold = parseInt(String(editState.value));
      if (isNaN(threshold) || threshold < 0) {
        onError('Threshold must be a non-negative number');
        return;
      }
    }

    if (editState.field === 'quantity') {
      const quantity = parseInt(String(editState.value));
      if (isNaN(quantity)) {
        onError('Quantity must be a number');
        return;
      }
    }

    setIsSaving(true);
    try {
      const updates: Partial<AdminItem> = {};
      const field = editState.field as keyof AdminItem;

      if (field === 'name' || field === 'type' || field === 'description') {
        updates[field] = String(editState.value).trim();
      } else if (field === 'category_id' || field === 'quantity' || field === 'threshold') {
        updates[field] = parseInt(String(editState.value));
      } else if (field === 'items_per_basket') {
        const value = String(editState.value).trim();
        updates[field] = value ? parseInt(value) : null;
      }

      await onUpdate(editState.id, updates);
      onSuccess(`Item updated successfully`);
      setEditState({ id: null, field: null, value: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      onError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditState({ id: null, field: null, value: '' });
  };

  const handleAddNew = async () => {
    if (!newItem.name.trim()) {
      onError('Item name cannot be empty');
      return;
    }

    if (!newItem.category_id) {
      onError('Category must be selected');
      return;
    }

    const threshold = parseInt(newItem.threshold);
    if (isNaN(threshold) || threshold < 0) {
      onError('Threshold must be a non-negative number');
      return;
    }

    const quantity = parseInt(newItem.quantity);
    if (isNaN(quantity)) {
      onError('Quantity must be a number');
      return;
    }

    setIsSaving(true);
    try {
      await onCreate({
        name: newItem.name.trim(),
        type: newItem.type,
        category_id: parseInt(newItem.category_id),
        description: newItem.description.trim() || null,
        quantity,
        threshold,
        items_per_basket: newItem.items_per_basket ? parseInt(newItem.items_per_basket) : null,
      });
      onSuccess('Item created successfully');
      setNewItem(defaultNewItem);
      setIsAdding(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create item';
      onError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAdd = () => {
    setNewItem(defaultNewItem);
    setIsAdding(false);
  };

  const renderEditableCell = (
    item: AdminItem,
    field: keyof AdminItem,
    value: string | number | null
  ) => {
    const isEditing = editState.id === item.id && editState.field === field;

    if (isEditing) {
      // Render appropriate input based on field type
      if (field === 'type') {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Select
              size="small"
              value={editState.value}
              onChange={(e) => {
                setEditState(prev => ({ ...prev, value: e.target.value }));
              }}
              onBlur={handleSave}
              autoFocus
              disabled={isSaving}
              sx={{ width: '140px' }}
            >
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Welcome Basket">Welcome Basket</MenuItem>
            </Select>
            <IconButton size="small" onClick={handleSave} disabled={isSaving}>
              <Check fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleCancel} disabled={isSaving}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        );
      }

      if (field === 'category_id') {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Select
              size="small"
              value={editState.value}
              onChange={(e) => {
                setEditState(prev => ({ ...prev, value: e.target.value }));
              }}
              onBlur={handleSave}
              autoFocus
              disabled={isSaving}
              sx={{ width: '150px' }}
            >
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
            <IconButton size="small" onClick={handleSave} disabled={isSaving}>
              <Check fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleCancel} disabled={isSaving}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        );
      }

      const isNumber = ['quantity', 'threshold', 'items_per_basket'].includes(field);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            value={editState.value}
            onChange={(e) => setEditState(prev => ({ ...prev, value: e.target.value }))}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            type={isNumber ? 'number' : 'text'}
            disabled={isSaving}
            sx={{ width: isNumber ? '80px' : field === 'description' ? '200px' : '150px' }}
          />
          <IconButton size="small" onClick={handleSave} disabled={isSaving}>
            <Check fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancel} disabled={isSaving}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    // Display value
    let displayValue = value;
    if (field === 'category_id') {
      displayValue = item.category_name || 'Unknown';
    }

    return (
      <Box
        onClick={() => handleCellClick(item.id, field, value)}
        sx={{
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          maxWidth: field === 'description' ? '200px' : 'auto',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={field === 'description' && displayValue ? String(displayValue) : undefined}
      >
        {displayValue ?? '-'}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Items</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <SearchBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="Search items..."
            width="250px"
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Threshold</TableCell>
              <TableCell>Per Basket</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isAdding && (
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>
                  <TextField
                    size="small"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Item name"
                    disabled={isSaving}
                    autoFocus
                    sx={{ width: '150px' }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={newItem.type}
                    onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                    disabled={isSaving}
                    sx={{ width: '140px' }}
                  >
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Welcome Basket">Welcome Basket</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={newItem.category_id}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category_id: e.target.value }))}
                    disabled={isSaving}
                    displayEmpty
                    sx={{ width: '150px' }}
                  >
                    <MenuItem value="" disabled>Select category</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    disabled={isSaving}
                    sx={{ width: '150px' }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                    disabled={isSaving}
                    sx={{ width: '70px' }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={newItem.threshold}
                    onChange={(e) => setNewItem(prev => ({ ...prev, threshold: e.target.value }))}
                    disabled={isSaving}
                    inputProps={{ min: 0 }}
                    sx={{ width: '70px' }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      size="small"
                      type="number"
                      value={newItem.items_per_basket}
                      onChange={(e) => setNewItem(prev => ({ ...prev, items_per_basket: e.target.value }))}
                      disabled={isSaving}
                      placeholder="-"
                      sx={{ width: '70px' }}
                    />
                    <IconButton size="small" onClick={handleAddNew} disabled={isSaving}>
                      <Check fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancelAdd} disabled={isSaving}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{renderEditableCell(item, 'name', item.name)}</TableCell>
                <TableCell>{renderEditableCell(item, 'type', item.type)}</TableCell>
                <TableCell>{renderEditableCell(item, 'category_id', item.category_id)}</TableCell>
                <TableCell>{renderEditableCell(item, 'description', item.description)}</TableCell>
                <TableCell>{renderEditableCell(item, 'quantity', item.quantity)}</TableCell>
                <TableCell>{renderEditableCell(item, 'threshold', item.threshold)}</TableCell>
                <TableCell>{renderEditableCell(item, 'items_per_basket', item.items_per_basket)}</TableCell>
              </TableRow>
            ))}
            {paginatedItems.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {searchValue ? 'No items match your search' : 'No items found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredItems.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>
    </Box>
  );
};

export default ItemsTable;
