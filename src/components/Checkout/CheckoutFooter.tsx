import { CheckoutItem } from '../../types/interfaces';
import { Box, Button, Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';

type CheckoutItemsProp = {
  checkoutItems: CheckoutItem[];
}

const CheckoutFooter = ({ checkoutItems }: CheckoutItemsProp) => {

  const { drawerOpen } = useOutletContext();

  return (
    <>
      {checkoutItems.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: drawerOpen ? '260px' : '0',
            width: drawerOpen ? 'calc(100% - 260px)' : '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100px',
            backgroundColor: '#C0C0C0',
          }}
        >
          <Typography>
            {checkoutItems.reduce(
              (accumulator, item) => accumulator + item.quantity,
              0,
            )}{' '}
            items selected
          </Typography>
          <Button
            variant="text"
            style={{ color: 'black', backgroundColor: 'white' }}
            onClick={() => setOpenSummary(true)}
          >
            Continue
          </Button>
        </Box>
      )}
    </>
  )
}

export default CheckoutFooter;