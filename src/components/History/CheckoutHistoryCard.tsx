import { Box } from '@mui/material';
import { ReactNode } from 'react';

type CheckoutHistoryCardProps = {
  transactionId: string;
  children: ReactNode;
};

const CheckoutHistoryCard = ({
  transactionId,
  children,
}: CheckoutHistoryCardProps) => {
  return (
    <Box
      key={transactionId}
      sx={{
        border: '1px lightgray solid',
        borderRadius: '10px',
        paddingX: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {children}
    </Box>
  );
};

export default CheckoutHistoryCard;
