import Chip from '@mui/material/Chip';
import { CheckoutTransaction } from '../../types/history';
import { Building } from '../../types/interfaces';
import HistoryCard from './HistoryCard';
import { useTheme } from '@mui/material';
import { CHECKOUT_QUANTITY_LIMIT } from './historyUtils';

type GeneralCheckoutCardProps = {
  checkoutTransaction: CheckoutTransaction;
  buildings: Building[] | null;
  howLongAgoString: string;
};

const GeneralCheckoutCard = ({
  checkoutTransaction,
  buildings,
  howLongAgoString,
}: GeneralCheckoutCardProps) => {
  const theme = useTheme();
  const { total_quantity } = checkoutTransaction;

  return (
    <HistoryCard
      key={checkoutTransaction.transaction_id}
      transactionId={checkoutTransaction.transaction_id}
    >
      <div>
        <h3>{checkoutTransaction.resident_name}</h3>
        <p>
          {buildings?.find((b) => b.id === checkoutTransaction.building_id)
            ?.code ?? ''}
          {' - '}
          {buildings?.find((b) => b.id === checkoutTransaction.building_id)
            ?.name ?? ''}
          {' - '}
          {checkoutTransaction.unit_number}
        </p>
        <p>{howLongAgoString}</p>
      </div>
      <Chip
        sx={{
          color:
            total_quantity > CHECKOUT_QUANTITY_LIMIT
              ? theme.palette.warning.dark
              : theme.palette.success.dark,
          backgroundColor:
            total_quantity > CHECKOUT_QUANTITY_LIMIT
              ? theme.palette.warning.lighter
              : theme.palette.success.lighter,
        }}
        label={`${total_quantity} / ${CHECKOUT_QUANTITY_LIMIT}`}
      />
    </HistoryCard>
  );
};

export default GeneralCheckoutCard;
