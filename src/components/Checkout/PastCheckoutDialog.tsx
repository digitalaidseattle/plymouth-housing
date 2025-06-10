import {
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { CheckoutItemProp, ResidentInfo } from '../../types/interfaces';
import DialogTemplate from './DialogTemplate';

type PastCheckoutDialogProps = {
    showDialog: boolean,
    handleShowDialog: () => void,
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

    function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        addItemToCart(item);
        handleShowDialog();
    }

    return (
        <DialogTemplate 
            showDialog={showDialog} 
            handleShowDialog={handleShowDialog} 
            title="looks like they already got this one">
            <Typography>
                {residentInfo.name} has previously checked out a {item.name}. Please check with a staff member before continuing.
            </Typography>

            <DialogActions>
                <Button onClick={handleShowDialog} disableRipple>Go back</Button>
                <Button onClick={handleSubmit}>Staff said it's ok</Button>
            </DialogActions>
        </DialogTemplate>      
    );
}

export default PastCheckoutDialog;