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
}

const DialogTemplate = ({
    showDialog, 
    handleShowDialog,
    handleSubmit,
    title,
    submitButtonText,
    backButtonText,
    children
    }: DialogTemplateProps) => {

    const theme = useTheme();

    return (
        <Dialog 
        sx={{
            '& .MuiDialog-paper': {
              width: { xs: '80vw', md: '50vw' },
              maxHeight: '90vh',
              borderRadius: '15px',
              paddingY: title ? '1.5rem' : '0rem',
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

            {title &&
            <DialogTitle>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: '600', textTransform: 'capitalize' }}>{title}</Typography>
            </DialogTitle>}

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '1rem'}}>
            {children}
            </DialogContent>

            <DialogActions sx={{ display: 'flex', gap: '1rem' }}>
                {backButtonText && <Button onClick={handleShowDialog} sx={{ background: 'none', textDecoration: 'underline', color: theme.palette.text.primary }}>{backButtonText}</Button>}
                {submitButtonText && <Button sx={{ background: theme.palette.grey[100], color: theme.palette.text.primary, padding: '0.5rem 1.25rem' }} onClick={handleSubmit}>{submitButtonText}</Button>}
            </DialogActions>
        </Dialog>
    );
}

export default DialogTemplate;