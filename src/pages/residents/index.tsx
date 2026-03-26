import { useState, useEffect, useContext } from 'react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { UserContext } from '../../components/contexts/UserContext';
import { Building } from '../../types/interfaces';
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

  const { data, isLoading, error: residentsError } = useResidentsByBuilding(selectedBuildingId);

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
    getBuildings(user).then(setBuildings).catch(() => setBuildingsError('Failed to load buildings'));
    setAllResidentsLoading(true);
    getAllResidents(user)
      .then((residents) => {
        setAllResidents(residents);
        setAllResidentsError(null);
      })
      .catch(() => setAllResidentsError('Failed to load residents'))
      .finally(() => setAllResidentsLoading(false));
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
    setSearchInput(value);
    if (reason === 'clear') setFilteredUnitId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3, mb: 3 }}>
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
          sx={{ flexGrow: 1 }}
        />
      </Box>

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
                    residents.map((r) => r.name).join(', ')
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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
    </Box>
  );
};

export default ResidentsPage;
