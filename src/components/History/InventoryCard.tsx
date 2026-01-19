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
  return (
    <HistoryCard transactionId={inventoryTransaction.id}>
      <div>
        <h3>{inventoryTransaction.item_name}</h3>
        <p>{inventoryTransaction.category_name}</p>
        <p>{howLongAgoString}</p>
      </div>
      {inventoryTransaction.transaction_type ===
      TransactionType.InventoryAdd ? (
        <p>
          {inventoryTransaction.quantity > 0 ? 'Added' : 'Removed'}{' '}
          {Math.abs(inventoryTransaction.quantity)} items
        </p>
      ) : (
        <p>{'Replaced quantity:' + inventoryTransaction.quantity}</p>
      )}
    </HistoryCard>
  );
};

export default InventoryCard;
