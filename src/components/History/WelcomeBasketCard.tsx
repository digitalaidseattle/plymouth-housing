import { Chip, useTheme } from '@mui/material';
import { CheckoutTransaction } from '../../types/history';
import { Building } from '../../types/interfaces';
import HistoryCard from './HistoryCard';
import { WELCOME_BASKET_ITEMS } from './historyUtils';

type WelcomeBasketCardProps = {
  checkoutTransaction: CheckoutTransaction;
  buildings: Building[] | null;
  howLongAgoString: string;
};

const WelcomeBasketCard = ({
  checkoutTransaction,
  buildings,
  howLongAgoString,
}: WelcomeBasketCardProps) => {
  const theme = useTheme();
  const { welcome_basket_item_id, welcome_basket_quantity } =
    checkoutTransaction;

  let welcomeBasketType: string;
  if (welcome_basket_item_id === WELCOME_BASKET_ITEMS.TWIN) {
    welcomeBasketType = 'Twin-size Sheet Set';
  } else if (welcome_basket_item_id === WELCOME_BASKET_ITEMS.FULL) {
    welcomeBasketType = 'Full-size Sheet Set';
  } else {
    throw new Error(
      `Unrecognized welcome basket item ID: ${welcome_basket_item_id}`,
    );
  }

  const numberOfBaskets = welcome_basket_quantity ?? 0;

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
