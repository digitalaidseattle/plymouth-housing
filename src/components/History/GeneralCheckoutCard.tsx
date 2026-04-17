import Chip from '@mui/material/Chip';
import { Box, Stack } from '@mui/material';
import { useContext, useState } from 'react';
import { CheckoutTransaction, User } from '../../types/interfaces';
import HistoryCard from './HistoryCard';
import TransactionDetails from './TransactionDetails';
import { useTheme } from '@mui/material';
import { UserContext } from '../contexts/UserContext';
import { SETTINGS } from '../../types/constants';

type GeneralCheckoutCardProps = {
  checkoutTransaction: CheckoutTransaction;
  howLongAgoString: string;
  userList?: User[] | null;
};

const GeneralCheckoutCard = ({
  checkoutTransaction,
  howLongAgoString,
  userList,
}: GeneralCheckoutCardProps) => {
  const theme = useTheme();
  const { user } = useContext(UserContext);
  const [showDetails, setShowDetails] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setShowDetails(true);
  };

  return (
    <>
      <Stack
        onClick={handleCardClick}
        sx={{
          cursor: 'pointer',
        }}
      >
        <Box sx={{ position: 'relative', width: '100%' }}>
          <HistoryCard
            key={checkoutTransaction.transaction_id}
            transactionId={checkoutTransaction.transaction_id}
          >
            <div>
              <h3>{checkoutTransaction.resident_name}</h3>
              <p>
                {checkoutTransaction.building_code}
                {' - '}
                {checkoutTransaction.building_name}
                {' - '}
                {checkoutTransaction.unit_number}
              </p>
              <p>{howLongAgoString}</p>
            </div>
            <Chip
              sx={{
                color: theme.palette.success.dark,
                backgroundColor: theme.palette.success.lighter,
              }}
              label={`${checkoutTransaction.total_quantity} / ${SETTINGS.checkout_item_limit}`}
            />
          </HistoryCard>
          {checkoutTransaction.is_edited && (
            <Chip
              label="Edited"
              size="small"
              variant="outlined"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
                borderColor: theme.palette.grey[300],
                backgroundColor: 'transparent',
              }}
            />
          )}
        </Box>
      </Stack>
      <TransactionDetails
        checkoutTransaction={checkoutTransaction}
        userList={userList ?? null}
        showDialog={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export default GeneralCheckoutCard;
