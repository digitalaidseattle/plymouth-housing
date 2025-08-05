import React from 'react';
import { Autocomplete, FormControl, FormHelperText, TextField } from '@mui/material';
import { Building, Unit } from '../../types/interfaces';

interface BuildingCodeSelectProps {
  buildings: Building[];
  selectedBuilding: Building;
  setSelectedBuilding: (building: Building) => void;
  setSelectedUnit: (unit: Unit) => void;
  fetchUnitNumbers: (buildingId: number) => void;
  error: boolean;
}

const BuildingCodeSelect: React.FC<BuildingCodeSelectProps> = ({
  buildings,
  selectedBuilding,
  setSelectedBuilding,
  setSelectedUnit,
  fetchUnitNumbers,
  error
}) => {
  return (
    <FormControl>
       <Autocomplete
          id="select-unit-number"
          data-testid="test-id-select-unit-number"
          options={buildings}
          value={selectedBuilding}
          onChange={(event: any, newValue: Building | null) => {             
            if (newValue) { 
              setSelectedBuilding(newValue);
              setSelectedUnit({id: 0, unit_number: ''});
              fetchUnitNumbers(newValue.id);
            }
          }}
          getOptionLabel={(option: Building) => {
            if (option.id === 0) return '';
            return `${option.code} - ${option.name}`;
          }}
          renderInput={(params) => 
            <TextField {...params} 
              label="Building" 
              error={error} 
              helperText={error ? "Please select a building" : ""}
            />
          }
      />
    </FormControl> 
  );
};

export default BuildingCodeSelect;
