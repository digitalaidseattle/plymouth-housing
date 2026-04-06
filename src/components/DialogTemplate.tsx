import {
  Dialog,
  DialogContent,
  Button,
  Box,
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
        sx={{
            '& .MuiDialog-paper': {
              width: { xs: '80vw', md: '50vw' },
              maxHeight: '90vh',
              borderRadius: '15px',
              paddingY: title ? 3 : 0,
              paddingX: 6,
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

            {title &&
            <DialogTitle>
                <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>{title}</Typography>
            </DialogTitle>}

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2}}>
            {children}
            </DialogContent>

            <DialogActions sx={{ display: 'flex', gap: 2 }}>
                {backButtonText && <Button onClick={handleShowDialog} sx={{ background: 'none', textDecoration: 'underline', color: theme.palette.text.primary }}>{backButtonText}</Button>}
                {submitButtonText && <Button sx={{ background: theme.palette.grey[100], color: theme.palette.text.primary, padding: '1 2.5' }} onClick={handleSubmit} disabled={isSubmitting}>{submitButtonText}</Button>}
            </DialogActions>
        </Dialog>
    );
}

export default DialogTemplate;