import { MouseEventHandler, useState, useEffect } from 'react';
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
  Alert,
  AlertTitle
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CheckoutItemProp, ResidentInfo } from '../../types/interfaces';
import { checkPastCheckout } from './CheckoutAPICalls';

type AdditionalNotesDialogProps = {
    showDialog: boolean,
    handleShowDialog: Function,
    item: CheckoutItemProp,
    residentInfo: ResidentInfo,
    addItemToCart: (item: CheckoutItemProp) => void;
    pastCheckout: (item: CheckoutItemProp) => boolean;
}

const AdditionalNotesDialog = ({
    showDialog, 
    handleShowDialog, 
    item,
    addItemToCart,
    pastCheckout,
    residentInfo
    }: AdditionalNotesDialogProps) => {

    const [additionalNotesInput, setAdditionalNotesInput] = useState<string>('')
    const [checkedOutItems, setCheckedOutItems] = useState<string[]>([])

    function handleSubmit(e) {
        e.preventDefault();
        // update additional info
        const updatedItem = {...item, additional_notes: additionalNotesInput}
        addItemToCart(updatedItem);
        handleShowDialog(false);
    }

    const previousCheckouts = pastCheckout(item);

    useEffect(() => {
        async function checkItemsOfPrevCheckouts() {
            const response = await checkPastCheckout(residentInfo.id, item.id);
            if (response.value.length > 0) { 
                setCheckedOutItems(response.value.map((item: CheckoutItemProp)=>item.additional_notes));
            }
        }
        if (pastCheckout(item)) {
            checkItemsOfPrevCheckouts();
        }
      }, [item, residentInfo])

    return (
        <Dialog 
        sx={{
            '& .MuiDialog-paper': {
              width: { xs: '80vw', md: '50vw' },
              maxHeight: '90vh',
              borderRadius: '15px',
              paddingY: '1.5rem', 
              paddingX: '3rem',
              position: 'relative'
            },
          }}
            open={showDialog}>
            <Box sx={{ 
                position: 'absolute',
                top: '1rem',
                right: '1rem'
            }}>
                <Button onClick={handleShowDialog} disableRipple><Close/></Button>
            </Box>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem'}}>
                {previousCheckouts &&
                <Alert severity="warning">
                    <AlertTitle sx={{fontWeight: 'bold'}}>Previous check outs for {item.name}</AlertTitle>
                    {residentInfo.name} has checked out the following items before:
                    <ul>
                        {checkedOutItems.map((item)=><li>{item}</li>)}
                    </ul>
                </Alert>}

                <Box>
                    <Typography sx={{ fontSize: '1.25rem' }}>Enter {item && item.name} Details</Typography>
                    <Typography>You can specify the appliance here.</Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', paddingBottom: '1rem' }}>
                        <FormControl>
                            <InputLabel htmlFor="additional-notes" variant="outlined">Name of appliance</InputLabel>
                            <Input id="additional-notes" value={additionalNotesInput} onChange={(e)=>setAdditionalNotesInput(e.target.value)}/>
                        </FormControl>                   
                    </Box>
                    <DialogActions>
                        <Button type="submit">Add to cart</Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AdditionalNotesDialog;