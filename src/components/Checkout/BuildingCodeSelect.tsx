import React from 'react';
import {
  Autocomplete,
  createFilterOptions,
  FormControl,
  TextField,
} from '@mui/material';
import { Building, ResidentFormError, Unit } from '../../types/interfaces';

interface BuildingCodeSelectProps {
  buildings: Building[];
  selectedBuilding: Building;
  setSelectedBuilding: (building: Building) => void;
  setSelectedUnit: (unit: Unit) => void;
  fetchUnitNumbers: (buildingId: number) => void;
  formError: ResidentFormError;
  setFormError: (formError: ResidentFormError) => void;
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
  formError,
  setFormError,
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
            setFormError({ ...formError, buildingError: '' });
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
            error={formError.buildingError.length > 0}
            helperText={formError.buildingError}
          />
        )}
      />
    </FormControl>
  );
};

export default BuildingCodeSelect;
