/**
 * index.tsx
 *
 * @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useEffect, useContext } from 'react';
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
import { UserContext } from '../../components/contexts/UserContext';
import { Building, SnackbarState, Unit } from '../../types/interfaces';
import {
  getBuildings,
  getResidentsByIds,
  getAllResidents,
  findResidentsByName,
  mergeResidents,
} from '../../services/residentService';
import { useResidentsByBuilding } from './useResidentsByBuilding';
import SnackbarAlert from '../../components/SnackbarAlert';
import ResidentEditDialog from './ResidentEditDialog';
import ResidentDuplicateDialog from './ResidentDuplicateDialog';

type ResidentSearchResult = {
  id: number;
  name: string;
  unit_id: number;
  unit_number: string;
  building_id: number;
  building_code: string;
};

type ResidentMatch = {
  id: number;
  name: string;
  building_code: string;
  unit_number: string | number;
};

type PendingEdit = {
  name: string;
  building: Building;
  unit: Unit;
};

const filterOptions = createFilterOptions<ResidentSearchResult>({
  stringify: (resident) => resident.name,
});

const ResidentsPage = () => {
  const { user } = useContext(UserContext);

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [allResidents, setAllResidents] = useState<ResidentSearchResult[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(
    null,
  );
  const [filteredUnitId, setFilteredUnitId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [buildingsError, setBuildingsError] = useState<string | null>(null);
  const [allResidentsLoading, setAllResidentsLoading] = useState(false);
  const [allResidentsError, setAllResidentsError] = useState<string | null>(
    null,
  );

  const [selectedResident, setSelectedResident] = useState<{
    id: number;
    name: string;
    unit: Unit;
    building: Building;
  } | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);
  const [matchingResidents, setMatchingResidents] = useState<ResidentMatch[]>(
    [],
  );

  const [editSnackbar, setEditSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    data,
    isLoading,
    error: residentsError,
    updateResidentName,
    refresh: refreshResidentsByBuilding,
  } = useResidentsByBuilding(selectedBuildingId);

  let visibleData = data;

  if (filteredUnitId !== null) {
    visibleData = visibleData.filter((item) => item.unit.id === filteredUnitId);
  }

  if (searchInput) {
    visibleData = visibleData.filter((item) =>
      item.residents.some((resident) =>
        resident.name.toLowerCase().includes(searchInput.toLowerCase()),
      ),
    );
  }

  useEffect(() => {
    getBuildings(user)
      .then((loadedBuildings) => {
        setBuildings(loadedBuildings);
        setBuildingsError(null);
      })
      .catch(() => setBuildingsError('Failed to load buildings'));

    const fetchResidents = async () => {
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
    };

    void fetchResidents();
  }, [user]);

  const refreshAllResidents = async () => {
    try {
      const residents = await getAllResidents(user);
      setAllResidents(residents);
      setAllResidentsError(null);
    } catch {
      setAllResidentsError(
        'Failed to refresh residents. Reload the page to see the latest data.',
      );
    }
  };

  const handleBuildingChange = (event: SelectChangeEvent<number>) => {
    setSelectedBuildingId(event.target.value as number);
    setFilteredUnitId(null);
  };

  const handleSearchSelect = (
    _event: React.SyntheticEvent,
    value: ResidentSearchResult | null,
  ) => {
    if (!value) {
      setFilteredUnitId(null);
      return;
    }

    setSelectedBuildingId(value.building_id);
    setFilteredUnitId(value.unit_id);
  };

  const handleSearchInputChange = (
    _event: React.SyntheticEvent,
    value: string,
    reason: string,
  ) => {
    if (reason === 'input') {
      setSearchInput(value);
    } else if (reason === 'clear' || reason === 'reset') {
      setSearchInput('');
      setFilteredUnitId(null);
    }
  };

  const handleEditClick = (
    resident: { id: number; name: string },
    unit: Unit,
  ) => {
    if (isSaving) return;

    const building = buildings.find(
      (item) => item.id === selectedBuildingId,
    );

    if (!building) return;

    setSelectedResident({
      id: resident.id,
      name: resident.name,
      unit,
      building,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditCancel = () => {
    if (isSaving) return;

    setIsEditDialogOpen(false);
    setSelectedResident(null);
    setPendingEdit(null);
    setMatchingResidents([]);
  };

  const saveResidentEdit = async (
    residentId: number,
    name: string,
    unit: Unit,
  ) => {
    setIsSaving(true);

    try {
      await updateResidentName(residentId, name, unit.id);

      setEditSnackbar({
        open: true,
        message: 'Resident updated.',
        severity: 'success',
      });

      setIsEditDialogOpen(false);
      setSelectedResident(null);
      setPendingEdit(null);
      setMatchingResidents([]);

      await refreshAllResidents();
    } catch {
      setEditSnackbar({
        open: true,
        message: 'Failed to update resident.',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSave = async (
    name: string,
    building: Building,
    unit: Unit,
  ) => {
    if (!selectedResident || isSaving) return;

    if (name !== selectedResident.name) {
      setIsSaving(true);

      try {
        const matches = await findResidentsByName(user, name);
        const otherMatches = matches.filter(
          (resident) => resident.id !== selectedResident.id,
        );

        if (otherMatches.length > 0) {
          // Fetch fresh location details rather than relying on a potentially
          // stale copy of the resident list.
          const residentDetails = await getResidentsByIds(
            user,
            otherMatches.map((match) => match.id),
          );

          const residentsById = new Map(
            residentDetails.map((resident) => [resident.id, resident]),
          );

          const residentsWithLocation: ResidentMatch[] = otherMatches.map(
            (match) => {
              const details = residentsById.get(match.id);

              if (!details) {
                throw new Error(
                  `Could not find location details for resident ${match.id}`,
                );
              }

              return {
                id: details.id,
                name: details.name,
                building_code: details.building_code,
                unit_number: details.unit_number,
              };
            },
          );

          setPendingEdit({ name, building, unit });
          setMatchingResidents(residentsWithLocation);
          setIsEditDialogOpen(false);
          return;
        }
      } catch {
        setEditSnackbar({
          open: true,
          message: 'Failed to check for duplicate resident.',
          severity: 'error',
        });
        return;
      } finally {
        setIsSaving(false);
      }
    }

    await saveResidentEdit(selectedResident.id, name, unit);
  };

  const handleAnotherPerson = async () => {
    if (!selectedResident || !pendingEdit || isSaving) return;

    // Keep the resident as a separate record; do not merge another resident
    // into this one.
    await saveResidentEdit(
      selectedResident.id,
      pendingEdit.name,
      pendingEdit.unit,
    );
  };

  const handleMergeResidents = async (targetResidentId: number) => {
    if (!selectedResident || !pendingEdit || isSaving) return;

    if (
      targetResidentId === selectedResident.id ||
      !matchingResidents.some((resident) => resident.id === targetResidentId)
    ) {
      return;
    }

    setIsSaving(true);

    try {
      // This single API call performs the merge and target profile update
      // atomically on the server.
      await mergeResidents(
        user,
        selectedResident.id,
        targetResidentId,
        pendingEdit.name,
        pendingEdit.unit.id,
      );

      setEditSnackbar({
        open: true,
        message: 'Residents merged.',
        severity: 'success',
      });

      setIsEditDialogOpen(false);
      setSelectedResident(null);
      setPendingEdit(null);
      setMatchingResidents([]);

      refreshResidentsByBuilding();
      await refreshAllResidents();
    } catch {
      setEditSnackbar({
        open: true,
        message: 'Failed to merge residents.',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateDialogClose = () => {
    if (isSaving) return;

    setPendingEdit(null);
    setMatchingResidents([]);
    setIsEditDialogOpen(true);
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', mt: 3, mb: 3 }}
      >
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel id="building-select-label">Building</InputLabel>
          <Select
            labelId="building-select-label"
            value={selectedBuildingId ?? ''}
            label="Building"
            onChange={handleBuildingChange}
          >
            {buildings.map((building) => (
              <MenuItem key={building.id} value={building.id}>
                {building.code} — {building.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          options={allResidents}
          getOptionLabel={(resident) =>
            `${resident.name} — Unit ${resident.unit_number} · ${resident.building_code}`
          }
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
          <Box
            sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}
          >
            <CircularProgress />
          </Box>
        )}

        {!isLoading &&
          selectedBuildingId !== null &&
          visibleData.length === 0 && (
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
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 2,
                        }}
                      >
                        {residents.map((resident) => (
                          <Box
                            key={resident.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <Typography variant="body2">
                              {resident.name}
                            </Typography>

                            <IconButton
                              size="large"
                              onClick={() => handleEditClick(resident, unit)}
                              aria-label={`Edit ${resident.name}`}
                              disabled={isSaving}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
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
        <SnackbarAlert
          open
          severity="warning"
          onClose={() => setBuildingsError(null)}
        >
          {buildingsError}
        </SnackbarAlert>
      )}

      {residentsError && (
        <SnackbarAlert open severity="warning" onClose={() => {}}>
          {residentsError}
        </SnackbarAlert>
      )}

      {allResidentsError && (
        <SnackbarAlert
          open
          severity="warning"
          onClose={() => setAllResidentsError(null)}
        >
          {allResidentsError}
        </SnackbarAlert>
      )}

      <SnackbarAlert
        open={editSnackbar.open}
        severity={editSnackbar.severity}
        onClose={() =>
          setEditSnackbar((previous) => ({ ...previous, open: false }))
        }
      >
        {editSnackbar.message}
      </SnackbarAlert>

      <ResidentEditDialog
        showDialog={isEditDialogOpen}
        resident={selectedResident}
        buildings={buildings}
        onCancel={handleEditCancel}
        onSave={handleEditSave}
        isSaving={isSaving}
      />

      {pendingEdit && matchingResidents.length > 0 && (
        <ResidentDuplicateDialog
          showDialog
          handleClose={handleDuplicateDialogClose}
          pendingEdit={pendingEdit}
          matchingResidents={matchingResidents}
          onAnotherPerson={handleAnotherPerson}
          onMergeResidents={handleMergeResidents}
          isSubmitting={isSaving}
        />
      )}
    </Box>
  );
};

export default ResidentsPage;