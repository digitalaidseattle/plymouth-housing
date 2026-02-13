import { CheckoutTransaction } from '../../types/history';
import { Building } from '../../types/interfaces';
import HistoryCard from './HistoryCard';

type WelcomeBasketCardProps = {
  checkoutTransaction: CheckoutTransaction;
  buildings: Building[] | null;
  howLongAgoString: string;
  onClick?: () => void;
};

const WelcomeBasketCard = ({
  checkoutTransaction,
  buildings,
  howLongAgoString,
  onClick,
}: WelcomeBasketCardProps) => {
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

  return (
    <HistoryCard
      transactionId={checkoutTransaction.transaction_id}
      onClick={onClick}
      clickable={!!onClick}
    >
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
    </HistoryCard>
  );
};

export default WelcomeBasketCard;
