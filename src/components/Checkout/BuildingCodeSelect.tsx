import React from 'react';
import { Autocomplete, FormControl, TextField } from '@mui/material';
import { Building, Unit } from '../../types/interfaces';

interface BuildingCodeSelectProps {
  buildings: Building[];
  selectedBuilding: Building;
  setSelectedBuilding: (building: Building) => void;
  setSelectedUnit: (unit: Unit) => void;
  fetchUnitNumbers: (buildingId: number) => void;
  error: string;
  resetError: () => void;
  disabled?: boolean;
}

const BuildingCodeSelect: React.FC<BuildingCodeSelectProps> = ({
  buildings,
  selectedBuilding,
  setSelectedBuilding,
  setSelectedUnit,
  fetchUnitNumbers,
  error,
  resetError,
  disabled = false,
}) => {
  return (
    <FormControl>
      <Autocomplete
        id="select-building"
        data-testid="test-id-select-building"
        options={buildings}
        value={selectedBuilding}
        disabled={disabled}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event: React.SyntheticEvent, newValue: Building | null) => {
          event.preventDefault();
          if (newValue) {
            setSelectedBuilding(newValue);
            setSelectedUnit({ id: 0, unit_number: '' });
            fetchUnitNumbers(newValue.id);
            resetError();
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
            error={error.length > 0}
            helperText={error.length > 0 ? error : ''}
          />
        )}
      />
    </FormControl>
  );
};

export default BuildingCodeSelect;
