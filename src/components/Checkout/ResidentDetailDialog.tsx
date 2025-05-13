import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Close } from '@mui/icons-material';
import BuildingCodeSelect from './BuildingCodeSelect';
import { Building, ResidentInfo } from '../../types/interfaces';
import { addResident, findResident, getResidents, getUnitNumbers } from './CheckoutAPICalls';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

type ResidentDetailDialogProps = {
    showDialog: boolean,
    handleShowDialog: Function,
    buildings: Building[],
    residentInfo: ResidentInfo,
    setResidentInfo: React.Dispatch<React.SetStateAction<ResidentInfo>>
}

type ResidentNameOption = {
    inputValue?: string;
    name: string;
}

const ResidentDetailDialog = ({
    showDialog, 
    handleShowDialog, 
    buildings, 
    residentInfo,
    setResidentInfo
    }: ResidentDetailDialogProps) => {

    const [nameInput, setNameInput] = useState<string>(residentInfo.name)
    const [buildingInput, setBuildingInput] = useState<Building>(residentInfo.building)
    const [unitNumberInput, setUnitNumberInput] = useState<string>(residentInfo.unit);
    const [unitNumberValues, setUnitNumberValues] = useState([]);

    const [existingResidents, setExistingResidents] = useState<ResidentNameOption[]>([]);

    const [showError, setShowError] = useState<boolean>(false);

    const filter = createFilterOptions<ResidentNameOption>();

    // when building is selected, we want to get the units for that building to populate the dropdown below it.
    // run this effect when a piece of state changes (the building code input!)
    useEffect(() => {
        if (!buildingInput) return;
        const fetchUnitNumbers = async () => {
            const response = await getUnitNumbers(buildingInput);
            // populate unit code dropdown
            const unitNumbers = response.value
                .map((item)=>item.unit_number)
                .filter((item) => item.trim() !== '');
            setUnitNumberValues(unitNumbers);
        }
        fetchUnitNumbers();
    }, [buildingInput])

    useEffect(() => {
        if (!buildingInput || !unitNumberInput) return;
        const fetchResidents = async () => {
            const response = await getResidents(buildingInput.id, unitNumberInput);
            setExistingResidents(response.value.map((resident: ResidentNameOption) => ({ name: resident.name })));
        }
        fetchResidents();
    }, [unitNumberInput, buildingInput])


    async function handleSubmit(e) {
        e.preventDefault();
        // validate inputs, show error
        if (!nameInput || !buildingInput || !unitNumberInput) {
            setShowError(true);
            return;
        }

        let residentId;

        // try submitting to db
        try {
            // first check if the resident already exists
            const existingResponse = await findResident(nameInput, buildingInput.id, unitNumberInput);
            // if not, add them to the db
            if (!existingResponse.value.length) { 
                const response = await addResident(nameInput, buildingInput.id, unitNumberInput);
                console.log('response from adding resident', response);
                residentId = response.value[0].id;
             } 
        } catch (error) {
            console.error('Error submitting resident info', error);
            return;
        }

        // update state
        setResidentInfo({
            id: residentId,
            name: nameInput,
            unit: unitNumberInput,
            building: buildingInput
        })

        setShowError(false);
        handleShowDialog();
    }

    return (
        <Dialog 
        sx={{
            '& .MuiDialog-paper': {
              width: { xs: '80vw', md: '50vw' },
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '15px',
              paddingY: '1.5rem', 
              paddingX: '6rem',
              position: 'relative'
            },
          }}
            open={showDialog}>
            <Box sx={{ 
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem'
            }}>
                <Button onClick={handleShowDialog} disableRipple><Close/></Button>
            </Box>
            <DialogTitle>
                <Typography sx={{ fontSize: '1.25rem' }}>Provide details to continue</Typography>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingY: '1rem' }}>
                    <FormControl>
                        <BuildingCodeSelect buildings={buildings} selectedBuildingCode={buildingInput.code} setSelectedBuilding={setBuildingInput} 
                        error={showError && !buildingInput}/>
                    </FormControl>
                    {unitNumberValues.length > 1 && 
                    <FormControl error={showError && !unitNumberInput}>
                        <InputLabel id="select-unit-number-label">Unit Number</InputLabel>
                        <Select
                            labelId="select-unit-number-label"
                            id="select-unit-number"
                            data-testid="test-id-select-unit-number"
                            label="Unit Number"
                            value={unitNumberInput}
                            onChange={(event) => setUnitNumberInput(event.target.value)}
                        >
                        {unitNumberValues.map((unit) => (
                            <MenuItem key={unit} value={unit}>
                            {unit} 
                            </MenuItem>
                        ))}
                        </Select>
                        {showError && !unitNumberInput && <FormHelperText>Please select a unit number</FormHelperText>}
                    </FormControl>}
                    <FormControl>
                        <Autocomplete 
                            value={nameInput}
                            onChange={(event, newValue) => {
                                if (newValue && newValue.inputValue) {
                                // Create a new value from the user input
                                    setNameInput(newValue.inputValue);
                                } else if (newValue && newValue.name) {
                                // Update the name input with the selected value
                                    setNameInput(newValue.name);
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = filter(options, params);

                                const { inputValue } = params;
                                // Suggest the creation of a new value
                                const isExisting = options.some((option) => inputValue === option.name);
                                if (inputValue !== '' && !isExisting) {
                                filtered.push({
                                    inputValue,
                                    name: `Add "${inputValue}"`
                                });
                                }
                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur 
                            handleHomeEndKeys
                            id="resident-name-autocomplete"
                            options={existingResidents}
                            getOptionLabel={(option) => {
                            // Value selected with enter, right from the input
                            if (typeof option === 'string') {
                                return option;
                            }
                            // Add "xxx" option created dynamically
                            if (option.inputValue) {
                                return option.inputValue;
                            }
                            // Regular option
                            return option.name;
                            }}
                            renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            return (
                                <li key={option.name} {...optionProps}>
                                {option.name}
                                </li>
                            );
                            }}
                            sx={{ width: 300 }}
                            freeSolo
                            renderInput={(params) => (
                            <TextField {...params} label="Resident Name" 
                                error={showError && !nameInput} 
                                helperText={showError && !nameInput ? "Please enter the resident's name" : ""}/>
                            )}
                        />
                    
                    </FormControl>                    
                </Box>
            </DialogContent>
            <DialogActions>
                <Button type="submit">Continue</Button>
            </DialogActions>
            </form>
        </Dialog>
    );
}

export default ResidentDetailDialog;