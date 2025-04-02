import React from 'react';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { Building } from '../../types/interfaces';

interface BuildingCodeSelectProps {
  buildings: Building[];
  selectedBuildingCode: string;
  setSelectedBuildingCode: (code: string) => void;
  error: boolean;
}

const BuildingCodeSelect: React.FC<BuildingCodeSelectProps> = ({
  buildings,
  selectedBuildingCode,
  setSelectedBuildingCode,
  error
}) => {
  return (
    <FormControl error={error}>
      <InputLabel id="select-building-code-label">Building Code</InputLabel>
      <Select
        labelId="select-building-code-label"
        id="select-building-code"
        data-testid="test-id-select-building-code"
        label="Building Code"
        value={selectedBuildingCode || ''}
        onChange={(event) => setSelectedBuildingCode(event.target.value)}
      >
        {buildings.map((building) => (
          <MenuItem key={building.code} value={building.code}>
            {building.code} ({building.name})
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>Please select a building code</FormHelperText>}
    </FormControl>
  );
};

export default BuildingCodeSelect;
