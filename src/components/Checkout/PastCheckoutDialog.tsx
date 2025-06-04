import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CheckoutItemProp, ResidentInfo } from '../../types/interfaces';

type PastCheckoutDialogProps = {
    showDialog: boolean,
    handleShowDialog: Function,
    item: CheckoutItemProp,
    residentInfo: ResidentInfo,
    addItemToCart: (item: CheckoutItemProp) => void;
}

const PastCheckoutDialog = ({
    showDialog, 
    handleShowDialog,
    item,
    residentInfo,
    addItemToCart 
    }: PastCheckoutDialogProps) => {

    function handleSubmit(e) {
        e.preventDefault();
        addItemToCart(item);
        handleShowDialog(false);
    }

    // TODO: make generic dialog component
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
                <Typography  sx={{ fontSize: '1.25rem' }}>Looks like they already got this one</Typography>
                <Typography>
                    {residentInfo.name} has previously checked out a {item.name}. Please check with a staff member before continuing.
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleShowDialog} disableRipple>Go back</Button>
                <Button onClick={handleSubmit}>Staff said it's ok</Button>
            </DialogActions>
        </Dialog>
    );
}

export default PastCheckoutDialog;