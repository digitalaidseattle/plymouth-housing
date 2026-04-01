import { Dialog, DialogTitle, DialogContent, Box, CircularProgress, Typography } from "@mui/material";
import { SETTINGS } from "../../types/constants";

interface SpinUpDialogProps {
  open: boolean;
  retryCount: number;
}

const SpinUpDialog: React.FC<SpinUpDialogProps> = ({ open, retryCount }) => (
  <Dialog open={open} disableEscapeKeyDown>
    <DialogTitle>{retryCount === 0 ? 'Loading' : 'Database is starting up'}</DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <CircularProgress size={24} />
        <Typography>
          {retryCount === 0
            ? 'Loading, please wait...'
            : `Please wait while the database is starting... (Attempt ${retryCount} of ${SETTINGS.database_retry_attempts})`}
        </Typography>
      </Box>
    </DialogContent>
  </Dialog>
);

export default SpinUpDialog;