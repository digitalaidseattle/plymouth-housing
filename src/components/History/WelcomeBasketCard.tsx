import { Chip, useTheme } from '@mui/material';
import { CheckoutTransaction } from '../../types/history';
import { Building } from '../../types/interfaces';
import HistoryCard from './HistoryCard';

type WelcomeBasketCardProps = {
  checkoutTransaction: CheckoutTransaction;
  buildings: Building[] | null;
  howLongAgoString: string;
  quantity: number;
  singleWelcomeBasketQuantity: number;
};

const WelcomeBasketCard = ({
  checkoutTransaction,
  buildings,
  howLongAgoString,
  quantity,
  singleWelcomeBasketQuantity,
}: WelcomeBasketCardProps) => {
  const theme = useTheme();
  const itemIds = checkoutTransaction.items.map((i) => i.item_id);
  let welcomeBasketType;
  // TODO: is there a way to identify the welcome-basket-type w/o hardcoded values?
  if (itemIds.includes(175)) {
    welcomeBasketType = 'Twin-size Sheet Set';
  } else if (itemIds.includes(176)) {
    welcomeBasketType = 'Full-size Sheet Set';
  } else {
    welcomeBasketType = 'Other';
  }

  const numberOfBaskets = quantity / singleWelcomeBasketQuantity;

  return (
    <HistoryCard transactionId={checkoutTransaction.transaction_id}>
      <div>
        <h3>Welcome Basket: {welcomeBasketType}</h3>
        <p>
          {buildings?.find((b) => b.id === checkoutTransaction.building_id)
            ?.code ?? ''}
          {' - '}
          {buildings?.find((b) => b.id === checkoutTransaction.building_id)
            ?.name ?? ''}
        </p>
        <p>{howLongAgoString}</p>
      </div>
      <Chip
        sx={{
          color:
            numberOfBaskets > 5
              ? theme.palette.warning.dark
              : theme.palette.success.dark,
          backgroundColor:
            numberOfBaskets > 5
              ? theme.palette.warning.lighter
              : theme.palette.success.lighter,
        }}
        label={`${Math.floor(numberOfBaskets)}x`}
      />
    </HistoryCard>
  );
};

export default WelcomeBasketCard;
