import React from 'react';
import { Box, Stack } from '@mui/material';
import { Building, User, CheckoutTransaction, InventoryTransaction } from '../../types/interfaces';
import GeneralCheckoutCard from './GeneralCheckoutCard';
import WelcomeBasketCard from './WelcomeBasketCard';
import InventoryCard from './InventoryCard';
import { formatTransactionDate } from './historyUtils';

interface TransactionsListProps {
  transactionsByUser: Array<{
    user_id: number;
    transactions: (CheckoutTransaction | InventoryTransaction)[];
  }>;
  userList: User[] | null;
  buildings: Building[] | null;
  loggedInUserId: number | null;
  historyType: 'checkout' | 'inventory';
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactionsByUser,
  userList,
  buildings,
  loggedInUserId,
  historyType,
}) => {

  if (transactionsByUser.length === 0) {
    return (
      <p>
        No transactions found for this date. Try selecting a different date
        range.
      </p>
    );
  }

  return (
    <Stack gap={4}>
      {transactionsByUser?.map((user) => (
        <Box key={user.user_id}>
          <Stack direction="row" alignItems="center" gap={2}>
            <h2>
              {loggedInUserId === user.user_id
                ? 'You'
                : (() => {
                    const foundUser = userList?.find(
                      (v) => v.id === user.user_id,
                    );
                    if (!foundUser) return 'Unknown user';
                    return foundUser.role === 'admin'
                      ? `(Admin) ${foundUser.name}`
                      : foundUser.name;
                  })()}
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
              gap: 2,
            }}
          >
            {user.transactions.map(
              (t: CheckoutTransaction | InventoryTransaction) => {
                const howLongAgoString = formatTransactionDate(t.transaction_date);
                const checkoutTransaction = t as CheckoutTransaction;
                if (
                  historyType === 'checkout' &&
                  checkoutTransaction.item_type === 'general'
                ) {
                  return (
                    <GeneralCheckoutCard
                      key={t.transaction_id}
                      checkoutTransaction={checkoutTransaction}
                      buildings={buildings}
                      howLongAgoString={howLongAgoString}
                    />
                  );
                } else if (
                  historyType === 'checkout' &&
                  checkoutTransaction.item_type === 'welcome'
                ) {
                  return (
                    <WelcomeBasketCard
                      key={t.transaction_id}
                      checkoutTransaction={checkoutTransaction}
                      buildings={buildings}
                      howLongAgoString={howLongAgoString}
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
