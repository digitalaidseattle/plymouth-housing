import { useState, useEffect, useContext } from 'react';
import {
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
  Typography,
} from '@mui/material';
import { UserContext } from '../../components/contexts/UserContext';
import { Building } from '../../types/interfaces';
import { getBuildings } from '../../services/checkoutService';
import { useResidentsByBuilding } from './useResidentsByBuilding';
import SnackbarAlert from '../../components/SnackbarAlert';

const ResidentsPage = () => {
  const { user } = useContext(UserContext);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [buildingsError, setBuildingsError] = useState<string | null>(null);

  const { data, isLoading, error: residentsError } = useResidentsByBuilding(selectedBuildingId);

  useEffect(() => {
    getBuildings(user)
      .then(setBuildings)
      .catch(() => setBuildingsError('Failed to load buildings'));
  }, [user]);

  const handleBuildingChange = (e: SelectChangeEvent<number>) => {
    setSelectedBuildingId(e.target.value as number);
  };

  return (
    <Box>
      <FormControl sx={{ minWidth: 240, mb: 3, mt: 3 }}>
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

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && selectedBuildingId !== null && data.length === 0 && (
        <Typography color="text.secondary">No units found for this building.</Typography>
      )}

      {!isLoading && data.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Residents</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(({ unit, residents }) => (
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
    </Box>
  );
};

export default ResidentsPage;
