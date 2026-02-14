import Chip from '@mui/material/Chip';
import { CheckoutTransaction } from '../../types/history';
import { Building } from '../../types/interfaces';
import HistoryCard from './HistoryCard';
import { useTheme } from '@mui/material';

type GeneralCheckoutCardProps = {
  checkoutTransaction: CheckoutTransaction;
  buildings: Building[] | null;
  quantity: number;
  howLongAgoString: string;
};

const GeneralCheckoutCard = ({
  checkoutTransaction,
  buildings,
  quantity,
  howLongAgoString,
}: GeneralCheckoutCardProps) => {
  const theme = useTheme();

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
            quantity > 10
              ? theme.palette.warning.dark
              : theme.palette.success.dark,
          backgroundColor:
            quantity > 10
              ? theme.palette.warning.light
              : theme.palette.success.light,
        }}
        label={`${quantity} / 10`}
      />
    </HistoryCard>
  );
};

export default GeneralCheckoutCard;
