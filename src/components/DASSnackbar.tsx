/**
 * DASSnackbar.tsx
 * 
 * Display an alert
 * user sererity for "error", "info", "success"
 * 
 * 
 */

import { Alert, AlertColor, Snackbar, Typography } from "@mui/material";

const HIDE_DURATION = 6000;

interface DASSnackbarProps {
    open: boolean,
    message: string,
    severity: AlertColor,
    onClose: () => void
}

const DASSnackbar: React.FC<DASSnackbarProps> = ({
    open = false,
    message = '',
    severity = 'success',
    onClose }) => {
    return (
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={open}
            autoHideDuration={HIDE_DURATION}
            onClose={onClose}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                <Typography>{message}</Typography>
            </Alert>
        </Snackbar>
    );
}

export { DASSnackbar }
