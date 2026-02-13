import { Box } from '@mui/material';
import { ReactNode } from 'react';

type HistoryCardProps = {
  transactionId: string;
  children: ReactNode;
  onClick?: () => void;
  clickable?: boolean;
};

const HistoryCard = ({
  transactionId,
  children,
  onClick,
  clickable,
}: HistoryCardProps) => {
  return (
    <Box
      key={transactionId}
      onClick={onClick}
      sx={{
        border: '1px lightgray solid',
        borderRadius: '10px',
        paddingX: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background-color 0.2s',
        '&:hover': clickable
          ? {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          : {},
      }}
    >
      {children}
    </Box>
  );
};

export default HistoryCard;
