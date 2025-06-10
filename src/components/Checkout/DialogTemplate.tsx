import {
  Dialog,
  DialogContent,
  Button,
  Box,
  DialogTitle,
  Typography,

} from '@mui/material';
import { Close } from '@mui/icons-material';
import { ReactNode } from 'react';

type DialogTemplateProps = {
    showDialog: boolean,
    handleShowDialog: () => void,
    title?: string,
    children: ReactNode,
}

const DialogTemplate = ({
    showDialog, 
    handleShowDialog,
    title,
    children
    }: DialogTemplateProps) => {

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

            {title &&
            <DialogTitle>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: '600', textTransform: 'capitalize' }}>{title}</Typography>
            </DialogTitle>}

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '1rem'}}>
            {children}
            </DialogContent>
        </Dialog>
    );
}

export default DialogTemplate;