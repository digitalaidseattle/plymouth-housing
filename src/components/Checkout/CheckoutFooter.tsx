import { CheckoutItem } from '../../types/interfaces';
import { Box, Button, Typography } from '@mui/material';
import { DrawerOpenContext } from '../contexts/DrawerOpenContext';
import { useContext } from 'react';

type CheckoutItemsProp = {
  checkoutItems: CheckoutItem[];
  selectedBuildingCode: string;
  setOpenSummary: (open: boolean) => void;
}

const CheckoutFooter = ({ checkoutItems, setOpenSummary, selectedBuildingCode }: CheckoutItemsProp) => {

  const { drawerOpen } = useContext(DrawerOpenContext);

  return (
    <>
      {checkoutItems.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: drawerOpen ? '260px' : '0',
            width: drawerOpen ? 'calc(100% - 260px)' : '100%',
            transition: 'left 0.3s ease, width 0.3s ease',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100px',
            backgroundColor: '#C0C0C0',
            px: '5%'
          }}
        >
          <Typography>
            {checkoutItems.reduce(
              (accumulator, item) => accumulator + item.quantity,
              0,
            )}{' '}
            items selected
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!selectedBuildingCode || selectedBuildingCode.length === 0 ? (
              <Typography sx={{ color: 'red', marginRight: '15px' }}>Building Code Not Selected</Typography>
            ) : null}
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenSummary(true)}
              disabled={!selectedBuildingCode || selectedBuildingCode.length === 0}
            >
              Continue
            </Button>
          </Box>

        </Box>
      )}
    </>
  )
}

export default CheckoutFooter;