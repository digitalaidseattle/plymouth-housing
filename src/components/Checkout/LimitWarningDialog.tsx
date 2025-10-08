import {
    Stack,
  Typography,
} from '@mui/material';
import DialogTemplate from '../DialogTemplate';

type LimitWarningDialogProps = {
    showDialog: boolean,
    title: string,
    handleShowDialog: () => void,
}
export const LimitWarningDialog = ({ showDialog, handleShowDialog, title }: LimitWarningDialogProps) => {
    return (
        <DialogTemplate 
            showDialog={showDialog}
            handleShowDialog={handleShowDialog}
            title={title}
            submitButtonText="Staff said it's ok"
            backButtonText="Return to check out summary"
        >
            <Stack>
                <Typography>Total items:</Typography>
                <Typography>Categories:</Typography>
                <Typography>Please chat with a staff member before continuing.</Typography>
            </Stack>   

        </DialogTemplate>
    )
}