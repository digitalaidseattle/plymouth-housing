import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Input,
  Alert,
  AlertTitle,
  Stack
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CheckoutHistoryItem, CheckoutItemProp, ResidentInfo } from '../../types/interfaces';
import CheckedoutListItem from './CheckedoutListItem';

type AdditionalNotesDialogProps = {
    showDialog: boolean,
    handleShowDialog: Function,
    item: CheckoutItemProp,
    residentInfo: ResidentInfo,
    addItemToCart: (item: CheckoutItemProp) => void;
    checkoutHistory: CheckoutHistoryItem[];
}

const AdditionalNotesDialog = ({
    showDialog, 
    handleShowDialog, 
    item,
    addItemToCart,
    residentInfo,
    checkoutHistory
    }: AdditionalNotesDialogProps) => {

    const [additionalNotesInput, setAdditionalNotesInput] = useState<string>('')

    function handleSubmit(e) {
        e.preventDefault();
        // update additional info
        const updatedItem = {...item, additional_notes: additionalNotesInput}
        addItemToCart(updatedItem);
        handleShowDialog(false);
    }

    const previousCheckouts = checkoutHistory.map(i => i.item_id).includes(item.id);

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
                {previousCheckouts && checkoutHistory &&
                <Stack gap="1rem">
                    <Box>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: '600' }}>Check before adding item</Typography>
                        <Typography>
                            Please check with a staff member before adding any items that have already been checked out.
                        </Typography>
                    </Box>
                    <Box>
                        <Stack direction="row" gap="1rem">
                            <Typography sx={{ fontSize: '1rem', fontWeight: '600' }}>Previously checked out</Typography>
                            <Typography>{checkoutHistory.filter(i => i.item_id===166).length} items</Typography>
                        </Stack>
                        <Box sx={{ 
                            border: '1px solid gray',
                            borderRadius: '6px',
                            height: '8rem',
                            overflowY: 'auto'
                        }}>
                            {checkoutHistory.filter(i => i.item_id===166)
                                .map(i => <CheckedoutListItem itemName={i.additionalNotes} timesCheckedOut={i.timesCheckedOut}/>)
                            }
                        </Box>
                    </Box>
                </Stack>
                }

                <Stack gap="1rem">
                    <Box>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: '600' }}>Enter {item && item.name} Details</Typography>
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
                </Stack>

            </DialogContent>
        </Dialog>
    );
}

export default AdditionalNotesDialog;