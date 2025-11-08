import { Box } from '@mui/material';
import { Building } from '../../types/interfaces';
import Typography from '@mui/material';

type CheckoutHistoryCardProps = {
  transactionId: string;
  residentName: string;
  unitNumber: string;
  // building: string;
  // totalItems: number;
  timestamp: Date;
};

const CheckoutHistoryCard = ({
  transactionId,
  residentName,
  unitNumber,
  // building,
  // totalItems,
  timestamp,
}: CheckoutHistoryCardProps) => {
  return (
    <Box
      sx={{
        border: '1px solid gray',
        borderRadius: '20px',
      }}
    >
      <Typography variant="h4">{residentName}</Typography>
      <Typography>{building}</Typography>
      <Typography>{unitNumber}</Typography>
      <Typography>{totalItems}/10</Typography>
      <Typography>{timestamp}</Typography>
    </Box>
  );
};

export default CheckoutHistoryCard;
