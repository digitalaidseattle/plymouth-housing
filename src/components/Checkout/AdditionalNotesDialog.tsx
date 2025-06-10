import { FormEvent, useState } from 'react';
import {
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Input,
  Stack
} from '@mui/material';
import { CheckoutHistoryItem, CheckoutItemProp, ResidentInfo } from '../../types/interfaces';
import CheckedoutListItem from './CheckedoutListItem';
import DialogTemplate from './DialogTemplate';

type AdditionalNotesDialogProps = {
    showDialog: boolean,
    handleShowDialog: () => void,
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
    checkoutHistory
    }: AdditionalNotesDialogProps) => {

    const [additionalNotesInput, setAdditionalNotesInput] = useState<string>('')

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const updatedItem = {...item, additional_notes: additionalNotesInput}
        addItemToCart(updatedItem);
        handleShowDialog();
    }

    const previousCheckouts = checkoutHistory.map(i => i.item_id).includes(item.id);

    return (
        <DialogTemplate showDialog={showDialog} handleShowDialog={handleShowDialog}>
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
                        maxHeight: '8rem',
                        overflowY: 'auto'
                    }}>
                        {checkoutHistory.filter(i => i.item_id===166).map(i => 
                            <CheckedoutListItem itemName={i.additionalNotes} timesCheckedOut={i.timesCheckedOut}/>)
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
        </DialogTemplate>
    );
}

export default AdditionalNotesDialog;