import React from 'react';
import { Autocomplete, FormControl, TextField } from '@mui/material';
import { Building, Unit } from '../../types/interfaces';

interface BuildingCodeSelectProps {
  buildings: Building[];
  selectedBuilding: Building;
  setSelectedBuilding: (building: Building) => void;
  setSelectedUnit: (unit: Unit) => void;
  setNameInput: (name: string) => void;
  fetchUnitNumbers: (buildingId: number) => void;
  error: boolean;
}

const BuildingCodeSelect: React.FC<BuildingCodeSelectProps> = ({
  buildings,
  selectedBuilding,
  setSelectedBuilding,
  setSelectedUnit,
  setNameInput,
  fetchUnitNumbers,
  error
}) => {
  return (
    <FormControl>
       <Autocomplete
          id="select-building"
          data-testid="test-id-select-building"
          options={buildings}
          value={selectedBuilding}
          onChange={(event:  React.SyntheticEvent, newValue: Building | null) => {     
            event.preventDefault();        
            if (newValue) { 
              setSelectedBuilding(newValue);
              setSelectedUnit({id: 0, unit_number: ''});
              setNameInput('');
              fetchUnitNumbers(newValue.id);
            }
          }}
          getOptionLabel={(option: Building) => {
            if (option.id === 0) return '';
            return `${option.code} - ${option.name}`;
          }}
          renderInput={(params) => 
            <TextField {...params} 
              label="Building Code" 
              error={error} 
              helperText={error ? "Please select a building" : ""}
            />
          }
      />
    </FormControl> 
  );
};

export default BuildingCodeSelect;
