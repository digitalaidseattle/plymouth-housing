/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useRef, useState } from 'react';

// material-ui
import { Box, IconButton } from '@mui/material';

// project import

// assets
import { ThunderboltOutlined } from '@ant-design/icons';
import { DASSnackbar } from '../../components/DASSnackbar';
// import TicketDialog from './TicketDialog'; //TODO
// import { Ticket } from './ticketService';//TODO
// import { loggingService } from '../../services/loggingService';//TODO
// import { UserContext } from '../../components/contexts/UserContext';//TODO

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //
const Labels = {
  createdMessage: 'Ticket created.',
};

const TicketToolbarItem: React.FC = () => {
  const anchorRef = useRef(null);
  // const { user } = useContext(UserContext);//TODO update User and related code
  const [open, setOpen] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);

  const iconBackColorOpen = 'grey.300';
  const iconBackColor = 'grey.100';

  // const handleSuccess = (resp: Ticket | null) => { //TODO
  //   if (resp) {
  //     setOpenSnack(true);
  //   }
  //   setOpen(false);
  // };

  // const handleError = (err: Error) => { //TODO
  //   loggingService.error(err.message, user!);
  //   setOpen(false);
  // };

  const toggle = () => {
    setOpen(!open);
  };

  return (
    <React.Fragment>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <IconButton
          disableRipple
          color="secondary"
          sx={{
            color: 'text.primary',
            bgcolor: open ? iconBackColorOpen : iconBackColor,
          }}
          aria-label="open profile"
          ref={anchorRef}
          aria-controls={open ? 'profile-grow' : undefined}
          aria-haspopup="true"
          onClick={toggle}
        >
          <ThunderboltOutlined />
        </IconButton>
      </Box>
      {/* <TicketDialog //TODO 
        open={open}
        handleSuccess={handleSuccess}
        handleError={handleError}
      /> */}
      <DASSnackbar
        message={Labels.createdMessage}
        open={openSnack}
        severity={'success'}
        onClose={() => setOpenSnack(false)}
      />
    </React.Fragment>
  );
};

export default TicketToolbarItem;
