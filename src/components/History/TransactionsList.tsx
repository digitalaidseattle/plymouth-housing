import React from 'react';
import { Box, Stack } from '@mui/material';
import { Building, User } from '../../types/interfaces';
import { CheckoutTransaction, InventoryTransaction } from '../../types/history';
import GeneralCheckoutCard from './GeneralCheckoutCard';
import WelcomeBasketCard from './WelcomeBasketCard';
import InventoryCard from './InventoryCard';
import {
  createHowLongAgoString,
  calculateTimeDifference,
} from './historyUtils';

interface TransactionsListProps {
  transactionsByUser: Array<{
    user_id: number;
    transactions: (CheckoutTransaction | InventoryTransaction)[];
  }>;
  userList: User[] | null;
  buildings: Building[] | null;
  loggedInUserId: number | null;
  historyType: 'checkout' | 'inventory';
  userHistory: CheckoutTransaction[] | InventoryTransaction[] | null;
  singleWelcomeBasketQuantity: number;
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactionsByUser,
  userList,
  buildings,
  loggedInUserId,
  historyType,
  userHistory,
  singleWelcomeBasketQuantity,
}) => {
  if (userHistory && userHistory.length === 0) {
    return (
      <p>
        No transactions found for this date. Try selecting a different date
        range.
      </p>
    );
  }

  return (
    <Stack gap="2rem">
      {transactionsByUser?.map((user) => (
        <Box key={user.user_id}>
          <Stack direction="row" alignItems="center" gap="1rem">
            <h2>
              {loggedInUserId === user.user_id
                ? 'You'
                : (userList?.find((v) => v.id === user.user_id)?.name ?? '')}
            </h2>
            <span>
              {user.transactions.length}{' '}
              {user.transactions.length > 1 ? 'records' : 'record'}
            </span>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'repeat(2, 1fr)',
                xl: 'repeat(3, 1fr)',
              },
              gap: '1rem',
            }}
          >
            {user.transactions.map(
              (t: CheckoutTransaction | InventoryTransaction) => {
                const { minutes, hours, days } = calculateTimeDifference(
                  t.transaction_date,
                );
                const howLongAgoString = createHowLongAgoString(
                  minutes,
                  hours,
                  days,
                );
                const checkoutTransaction = t as CheckoutTransaction;
                if (
                  historyType === 'checkout' &&
                  checkoutTransaction.item_type === 'general'
                ) {
                  const quantity = checkoutTransaction.items.reduce(
                    (acc, item) => {
                      return acc + item.quantity;
                    },
                    0,
                  );
                  return (
                    <GeneralCheckoutCard
                      key={t.transaction_id}
                      checkoutTransaction={checkoutTransaction}
                      buildings={buildings}
                      quantity={quantity}
                      howLongAgoString={howLongAgoString}
                    />
                  );
                } else if (
                  historyType === 'checkout' &&
                  checkoutTransaction.item_type === 'welcome'
                ) {
                  const quantity = t.items.reduce((acc, item) => {
                    return acc + item.quantity;
                  }, 0);
                  return (
                    <WelcomeBasketCard
                      key={t.transaction_id}
                      checkoutTransaction={checkoutTransaction}
                      quantity={quantity}
                      buildings={buildings}
                      howLongAgoString={howLongAgoString}
                      singleWelcomeBasketQuantity={singleWelcomeBasketQuantity}
                    />
                  );
                } else if (historyType === 'inventory') {
                  const inventoryTransaction = t as InventoryTransaction;
                  return (
                    <InventoryCard
                      key={inventoryTransaction.transaction_id}
                      inventoryTransaction={inventoryTransaction}
                      howLongAgoString={howLongAgoString}
                    />
                  );
                }
              },
            )}
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export default TransactionsList;
