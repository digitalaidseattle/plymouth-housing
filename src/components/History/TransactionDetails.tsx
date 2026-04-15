import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  SyntheticEvent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import {
  formatTransactionEditDate,
  formatTransactionDate,
} from './historyUtils';
import { getUserName } from '../../utils/transactionUtils';
import { signNumber } from '../../utils/textUtils';
import {
  computeEffectiveItems,
  getItemName,
  getItemQtyColor,
} from '../../utils/transactionUtils';

// TransactionItemCard

interface TransactionItemCardProps {
  itemName: string;
  quantity: number;
  includeSign?: boolean;
}

const TransactionItemCard: React.FC<TransactionItemCardProps> = ({
  itemName,
  quantity,
  includeSign = false,
}) => {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ gap: 1 }}
    >
      <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
        {itemName}
      </Typography>
      <Chip
        size="small"
        label={includeSign ? signNumber(quantity) : String(quantity)}
        sx={{
          backgroundColor: includeSign
            ? getItemQtyColor(quantity, theme.palette).bgColor
            : theme.palette.success.lighter,
          color: includeSign
            ? getItemQtyColor(quantity, theme.palette).textColor
            : theme.palette.success.dark,
          fontSize: theme.typography.caption.fontSize,
          height: 22,
          minWidth: 44,
          px: 0.75,
        }}
      />
    </Stack>
  );
};

// TransactionDetails Dialog

interface TransactionDetailsProps {
  checkoutTransaction: CheckoutTransaction;
  userList: User[] | null;
  showDialog: boolean;
  onClose: () => void;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  checkoutTransaction,
  userList,
  showDialog,
  onClose,
}) => {
  const theme = useTheme();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [mainTransaction, setMainTransaction] = useState<Transaction | null>(
    null,
  );
  const [correctionTransactions, setCorrectionTransactions] = useState<
    Transaction[]
  >([]);
  const [itemNames, setItemNames] = useState<Map<number, string>>(new Map());

  const corrections = useMemo(
    () => checkoutTransaction.corrections ?? [],
    [checkoutTransaction.corrections],
  );

  useEffect(() => {
    if (!showDialog) return;

    (async () => {
      setLoading(true);
      try {
        const [items, main, corrResults] = await Promise.all([
          getItems(user),
          getTransaction(user, checkoutTransaction.transaction_id),
          corrections.length > 0
            ? Promise.all(
                corrections.map((c) => getTransaction(user, c.transaction_id)),
              )
            : Promise.resolve([]),
        ]);

        setItemNames(
          new Map((items as InventoryItem[]).map((i) => [i.id, i.name])),
        );
        if (main?.value) setMainTransaction(main.value);
        if (Array.isArray(corrResults)) {
          setCorrectionTransactions(
            corrResults.filter((r) => r?.value).map((r) => r!.value!),
          );
        }
      } catch (error) {
        console.error('Failed to load transaction details:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [showDialog, checkoutTransaction.transaction_id, corrections, user]);

  const handleClose = () => {
    onClose();
  };

  const effectiveItems = useMemo(
    () =>
      computeEffectiveItems(mainTransaction, correctionTransactions, itemNames),
    [mainTransaction, correctionTransactions, itemNames],
  );

  const handleEdit = (e: SyntheticEvent) => {
    e.preventDefault();
    handleClose();

    const editTransactionState: EditTransactionState = {
      editTransaction: {
        ...checkoutTransaction,
        effectiveItems: effectiveItems,
      },
      correctionItems: corrections,
    };

    navigate('/checkout', {
      state: editTransactionState,
    });
  };

  return (
    <DialogTemplate
      showDialog={showDialog}
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
        <Stack
          gap={2}
          sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {/* Card 1: Resident Information */}
          <Card
            elevation={1}
            sx={{
              backgroundColor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.grey[200]}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { p: 2 } }}>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.primary, mb: 1 }}
              >
                {checkoutTransaction.resident_name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.primary }}
              >
                {checkoutTransaction.building_code} -{' '}
                {checkoutTransaction.building_name} -{' '}
                {checkoutTransaction.unit_number}
              </Typography>
            </CardContent>
          </Card>

          <Stack gap={2} sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {/* Card 2: Current Effective Items (only show if there are edits) */}
            {corrections.length > 0 && (
              <Card
                elevation={1}
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  border: `1px solid ${theme.palette.grey[200]}`,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1.5 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      Items
                    </Typography>
                    <Chip
                      size="small"
                      label={effectiveItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}
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
                  <Stack gap={0.75}>
                    {effectiveItems.length > 0 ? (
                      effectiveItems.map((item) => (
                        <TransactionItemCard
                          key={item.id}
                          itemName={item.name}
                          quantity={item.quantity}
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        None
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Card 3: History Log (edits stack + original) */}
            {(mainTransaction?.items?.length ?? 0) > 0 && (
              <Card
                elevation={1}
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  border: `1px solid ${theme.palette.grey[200]}`,
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { p: 2 } }}>
                  <Stack gap={1.5}>
                    <Stack gap={1.5}>
                      {correctionTransactions.length > 0 && (
                        <>
                          {correctionTransactions.map((txn, idx) => {
                            const correction = corrections[idx];
                            if (!correction) return null;
                            const editor = getUserName(
                              correction.user_id,
                              userList,
                            );

                            return (
                              <Stack key={txn.transaction_id} gap={0.75}>
                                {idx > 0 && <Divider sx={{ my: 0.5 }} />}
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    fontWeight: 500,
                                  }}
                                >
                                  {formatTransactionEditDate(
                                    [correction],
                                    editor,
                                    false,
                                  )}
                                </Typography>
                                <Stack gap={0.5}>
                                  {txn.items.length > 0 ? (
                                    txn.items.map((item) => (
                                      <TransactionItemCard
                                        key={`${txn.transaction_id}-${item.id}`}
                                        itemName={getItemName(
                                          item.item_id,
                                          itemNames,
                                        )}
                                        quantity={item.quantity}
                                        includeSign
                                      />
                                    ))
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: theme.palette.text.secondary,
                                      }}
                                    >
                                      No item details
                                    </Typography>
                                  )}
                                </Stack>
                              </Stack>
                            );
                          })}
                          <Divider sx={{ my: 0.5 }} />
                        </>
                      )}

                      <Stack gap={0.75}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                          }}
                        >
                          {formatTransactionDate(
                            mainTransaction?.transaction_date ||
                              checkoutTransaction.transaction_date,
                            mainTransaction
                              ? getUserName(mainTransaction.user_id, userList)
                              : undefined,
                          ).replace('Created ', '')}
                        </Typography>
                        <Stack gap={0.5}>
                          {mainTransaction?.items &&
                          mainTransaction.items.length > 0 ? (
                            mainTransaction.items.map((item) => (
                              <TransactionItemCard
                                key={item.id}
                                itemName={getItemName(item.item_id, itemNames)}
                                quantity={item.quantity}
                              />
                            ))
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              No item details
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Stack>
      )}
    </DialogTemplate>
  );
};

export default TransactionDetails;
