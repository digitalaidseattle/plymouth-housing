import { Chip, useTheme, Box } from '@mui/material';
import { useState } from 'react';
import { CheckoutTransaction, User } from '../../types/interfaces';
import HistoryCard from './HistoryCard';
import TransactionDetails from './TransactionDetails';
import { WELCOME_BASKET_ITEMS } from '../../types/constants';
import { formatTransactionEditDate } from './historyUtils';

type WelcomeBasketCardProps = {
  checkoutTransaction: CheckoutTransaction;
  howLongAgoString: string;
  userList?: User[] | null;
};

const WelcomeBasketCard = ({
  checkoutTransaction,
  howLongAgoString,
  userList,
}: WelcomeBasketCardProps) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const {
    welcome_basket_item_id,
    welcome_basket_quantity,
    is_edited,
    corrections,
  } = checkoutTransaction;

  const latestEditDate = formatTransactionEditDate(corrections);

  let welcomeBasketType: string;
  if (welcome_basket_item_id === WELCOME_BASKET_ITEMS.TWIN) {
    welcomeBasketType = 'Twin-size Sheet Set';
  } else if (welcome_basket_item_id === WELCOME_BASKET_ITEMS.FULL) {
    welcomeBasketType = 'Full-size Sheet Set';
  } else {
    throw new Error(
      `Unrecognized welcome basket item ID: ${welcome_basket_item_id}`,
    );
  }

  const numberOfBaskets = welcome_basket_quantity ?? 0;

  return (
    <>
      <Box
        onClick={() => setShowDetails(true)}
        sx={{ position: 'relative', width: '100%', cursor: 'pointer' }}
      >
        <HistoryCard transactionId={checkoutTransaction.transaction_id}>
          <div>
            <h3>Welcome Basket: {welcomeBasketType}</h3>
            <p>
              {checkoutTransaction.building_code}
              {' - '}
              {checkoutTransaction.building_name}
            </p>
            <p>{howLongAgoString}</p>
            {is_edited && latestEditDate && <p>{latestEditDate}</p>}
          </div>
          <Chip
            sx={{
              color:
                numberOfBaskets > 5
                  ? theme.palette.warning.dark
                  : theme.palette.success.dark,
              backgroundColor:
                numberOfBaskets > 5
                  ? theme.palette.warning.lighter
                  : theme.palette.success.lighter,
            }}
            label={`${Math.floor(numberOfBaskets)}x`}
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
      <TransactionDetails
        checkoutTransaction={checkoutTransaction}
        userList={userList ?? null}
        externalShowDialog={showDetails}
        onDialogClose={() => setShowDetails(false)}
      />
    </>
  );
};

export default WelcomeBasketCard;
