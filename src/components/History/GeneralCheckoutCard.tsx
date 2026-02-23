import Chip from '@mui/material/Chip';
import { Building, CheckoutTransaction } from '../../types/interfaces';
import HistoryCard from './HistoryCard';
import { useTheme } from '@mui/material';
import { SETTINGS } from '../../types/constants';

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
  );
};

export default GeneralCheckoutCard;
