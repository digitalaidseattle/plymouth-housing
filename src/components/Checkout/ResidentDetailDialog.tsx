import React, { MouseEventHandler, useContext, useEffect, useState } from 'react';
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
  Select,
  FormGroup
} from '@mui/material';
import { Close } from '@mui/icons-material';
import BuildingCodeSelect from './BuildingCodeSelect';
import { Building } from '../../types/interfaces';

type ResidentDetailDialogProps = {
    showDialog: boolean,
    handleShowDialog: MouseEventHandler<HTMLButtonElement>
    buildings: Building[],
    selectedBuildingCode: string,
    setSelectedBuildingCode: React.Dispatch<React.SetStateAction<string>>
}

const ResidentDetailDialog = ({showDialog, handleShowDialog, buildings, selectedBuildingCode, setSelectedBuildingCode}: ResidentDetailDialogProps) => {

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
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingY: '1rem' }}>
                    <FormControl>
                        <BuildingCodeSelect buildings={buildings} selectedBuildingCode={selectedBuildingCode} setSelectedBuildingCode={setSelectedBuildingCode} />
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="unit-number" variant="outlined">Unit Number</InputLabel>
                        <Input id="unit-number"/>
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="resident-name" variant="outlined">Resident Name</InputLabel>
                        <Input id="resident-name"/>
                    </FormControl>                    
                </Box>
            </DialogContent>
            <DialogActions>
                <Button>Continue</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ResidentDetailDialog;