import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SyntheticEvent, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEditTransactionData } from '../../services/checkoutService';
import {
  CheckoutTransaction,
  CheckoutItemProp,
  User,
  EditTransactionState,
} from '../../types/interfaces';
import DialogTemplate from '../DialogTemplate';
import { UserContext } from '../contexts/UserContext';
import { formatTransactionDate } from './historyUtils';
import {
  getItemName,
  getItemQtyColor,
  getUserName,
} from '../../utils/transactionUtils';
import { signNumber } from '../../utils/textUtils';

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
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [editTransaction, setEditTransaction] =
    useState<EditTransactionState | null>(null);

  useEffect(() => {
    if (!showDialog) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getEditTransactionData(user, checkoutTransaction);
        setEditTransaction(data);
      } catch (error) {
        console.error('Failed to load transaction details:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [showDialog, checkoutTransaction, user]);

  const handleEdit = (e: SyntheticEvent) => {
    e.preventDefault();
    onClose();
    navigate('/checkout', {
      state: { editTransaction },
    });
  };

  const itemNames = editTransaction?.itemNames ?? new Map<number, string>();
  const effectiveItems = editTransaction?.effectiveItems ?? [];
  const originalItems = editTransaction?.originalTransaction?.items ?? [];

  const historyEntries: { tx: CheckoutTransaction; isCorrection: boolean }[] = editTransaction
    ? ([{ tx: editTransaction.originalTransaction as CheckoutTransaction, isCorrection: false }, ...(editTransaction.correctionTransactions ?? []).map((t) => ({ tx: t, isCorrection: true }))])
    : [{ tx: checkoutTransaction, isCorrection: false }];

  const sortedHistoryEntries = [...historyEntries].sort(
    (a, b) => new Date(b.tx.transaction_date).getTime() - new Date(a.tx.transaction_date).getTime(),
  );

  return (
    <DialogTemplate
      showDialog={showDialog}
      handleShowDialog={onClose}
      title="Transaction Details"
      {...(checkoutTransaction.item_type === 'general' && {
        handleSubmit: handleEdit,
        submitButtonText: 'Edit',
      })}
    >
      {loading ? (
        <Stack alignItems="center" id="transaction-details-loading" sx={{ py: 4 }}>
          <CircularProgress size={24} />
        </Stack>
      ) : (
        <Stack
          gap={2}
          sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {/* Card 1: Resident Information */}
          <Card
            sx={{
              backgroundColor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.grey[200]}`,
            }}
          >
            <CardContent sx={{ p: 2 }}>
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
            {/* Card 2: Current Effective Items */}
            <Card
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
                      (sum, item: CheckoutItemProp) => sum + item.quantity,
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

                {(editTransaction?.correctionTransactions?.length ?? 0) > 0 ? (
                  effectiveItems.length > 0 ? (
                    <Stack gap={0.75}>
                      {effectiveItems.map((item: CheckoutItemProp) => (
                        <TransactionItemCard
                          key={item.id}
                          itemName={item.name}
                          quantity={item.quantity}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      None
                    </Typography>
                  )
                ) : originalItems.length > 0 ? (
                  <Stack gap={0.75}>
                    {originalItems.map((item) => (
                      <TransactionItemCard
                        key={item.id}
                        itemName={getItemName(item.item_id, itemNames)}
                        quantity={item.quantity}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    None
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Card 3: History Log */}
            {originalItems.length > 0 && (
              <Accordion
                elevation={1}
                id="transaction-details-history-accordion"
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  border: `1px solid ${theme.palette.grey[200]}`,
                  '&:before': { display: 'none' },
                  borderRadius: 1,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon fontSize="small" />}
                  sx={{
                    minHeight: 40,
                    '& .MuiAccordionSummary-content': { my: 0.5 },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    History
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2, pt: 0, maxHeight: 240, overflowY: 'auto', pr: 1 }}>
                  <Stack gap={1}>
                    {sortedHistoryEntries.map(({ tx: historyTransaction, isCorrection }, index) => (
                      <Stack key={historyTransaction.transaction_id ?? index} gap={1}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                          }}
                        >
                          {formatTransactionDate(
                            historyTransaction.transaction_date || checkoutTransaction.transaction_date,
                            historyTransaction.user_id ? getUserName(historyTransaction.user_id, userList) : undefined,
                          ).replace('Created ', '')}
                        </Typography>
                        <Stack gap={0.5}>
                          {(historyTransaction.items ?? []).map((item) => (
                            <TransactionItemCard
                              key={item.id}
                              itemName={getItemName(item.item_id, itemNames)}
                              quantity={item.quantity}
                              includeSign={isCorrection}
                            />
                          ))}
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </Stack>
        </Stack>
      )}
    </DialogTemplate>
  );
};

export default TransactionDetails;
