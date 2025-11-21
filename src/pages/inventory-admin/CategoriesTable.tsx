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
} from '@mui/material';
import { Check, Close, Add } from '@mui/icons-material';
import { CategoryItem } from '../../types/interfaces';

type CategoriesTableProps = {
  categories: CategoryItem[];
  onUpdate: (id: number, updates: Partial<CategoryItem>) => Promise<boolean>;
  onCreate: (category: Omit<CategoryItem, 'id'>) => Promise<boolean>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

type EditState = {
  id: number | null;
  field: string | null;
  value: string;
};

type NewCategory = {
  name: string;
  item_limit: string;
};

const CategoriesTable = ({
  categories,
  onUpdate,
  onCreate,
  onSuccess,
  onError,
}: CategoriesTableProps) => {
  const [editState, setEditState] = useState<EditState>({
    id: null,
    field: null,
    value: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    item_limit: '1',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleCellClick = (id: number, field: string, currentValue: string | number) => {
    if (editState.id === id && editState.field === field) return;
    setEditState({
      id,
      field,
      value: String(currentValue),
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

    const category = categories.find(c => c.id === editState.id);
    if (!category) return;

    // Validate
    if (editState.field === 'name' && !editState.value.trim()) {
      onError('Category name cannot be empty');
      return;
    }

    if (editState.field === 'item_limit') {
      const limit = parseInt(editState.value);
      if (isNaN(limit) || limit < 1) {
        onError('Item limit must be a positive number');
        return;
      }
    }

    setIsSaving(true);
    try {
      const updates: Partial<CategoryItem> = {};
      if (editState.field === 'name') {
        updates.name = editState.value.trim();
      } else if (editState.field === 'item_limit') {
        updates.item_limit = parseInt(editState.value);
      }

      await onUpdate(editState.id, updates);
      onSuccess(`Category updated successfully`);
      setEditState({ id: null, field: null, value: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      onError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditState({ id: null, field: null, value: '' });
  };

  const handleAddNew = async () => {
    if (!newCategory.name.trim()) {
      onError('Category name cannot be empty');
      return;
    }

    const limit = parseInt(newCategory.item_limit);
    if (isNaN(limit) || limit < 1) {
      onError('Item limit must be a positive number');
      return;
    }

    setIsSaving(true);
    try {
      await onCreate({
        name: newCategory.name.trim(),
        item_limit: limit,
      });
      onSuccess('Category created successfully');
      setNewCategory({ name: '', item_limit: '1' });
      setIsAdding(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      onError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAdd = () => {
    setNewCategory({ name: '', item_limit: '1' });
    setIsAdding(false);
  };

  const renderEditableCell = (
    category: CategoryItem,
    field: 'name' | 'item_limit',
    value: string | number
  ) => {
    const isEditing = editState.id === category.id && editState.field === field;

    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            value={editState.value}
            onChange={(e) => setEditState(prev => ({ ...prev, value: e.target.value }))}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            type={field === 'item_limit' ? 'number' : 'text'}
            inputProps={field === 'item_limit' ? { min: 1 } : {}}
            disabled={isSaving}
            sx={{ width: field === 'item_limit' ? '80px' : '200px' }}
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

    return (
      <Box
        onClick={() => handleCellClick(category.id, field, value)}
        sx={{
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        {value}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Item Limit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isAdding && (
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>New</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Category name"
                    disabled={isSaving}
                    autoFocus
                    sx={{ width: '200px' }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      size="small"
                      type="number"
                      value={newCategory.item_limit}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, item_limit: e.target.value }))}
                      inputProps={{ min: 1 }}
                      disabled={isSaving}
                      sx={{ width: '80px' }}
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
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{renderEditableCell(category, 'name', category.name)}</TableCell>
                <TableCell>{renderEditableCell(category, 'item_limit', category.item_limit)}</TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CategoriesTable;
