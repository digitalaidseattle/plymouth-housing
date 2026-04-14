import { Button, Chip, CircularProgress, Divider, Stack, Typography, useTheme } from '@mui/material';
import { SyntheticEvent, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransaction } from '../../services/checkoutService';
import { getItems } from '../../services/itemsService';
import {
  CheckoutTransaction,
  EditTransactionState,
  InventoryItem,
  Transaction,
  User,
} from '../../types/interfaces';
import DialogTemplate from '../DialogTemplate';
import { UserContext } from '../contexts/UserContext';
import { formatTransactionEditDate } from './historyUtils';
import { withCount, signNumber } from '../../utils/textUtils';

interface TransactionDetailsProps {
  checkoutTransaction: CheckoutTransaction;
  userList: User[] | null;
  externalShowDialog?: boolean;
  onDialogClose?: () => void;
}

const TransactionDetails = ({
  checkoutTransaction,
  userList,
  externalShowDialog,
  onDialogClose,
}: TransactionDetailsProps) => {
  const theme = useTheme();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mainTransaction, setMainTransaction] = useState<Transaction | null>(null);
  const [correctionTransactions, setCorrectionTransactions] = useState<Transaction[]>([]);
  const [itemNames, setItemNames] = useState<Map<number, string>>(new Map());

  const corrections = useMemo(
    () => checkoutTransaction.corrections ?? [],
    [checkoutTransaction.corrections],
  );

  const isControlled = externalShowDialog !== undefined;
  const isOpen = isControlled ? externalShowDialog : showDialog;

  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      setLoading(true);
      try {
        const [items, main, corrResults] = await Promise.all([
          getItems(user),
          getTransaction(user, checkoutTransaction.transaction_id),
          corrections.length > 0
            ? Promise.all(corrections.map((c) => getTransaction(user, c.transaction_id)))
            : Promise.resolve([]),
        ]);

        setItemNames(new Map((items as InventoryItem[]).map((i) => [i.id, i.name])));
        if (main?.value) setMainTransaction(main.value);
        if (Array.isArray(corrResults)) {
          setCorrectionTransactions(corrResults.filter((r) => r?.value).map((r) => r!.value!));
        }
      } catch (error) {
        console.error('Failed to load transaction details:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, checkoutTransaction.transaction_id, corrections, user]);

  const handleClose = () => {
    if (isControlled && onDialogClose) onDialogClose();
    else setShowDialog(false);
  };

  const handleEdit = (e: SyntheticEvent) => {
    e.preventDefault();
    handleClose();
    navigate('/checkout', {
      state: {
        editTransaction: checkoutTransaction,
        correctionItems: corrections,
      } satisfies EditTransactionState,
    });
  };

  if (!isControlled && corrections.length === 0) return null;

  const getItemName = (itemId: number) => itemNames.get(itemId) ?? `Item #${itemId}`;

  const renderItems = (items: Transaction['items'] | undefined) =>
    items?.map((item: Transaction['items'][number]) => (
      <Stack
        key={item.id}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ gap: 1 }}
      >
        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
          {getItemName(item.item_id)}
        </Typography>
            <Chip
          size="small"
          label={String(item.quantity)}
          sx={{
            backgroundColor: theme.palette.success.lighter,
            color: theme.palette.success.dark,
            fontSize: theme.typography.caption.fontSize,
            height: 22,
            minWidth: 44,
            px: 0.75,
          }}
        />
      </Stack>
    ));

  const renderCorrections = () =>
    correctionTransactions.map((txn, idx) => {
      const correction = corrections[idx];
      if (!correction) return null;

      const editor = userList?.find((u) => u.id === correction.user_id)?.name ?? `User ${correction.user_id}`;

      return (
        <Stack key={txn.transaction_id} gap={1}>
          {idx > 0 && <Divider />}
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {formatTransactionEditDate([correction], editor)}
          </Typography>
          <Stack gap={0.5}>
            {txn.items.length > 0 ? (
              txn.items.map((item) => {
                const qty = item.quantity;
                const isPositive = qty > 0;
                const bg = isPositive ? theme.palette.success.lighter : theme.palette.error.lighter;
                const color = isPositive ? theme.palette.success.dark : theme.palette.error.dark;
                

                return (
                  <Stack
                    key={`${txn.transaction_id}-${item.id}`}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ gap: 1 }}
                  >
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                      {getItemName(item.item_id)}
                    </Typography>
                    <Chip
                      size="small"
                      label={signNumber(qty)}
                      sx={{
                        backgroundColor: bg,
                        color: color,
                        fontSize: theme.typography.caption.fontSize,
                        height: 22,
                        minWidth: 44,
                        px: 0.75,
                      }}
                    />
                  </Stack>
                );
              })
            ) : (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                No item details
              </Typography>
            )}
          </Stack>
        </Stack>
      );
    });

  return (
    <>
      {!isControlled && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setShowDialog(true);
          }}
          sx={{
            textTransform: 'none',
            p: 0,
            justifyContent: 'flex-start',
            color: theme.palette.text.secondary,
            fontSize: theme.typography.caption.fontSize,
            '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
          }}
        >
          Open Details
        </Button>
      )}

      <DialogTemplate
        showDialog={isOpen}
        handleShowDialog={handleClose}
        title="Transaction Details"
        {...(checkoutTransaction.item_type === 'general' && {
          handleSubmit: handleEdit,
          submitButtonText: 'Edit',
        })}
      >
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <Stack gap={3} sx={{ mt: 2, maxHeight: '60vh', overflow: 'auto' }}>
            <Stack gap={1.5}>
              <Typography variant="subtitle2" sx={{ fontSize: theme.typography.body1.fontSize, color: theme.palette.text.primary }}>
                {checkoutTransaction.resident_name}
              </Typography>
              <Stack gap={0.5}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {checkoutTransaction.building_code} - {checkoutTransaction.building_name}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Unit {checkoutTransaction.unit_number}
                </Typography>
              </Stack>
            </Stack>

            {mainTransaction?.items && mainTransaction.items.length > 0 && (
              <>
                <Divider />
                <Stack gap={1.5}>
                  <Typography variant="caption" sx={{ fontSize: theme.typography.body1.fontSize, color: theme.palette.text.primary }}>
                    {withCount(mainTransaction.items.length, 'item')}
                  </Typography>
                  <Stack gap={1}>{renderItems(mainTransaction.items)}</Stack>
                </Stack>
              </>
            )}
            {correctionTransactions.length > 0 && (
              <>
                <Divider />
                <Stack gap={2}>
                  <Typography variant="caption" sx={{ fontSize: theme.typography.body1.fontSize, color: theme.palette.text.primary }}>
                    {withCount(correctionTransactions.length, 'edit')}
                  </Typography>
                  <Stack gap={1}>{renderCorrections()}</Stack>
                </Stack>
              </>
            )}
          </Stack>
        )}
      </DialogTemplate>
    </>
  );
};

export default TransactionDetails;
