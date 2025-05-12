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
  Input,
  TextField,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Close } from '@mui/icons-material';
import BuildingCodeSelect from './BuildingCodeSelect';
import { Building, ResidentInfo } from '../../types/interfaces';
import { getResidents, getUnitNumbers } from './CheckoutAPICalls';

type ResidentDetailDialogProps = {
    showDialog: boolean,
    handleShowDialog: Function,
    buildings: Building[],
    residentInfo: ResidentInfo,
    setResidentInfo: React.Dispatch<React.SetStateAction<ResidentInfo>>
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

    const [showError, setShowError] = useState<boolean>(false);

    // when building is selected, we want to get the units for that building to populate the dropdown below it.
    // run this effect when a piece of state changes (the building code input!)
    useEffect(() => {
        const fetchUnitNumbers = async () => {
            const response = await getUnitNumbers(buildingInput);
            console.log('unit codes for this building id', response);
            // populate unit code dropdown
            const unitNumbers = response.value.map((item)=>item.unit_number);
            setUnitNumberValues(unitNumbers);
        }
        fetchUnitNumbers();
    }, [buildingInput])

    useEffect(() => {
        const fetchResidents = async () => {
            const response = await getResidents();
            console.log('residents', response);
        }
        fetchResidents();
    }, [])


    function handleSubmit(e) {
        e.preventDefault();
        // validate inputs, show error
        if (!nameInput || !buildingInput || !unitNumberInput) {
            setShowError(true);
            return;
        }

        // if no error, update state
        setResidentInfo({
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
                        <TextField label="Resident name" id="resident-name" value={nameInput} onChange={(e)=>setNameInput(e.target.value)}
                        error={showError && !nameInput} helperText={showError && !nameInput ? "Please enter the resident's name" : ""}/>
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