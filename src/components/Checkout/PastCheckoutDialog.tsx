import {
  Typography,
} from '@mui/material';
import { CheckoutItemProp, ResidentInfo } from '../../types/interfaces';
import DialogTemplate from '../DialogTemplate';
import { SyntheticEvent } from 'react';

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

    function handleSubmit(e: SyntheticEvent) {
        e.preventDefault();
        addItemToCart(item);
        handleShowDialog();
    }

    return (
        <DialogTemplate 
            showDialog={showDialog} 
            handleShowDialog={handleShowDialog} 
            handleSubmit={handleSubmit}
            title="Looks like they already got this one"
            submitButtonText='Staff said it is OK'
            backButtonText='Go back'>
            <Typography>
                {residentInfo.name} has previously checked out a {item.name}. Please check with a staff member before continuing.
            </Typography>
        </DialogTemplate>      
    );
}

export default PastCheckoutDialog;