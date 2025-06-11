import {
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
            handleSubmit={handleSubmit}
            title="looks like they already got this one"
            submitButtonText='staff said it is ok'
            backButtonText='go back'>
            <Typography>
                {residentInfo.name} has previously checked out a {item.name}. Please check with a staff member before continuing.
            </Typography>
        </DialogTemplate>      
    );
}

export default PastCheckoutDialog;