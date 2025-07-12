import React from 'react';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { Building, Unit } from '../../types/interfaces';

interface BuildingCodeSelectProps {
  buildings: Building[];
  selectedBuildingCode: string;
  setSelectedBuilding: (building: Building) => void;
  setUnitNumberInput: (unit: Unit) => void;
  fetchUnitNumbers: (buildingId: number) => void;
  error: boolean;
}

const BuildingCodeSelect: React.FC<BuildingCodeSelectProps> = ({
  buildings,
  selectedBuildingCode,
  setSelectedBuilding,
  setUnitNumberInput,
  fetchUnitNumbers,
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
        onChange={(event) => {
          const building = buildings.filter((b) => b.code == event.target.value)[0];
          setSelectedBuilding(building);
          setUnitNumberInput({id: 0, unit_number: ''});
          fetchUnitNumbers(building.id);
        }}
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
