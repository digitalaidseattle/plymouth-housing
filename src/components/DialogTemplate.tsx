import {
  Dialog,
  DialogContent,
  Button,
  DialogTitle,
  Typography,
  DialogActions,
  useTheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { ReactNode, SyntheticEvent } from 'react';

type DialogTemplateProps = {
    showDialog: boolean,
    handleShowDialog: () => void,
    handleSubmit?: (e: SyntheticEvent) => void,
    title?: string,
    submitButtonText?: string,
    backButtonText?: string,
    children: ReactNode,
    isSubmitting?: boolean,
}

const DialogTemplate = ({
    showDialog, 
    handleShowDialog,
    handleSubmit,
    title,
    submitButtonText,
    backButtonText,
    children,
    isSubmitting,
    }: DialogTemplateProps) => {

    const theme = useTheme();

    return (
        <Dialog 
        data-testid="dialog"
        sx={{
            '& .MuiDialog-paper': {
              width: { xs: '80vw', md: '50vw' },
              maxHeight: '90vh',
              borderRadius: '15px',
              py: title ? 3 : 0,
              px: 6,
              position: 'relative'
            },
          }}
            open={showDialog}>
            {title &&
            <DialogTitle sx={{ px: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">{title}</Typography>
                <Button onClick={handleShowDialog} disableRipple id="dialog-close-btn" data-testid="dialog-close-btn" sx={{ minWidth: 'auto', px: 0 }}><Close/></Button>
            </DialogTitle>}

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 5, mt: 2, px: 0 }}>
            {children}
            </DialogContent>

            <DialogActions sx={{ display: 'flex', gap: 1, px: 0 }}>
                {backButtonText && <Button onClick={handleShowDialog} data-testid="dialog-back-btn" sx={{ background: 'none', textDecoration: 'underline', color: theme.palette.text.primary }}>{backButtonText}</Button>}
                {submitButtonText && <Button data-testid="dialog-submit-btn" sx={{ background: theme.palette.grey[100], color: theme.palette.text.primary, py: 1, px: 3 }} onClick={handleSubmit} disabled={isSubmitting}>{submitButtonText}</Button>}
            </DialogActions>
        </Dialog>
    );
}

export default DialogTemplate;