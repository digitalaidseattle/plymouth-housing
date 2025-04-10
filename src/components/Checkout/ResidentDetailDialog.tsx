import React, { MouseEventHandler, useState } from 'react';
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
  TextField
} from '@mui/material';
import { Close } from '@mui/icons-material';
import BuildingCodeSelect from './BuildingCodeSelect';
import { Building, ResidentInfo } from '../../types/interfaces';

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
    const [buildingCodeInput, setBuildingCodeInput] = useState<string>(residentInfo.buildingCode)
    const [unitNumberInput, setUnitNumberInput] = useState<string>(residentInfo.unit);

    const [showError, setShowError] = useState<boolean>(false);

    function handleSubmit(e) {
        e.preventDefault();
        // validate inputs, show error
        if (!nameInput || !buildingCodeInput || !unitNumberInput) {
            setShowError(true);
            return;
        }

        // if no error, update state
        setResidentInfo({
            name: nameInput,
            unit: unitNumberInput,
            buildingCode: buildingCodeInput
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
                        <BuildingCodeSelect buildings={buildings} selectedBuildingCode={buildingCodeInput} setSelectedBuildingCode={setBuildingCodeInput} 
                        error={showError && !buildingCodeInput}/>
                    </FormControl>
                    <FormControl>
                        <TextField label="Unit Number" id="unit-number" value={unitNumberInput} onChange={(e)=>setUnitNumberInput(e.target.value)}
                        error={showError && !unitNumberInput} helperText={showError && !unitNumberInput ? "Please enter the unit number" : ""}/>
                    </FormControl>
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