import Chip from '@mui/material/Chip';
import { Box, Stack } from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutTransaction, User } from '../../types/interfaces';
import HistoryCard from './HistoryCard';
import TransactionDetails from './TransactionDetails';
import { useTheme } from '@mui/material';
import { UserContext } from '../contexts/UserContext';
import { SETTINGS } from '../../types/constants';
import { formatTransactionEditDate } from './historyUtils';

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
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [showDetails, setShowDetails] = useState(false);
  const { total_quantity, is_edited, corrections } = checkoutTransaction;

  const latestEditDate = formatTransactionEditDate(corrections);
  const volunteerEditDate = corrections?.length
    ? formatTransactionEditDate(corrections, undefined, false)
    : null;
  const displayEditDate = user?.userRoles?.includes('admin')
    ? latestEditDate
    : volunteerEditDate;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (user.userRoles.includes('admin')) {
      setShowDetails(true);
    } else {
      navigate('/checkout', {
        state: {
          editTransaction: checkoutTransaction,
          correctionItems: corrections,
        },
      });
    }
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
              {is_edited && displayEditDate && <p>{displayEditDate}</p>}
            </div>
            <Chip
              sx={{
                color:
                  total_quantity > SETTINGS.checkout_item_limit
                    ? theme.palette.warning.dark
                    : theme.palette.success.dark,
                backgroundColor:
                  total_quantity > SETTINGS.checkout_item_limit
                    ? theme.palette.warning.lighter
                    : theme.palette.success.lighter,
              }}
              label={`${total_quantity} / ${SETTINGS.checkout_item_limit}`}
            />
          </HistoryCard>
          {is_edited && (
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
