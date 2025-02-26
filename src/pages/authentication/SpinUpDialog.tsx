import { Dialog, DialogTitle, DialogContent, Box, CircularProgress, Typography } from "@mui/material";

interface SpinUpDialogProps {
  open: boolean;
  retryCount: number;
}

const SpinUpDialog: React.FC<SpinUpDialogProps> = ({ open, retryCount }) => (
  <Dialog open={open} disableEscapeKeyDown>
    <DialogTitle>Database is starting up</DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <CircularProgress size={24} />
        <Typography>
          Please wait while the database spins up... (Attempt {retryCount} of 5)
        </Typography>
      </Box>
    </DialogContent>
  </Dialog>
);

export default SpinUpDialog;