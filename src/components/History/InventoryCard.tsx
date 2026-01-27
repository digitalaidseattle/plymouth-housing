import { InventoryTransaction, TransactionType } from '../../types/history';
import HistoryCard from './HistoryCard';

type InventoryCardProps = {
  inventoryTransaction: InventoryTransaction;
  howLongAgoString: string;
};

const InventoryCard = ({
  inventoryTransaction,
  howLongAgoString,
}: InventoryCardProps) => {
  const item = inventoryTransaction.items[0];
  return (
    <HistoryCard transactionId={inventoryTransaction.id}>
      <div>
        <h3>{item.item_name}</h3>
        <p>{item.category_name}</p>
        <p>{howLongAgoString}</p>
      </div>
      {inventoryTransaction.transaction_type ===
      TransactionType.InventoryAdd ? (
        <p>
          {item.quantity > 0 ? 'Added' : 'Removed'} {Math.abs(item.quantity)}{' '}
          items
        </p>
      ) : (
        <p>{'Replaced quantity: ' + item.quantity}</p>
      )}
    </HistoryCard>
  );
};

export default InventoryCard;
