import React from 'react';
import {
  Autocomplete,
  createFilterOptions,
  FormControl,
  TextField,
} from '@mui/material';
import { Building, Unit } from '../../types/interfaces';

interface BuildingCodeSelectProps {
  buildings: Building[];
  selectedBuilding: Building;
  setSelectedBuilding: (building: Building) => void;
  setSelectedUnit: (unit: Unit) => void;
  fetchUnitNumbers: (buildingId: number) => void;
  error: boolean;
  disabled?: boolean;
}

const filterOptions = createFilterOptions<Building>({
  matchFrom: 'start',
});

const BuildingCodeSelect: React.FC<BuildingCodeSelectProps> = ({
  buildings,
  selectedBuilding,
  setSelectedBuilding,
  setSelectedUnit,
  fetchUnitNumbers,
  error,
  disabled = false,
}) => {
  return (
    <FormControl>
      <Autocomplete
        id="select-building"
        data-testid="test-id-select-building"
        options={buildings}
        filterOptions={filterOptions}
        value={selectedBuilding}
        disabled={disabled}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event: React.SyntheticEvent, newValue: Building | null) => {
          event.preventDefault();
          if (newValue) {
            setSelectedBuilding(newValue);
            setSelectedUnit({ id: 0, unit_number: '' });
            fetchUnitNumbers(newValue.id);
          }
        }}
        getOptionLabel={(option: Building) => {
          if (option.id === 0) return '';
          return `${option.code} (${option.name})`;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Building Code"
            error={error}
            helperText={error ? 'Please select a building' : ''}
          />
        )}
      />
    </FormControl>
  );
};

export default BuildingCodeSelect;
