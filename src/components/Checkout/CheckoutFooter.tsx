import { CategoryProps } from '../../types/interfaces';
import { Box, Button, Typography } from '@mui/material';
import { DrawerOpenContext } from '../contexts/DrawerOpenContext';
import { useContext } from 'react';

type CheckoutItemsProp = {
  checkoutItems: CategoryProps[];
  selectedBuildingCode: string;
  setOpenSummary: (open: boolean) => void;
  residentInfoIsMissing: boolean;
}

const CheckoutFooter = ({ checkoutItems, setOpenSummary, selectedBuildingCode, residentInfoIsMissing }: CheckoutItemsProp) => {

  const { drawerOpen } = useContext(DrawerOpenContext);

  const hasNonZeroCategoryCount = checkoutItems.some((category) => category.categoryCount > 0);

  const totalCategoryCount = checkoutItems.reduce(
    (accumulator, category) => accumulator + category.categoryCount,
    0
  );



  return (
    <>
      {hasNonZeroCategoryCount && (
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
            {totalCategoryCount} / 10 items added
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {residentInfoIsMissing ? (
              <Typography sx={{ color: 'red', marginRight: '15px' }}>
                Fill out the missing resident info before continuing
              </Typography>
            ) : totalCategoryCount > 10 ? (
              <Typography sx={{ color: 'red', marginRight: '15px' }}>
                Cart Exceeds 10 Items
              </Typography>
            ) : null}

            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenSummary(true)}
              disabled={
                !selectedBuildingCode ||
                selectedBuildingCode.length === 0 ||
                totalCategoryCount > 10
              }
            >
              Proceed to Checkout
            </Button>
          </Box>

        </Box>
      )}
    </>
  )
}

export default CheckoutFooter;