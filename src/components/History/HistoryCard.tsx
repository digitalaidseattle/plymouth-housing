import { Box } from '@mui/material';
import { ReactNode } from 'react';

type HistoryCardProps = {
  transactionId: string;
  children: ReactNode;
};

const HistoryCard = ({ transactionId, children }: HistoryCardProps) => {
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

export default HistoryCard;
