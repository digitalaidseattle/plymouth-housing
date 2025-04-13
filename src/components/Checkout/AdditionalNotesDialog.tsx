import { MouseEventHandler, useState } from 'react';
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
  Input
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CheckoutItemProp } from '../../types/interfaces';

type AdditionalNotesDialogProps = {
    showDialog: boolean,
    handleShowDialog: Function,
    item: CheckoutItemProp,
    addItemToCart: (item: CheckoutItemProp) => void;
}

const AdditionalNotesDialog = ({
    showDialog, 
    handleShowDialog, 
    item,
    addItemToCart
    }: AdditionalNotesDialogProps) => {

    const [additionalNotesInput, setAdditionalNotesInput] = useState<string>('')

    function handleSubmit(e) {
        e.preventDefault();
        // update additional info
        const updatedItem = {...item, additional_notes: additionalNotesInput}
        addItemToCart(updatedItem);
        handleShowDialog(false);
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
                <Typography sx={{ fontSize: '1.25rem' }}>Enter {item && item.name} Details</Typography>
                <Typography>You can specify the kind of appliance here.</Typography>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingY: '1rem' }}>
                    <FormControl>
                        <InputLabel htmlFor="additional-notes" variant="outlined">Additional notes</InputLabel>
                        <Input id="additional-notes" value={additionalNotesInput} onChange={(e)=>setAdditionalNotesInput(e.target.value)}/>
                    </FormControl>                   
                </Box>
            </DialogContent>
            <DialogActions>
                <Button type="submit">Add to cart</Button>
            </DialogActions>
            </form>
        </Dialog>
    );
}

export default AdditionalNotesDialog;