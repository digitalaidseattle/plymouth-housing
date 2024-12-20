import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

type BuildingCode = {
  code: string;
  name: string;
};

interface BuildingCodeSelectProps {
  buildingCodes: BuildingCode[];
  selectedBuildingCode: string;
  setSelectedBuildingCode: (code: string) => void;
}

const BuildingCodeSelect: React.FC<BuildingCodeSelectProps> = ({
  buildingCodes,
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
        {buildingCodes.map((buildingCode) => (
          <MenuItem key={buildingCode.code} value={buildingCode.code}>
            {buildingCode.code} ({buildingCode.name})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default BuildingCodeSelect;
