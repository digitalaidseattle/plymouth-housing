import Chip from '@mui/material/Chip';
import { Box } from '@mui/material';
import { CheckoutTransaction } from '../../types/interfaces';
import HistoryCard from './HistoryCard';
import { useTheme } from '@mui/material';
import { SETTINGS } from '../../types/constants';
import { formatTransactionDate, formatEditDate } from './historyUtils';

type GeneralCheckoutCardProps = {
  checkoutTransaction: CheckoutTransaction;
  howLongAgoString: string;
  onClick?: () => void;
};

const GeneralCheckoutCard = ({
  checkoutTransaction,
  howLongAgoString,
  onClick,
}: GeneralCheckoutCardProps) => {
  const theme = useTheme();
  const { total_quantity, is_edited, corrections } = checkoutTransaction;

  const latestEditDate = formatEditDate(corrections);

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
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
            {is_edited && latestEditDate && <p>{latestEditDate}</p>}
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
            label="Modified"
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
    </Box>
  );
};

export default GeneralCheckoutCard;
