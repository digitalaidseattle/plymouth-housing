/**
 *  InventoryCard.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { InventoryTransaction, TransactionType } from '../../types/interfaces';
import HistoryCard from './HistoryCard';
import { withCount } from '../../utils/textUtils';

type InventoryCardProps = {
  inventoryTransaction: InventoryTransaction;
  howLongAgoString: string;
};

const InventoryCard = ({
  inventoryTransaction,
  howLongAgoString,
}: InventoryCardProps) => {
  return (
    <HistoryCard transactionId={inventoryTransaction.transaction_id}>
      <div>
        <h3>{inventoryTransaction.item_name}</h3>
        <p>{inventoryTransaction.category_name}</p>
        <p>{howLongAgoString}</p>
      </div>
      {inventoryTransaction.transaction_type ===
      TransactionType.InventoryAdd ? (
        <p>
          {inventoryTransaction.quantity > 0 ? 'Added' : 'Removed'}{' '}
          {withCount(Math.abs(inventoryTransaction.quantity), 'item')}
        </p>
      ) : (
        <p>{'Replaced quantity: ' + inventoryTransaction.quantity}</p>
      )}
    </HistoryCard>
  );
};

export default InventoryCard;
