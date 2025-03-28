import React, { useContext, useEffect, useState } from 'react';
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


const ResidentDetailDialog = () => {

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
            open={true}>
            <Box sx={{ 
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem'
            }}>
                <Close/>
            </Box>
            <DialogTitle>
                <Typography sx={{ fontSize: '1.25rem' }}>Provide details to continue</Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <FormControl>
                        <InputLabel htmlFor="building-code" variant="outlined">Building Code</InputLabel>
                        <Select id="building-code"/>
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="unit-number" variant="outlined">Unit Number</InputLabel>
                        <Select id="unit-number"/>
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