/**
 *  index.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useEffect, useContext, useRef } from 'react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { UserContext } from '../../components/contexts/UserContext';
import { Building, SnackbarState } from '../../types/interfaces';
import { getBuildings, getAllResidents } from '../../services/residentService';
import { useResidentsByBuilding } from './useResidentsByBuilding';
import SnackbarAlert from '../../components/SnackbarAlert';

type ResidentSearchResult = {
  id: number;
  name: string;
  unit_id: number;
  unit_number: string;
  building_id: number;
  building_code: string;
};

const filterOptions = createFilterOptions<ResidentSearchResult>({
  stringify: (o) => o.name,
});

const ResidentsPage = () => {
  const { user } = useContext(UserContext);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [allResidents, setAllResidents] = useState<ResidentSearchResult[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [filteredUnitId, setFilteredUnitId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [buildingsError, setBuildingsError] = useState<string | null>(null);
  const [allResidentsLoading, setAllResidentsLoading] = useState(false);
  const [allResidentsError, setAllResidentsError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editSnackbar, setEditSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const { data, isLoading, error: residentsError, updateResidentName } =
    useResidentsByBuilding(selectedBuildingId);

  let visibleData = data;
  if (filteredUnitId !== null) {
    visibleData = visibleData.filter((d) => d.unit.id === filteredUnitId);
  }
  if (searchInput) {
    visibleData = visibleData.filter((d) =>
      d.residents.some((r) => r.name.toLowerCase().includes(searchInput.toLowerCase())),
    );
  }

  useEffect(() => {
    getBuildings(user)
      .then((loadedBuildings) => {
        setBuildings(loadedBuildings);
        setBuildingsError(null);
      })
      .catch(() => setBuildingsError('Failed to load buildings'));
    async function fetchResidents() {
      setAllResidentsLoading(true);
      try {
        const residents = await getAllResidents(user);
        setAllResidents(residents);
        setAllResidentsError(null);
      } catch {
        setAllResidentsError('Failed to load residents');
      } finally {
        setAllResidentsLoading(false);
      }
    }
    fetchResidents();
  }, [user]);

  const handleBuildingChange = (e: SelectChangeEvent<number>) => {
    setSelectedBuildingId(e.target.value as number);
    setFilteredUnitId(null);
  };

  const handleSearchSelect = (_: React.SyntheticEvent, value: ResidentSearchResult | null) => {
    if (!value) {
      setFilteredUnitId(null);
      return;
    }
    setSelectedBuildingId(value.building_id);
    setFilteredUnitId(value.unit_id);
  };

  const handleSearchInputChange = (_: React.SyntheticEvent, value: string, reason: string) => {
    if (reason === 'input') {
      setSearchInput(value);
    } else if (reason === 'clear' || reason === 'reset') {
      setSearchInput('');
      setFilteredUnitId(null);
    }
  };

  const handleEditClick = (resident: { id: number; name: string }) => {
    if (isSaving) return;
    setEditId(resident.id);
    setEditValue(resident.name);
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditValue('');
  };

  const handleEditKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      await handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleEditSave = async () => {
    if (editId === null || isSaving) return;

    if (!editValue.trim()) {
      setEditSnackbar({ open: true, message: 'Name cannot be empty.', severity: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      await updateResidentName(editId, editValue.trim());
      setEditSnackbar({ open: true, message: 'Resident name updated.', severity: 'success' });
      setEditId(null);
      setEditValue('');
    } catch {
      setEditSnackbar({ open: true, message: 'Failed to update resident name.', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 3, mb: 3 }}>
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel id="building-select-label">Building</InputLabel>
          <Select
            labelId="building-select-label"
            value={selectedBuildingId ?? ''}
            label="Building"
            onChange={handleBuildingChange}
          >
            {buildings.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.code} — {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          options={allResidents}
          getOptionLabel={(o) => `${o.name} — Unit ${o.unit_number} · ${o.building_code}`}
          filterOptions={filterOptions}
          inputValue={searchInput}
          onInputChange={handleSearchInputChange}
          onChange={handleSearchSelect}
          noOptionsText="No residents found"
          loading={allResidentsLoading}
          disabled={allResidentsLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              placeholder="Search resident by name…"
            />
          )}
          sx={{ flexGrow: 1, alignSelf: 'flex-end' }}
        />
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && selectedBuildingId !== null && visibleData.length === 0 && (
        <Typography color="text.secondary">No units found.</Typography>
      )}

      {!isLoading && visibleData.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Residents</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleData.map(({ unit, residents }) => (
              <TableRow key={unit.id} hover>
                <TableCell>{unit.unit_number}</TableCell>
                <TableCell>
                  {residents.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {residents.map((r) =>
                        editId === r.id ? (
                          <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              size="small"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleEditKeyDown}
                              onBlur={(e) => {
                                if (e.relatedTarget === cancelButtonRef.current) return;
                                handleEditSave();
                              }}
                              autoFocus
                              disabled={isSaving}
                              slotProps={{ htmlInput: { maxLength: 255 } }}
                              sx={{ width: 180 }}
                            />
                            <IconButton
                              size="large"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={handleEditSave}
                              disabled={isSaving}
                              aria-label="Save"
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              ref={cancelButtonRef}
                              size="large"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={handleEditCancel}
                              disabled={isSaving}
                              aria-label="Cancel"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2">{r.name}</Typography>
                            <IconButton
                              size="large"
                              onClick={() => handleEditClick(r)}
                              aria-label={`Edit ${r.name}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ),
                      )}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      </Box>

      {buildingsError && (
        <SnackbarAlert open severity="warning" onClose={() => setBuildingsError(null)}>
          {buildingsError}
        </SnackbarAlert>
      )}
      {residentsError && (
        <SnackbarAlert open severity="warning" onClose={() => {}}>
          {residentsError}
        </SnackbarAlert>
      )}
      {allResidentsError && (
        <SnackbarAlert open severity="warning" onClose={() => setAllResidentsError(null)}>
          {allResidentsError}
        </SnackbarAlert>
      )}
      <SnackbarAlert
        open={editSnackbar.open}
        severity={editSnackbar.severity}
        onClose={() => setEditSnackbar((prev) => ({ ...prev, open: false }))}
      >
        {editSnackbar.message}
      </SnackbarAlert>
    </Box>
  );
};

export default ResidentsPage;
