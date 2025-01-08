import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Building } from '../../types/interfaces';

interface BuildingCodeSelectProps {
  buildings: Building[];
  selectedBuildingCode: string;
  setSelectedBuildingCode: (code: string) => void;
}

const BuildingCodeSelect: React.FC<BuildingCodeSelectProps> = ({
  buildings,
  selectedBuildingCode,
  setSelectedBuildingCode,
}) => {
  return (
    <FormControl style={{ width: '150px' }}>
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
    </FormControl>
  );
};

export default BuildingCodeSelect;
