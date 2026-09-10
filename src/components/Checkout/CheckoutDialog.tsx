/**
 *  CheckoutDialog.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  CategoryProps,
  CheckoutItemProp,
  EditTransactionState,
  ResidentInfo,
} from '../../types/interfaces';
import { WELCOME_BASKET_ITEMS, SETTINGS } from '../../types/constants';
import { UserContext } from '../contexts/UserContext';
import {
  processGeneralItems,
  processWelcomeBasket,
} from '../../services/checkoutService';
import { computeCartDeltas } from '../../utils/transactionUtils';
import CategorySection from './CategorySection';

type CheckoutDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (errorMessage?: string) => void;
  checkoutItems: CategoryProps[];
  removeItemFromCart: (itemId: number, categoryName: string) => void;
  addItemToCart: (
    item: CheckoutItemProp,
    quantity: number,
    category: string,
  ) => void;
  setCheckoutItems: (items: CategoryProps[]) => void;
  selectedBuildingCode: string;
  fetchData: () => void;
  residentInfo: ResidentInfo;
  setResidentInfo: (residentInfo: ResidentInfo) => void;
  onError: (message: string) => void;
  editTransaction?: EditTransactionState;
  onCancelEdits?: () => void;
};

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  checkoutItems,
  setCheckoutItems,
  removeItemFromCart,
  addItemToCart,
  selectedBuildingCode,
  fetchData,
  onSuccess,
  residentInfo,
  setResidentInfo,
  onError,
  editTransaction,
  onCancelEdits,
}) => {
  const { user, loggedInUserId } = useContext(UserContext);
  const isEditMode = !!editTransaction;
  const originalTransactionId =
    editTransaction?.originalTransaction?.transaction_id ?? null;
  const [originalCheckoutItems, setOriginalCheckoutItems] = useState<
    CategoryProps[]
  >([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const cartItems = useMemo(
    () => checkoutItems.flatMap((item) => item.items),
    [checkoutItems],
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const categoryLimitErrors = useMemo(
    () => checkoutItems.filter((c) => c.categoryCount > c.checkout_limit),
    [checkoutItems],
  );
  const [showLimitConfirmation, setShowLimitConfirmation] = useState(false);

  const totalItemCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  const totalItemLimitExceeded = totalItemCount > SETTINGS.checkout_item_limit;
  const categoryLimitExceeded = categoryLimitErrors.length > 0;
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Snapshot cart state once when dialog opens. checkoutItems is intentionally excluded
  useEffect(() => {
    if (open) {
      setOriginalCheckoutItems([...checkoutItems]);  
      setTransactionId(crypto.randomUUID());
      setStatusMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const hasChanges = isEditMode && computeCartDeltas(cartItems, editTransaction?.effectiveItems).length > 0;

  const handleCancel = () => {
    if (!isEditMode) {
      setCheckoutItems(originalCheckoutItems);
    }
    setStatusMessage('');
    onClose();
  };

  const handleConfirm = async (bypassWarning?: boolean) => {
    if (
      bypassWarning !== true &&
      (totalItemLimitExceeded || categoryLimitExceeded)
    ) {
      setShowLimitConfirmation(true);
      return;
    }
    setIsProcessing(true);
    document.body.style.cursor = 'wait';
    try {
      if (!loggedInUserId) {
        throw new Error(
          'No valid user (volunteer or admin) found. Cannot checkout.',
        );
      }

      if (!transactionId) {
        throw new Error('Transaction ID not created.');
      }

      // In edit mode, compute deltas: (cart qty − current state qty) per item.
      const effectiveItems = editTransaction?.effectiveItems ?? [];
      const effectiveItemsMap = new Map(
        effectiveItems.map((ei) => [ei.id, ei]),
      );
      const cartMap = new Map(cartItems.map((item) => [item.id, item]));
      let itemsToSubmit: CheckoutItemProp[];
      if (isEditMode) {
        const allItemIds = new Set([
          ...cartMap.keys(),
          ...effectiveItemsMap.keys(),
        ]);
        const deltas: CheckoutItemProp[] = [];
        allItemIds.forEach((id) => {
          const cartItem = cartMap.get(id);
          const delta =
            (cartItem?.quantity ?? 0) -
            (effectiveItemsMap.get(id)?.quantity ?? 0);
          if (delta !== 0) {
            deltas.push({
              id,
              name: cartItem?.name ?? '',
              description: cartItem?.description ?? '',
              quantity: delta,
              additional_notes:
                cartItem?.additional_notes ??
                effectiveItemsMap.get(id)?.additional_notes,
            });
          }
        });
        itemsToSubmit = deltas;
      } else {
        itemsToSubmit = cartItems;
      }

      // In edit mode, if no changes were made, close without creating a transaction
      if (isEditMode && itemsToSubmit.length === 0) {
        onClose();
        return;
      }
      // We find the sheet set explicitly here because cartItems may contain all basket items
      // when editing from history, so relying on array position would send the wrong item.
      const sheetSetIds: number[] = Object.values(WELCOME_BASKET_ITEMS);
      const isWelcomeBasket = cartItems.some((item) =>
        sheetSetIds.includes(item.id),
      );
      let data = null;
      if (isWelcomeBasket) {
        const sheetSetItem = cartItems.find((item) =>
          sheetSetIds.includes(item.id),
        );
        if (!sheetSetItem) {
          throw new Error('Please select a sheet set to continue.');
        }
        data = await processWelcomeBasket(
          transactionId,
          user,
          loggedInUserId,
          sheetSetItem,
          residentInfo,
          originalTransactionId,
        );
      } else {
        data = await processGeneralItems(
          transactionId,
          user,
          loggedInUserId,
          itemsToSubmit,
          residentInfo,
          originalTransactionId,
        );
      }

      // Validate response structure
      if (
        !data.value ||
        !Array.isArray(data.value) ||
        data.value.length === 0
      ) {
        throw new Error(
          'Invalid response format from server (missing result data)',
        );
      }

      const result = data.value[0];

      // Validate result has required fields
      if (!result || typeof result !== 'object') {
        throw new Error(
          'Invalid response format from server (malformed result)',
        );
      }

      if (result.Status === 'Success') {
        setResidentInfo({
          id: 0,
          name: '',
          unit: { id: 0, unit_number: '' },
          building: { id: 0, code: '', name: '' },
        });
        setCheckoutItems([]);
        fetchData();
        setStatusMessage('Transaction Successful');
        onClose();
        onSuccess();
      } else if (
        result.Status === 'Error' &&
        result.ErrorCode === 'DUPLICATE_TRANSACTION'
      ) {
        // Handle duplicate transaction - clear the cart and show success
        setResidentInfo({
          id: 0,
          name: '',
          unit: { id: 0, unit_number: '' },
          building: { id: 0, code: '', name: '' },
        });
        setCheckoutItems([]);
        fetchData();
        onClose();
        onSuccess('This transaction has already been submitted.');
        return;
      } else if (result.Status === 'Error') {
        const errorMessage =
          result.message ||
          'Checkout failed (server returned error with no message)';
        throw new Error(errorMessage);
      } else {
        // Unexpected status value
        throw new Error(
          `Unexpected response status: ${result.Status || 'undefined'}`,
        );
      }
    } catch (error) {
      let userFriendlyMessage = 'Checkout failed. Please try again.';
      // Every branch below assigns this, so there is no initializer to hold a
      // stale default; TS flags any future branch that forgets to set it.
      let errorCode: string;

      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('cannot read properties of undefined')) {
          errorCode = 'UNDEFINED_PROPERTY';
          userFriendlyMessage =
            'There was a connection issue with the checkout system. Please try again in a moment.';
        } else if (
          errorMessage.includes('network') ||
          errorMessage.includes('fetch')
        ) {
          errorCode = 'NETWORK_ERROR';
          userFriendlyMessage =
            'Network connection issue. Please check your connection and try again.';
        } else if (errorMessage.includes('timeout')) {
          errorCode = 'TIMEOUT';
          userFriendlyMessage = 'The request timed out. Please try again.';
        } else if (
          errorMessage.includes('500') ||
          errorMessage.includes('internal server error')
        ) {
          errorCode = 'SERVER_ERROR';
          userFriendlyMessage =
            'Server error. Please try again in a moment or contact support.';
        } else if (
          error.message.includes('checkout limit') ||
          error.message.includes('limit exceeded')
        ) {
          errorCode = 'LIMIT_EXCEEDED';
          userFriendlyMessage = error.message;
        } else if (error.message && error.message.trim() !== '') {
          errorCode = 'SPECIFIC_ERROR';
          userFriendlyMessage = error.message;
        } else {
          // This is the fallback case - log details for debugging
          errorCode = 'GENERIC_FALLBACK';
          console.error('Unhandled checkout error:', {
            errorType: error.constructor.name,
            message: error.message,
            stack: error.stack,
            transactionId: transactionId,
            itemCount: cartItems.length,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        // Non-Error object was thrown
        errorCode = 'NON_ERROR_THROWN';
        console.error('Non-Error thrown during checkout:', {
          error: error,
          errorType: typeof error,
          transactionId: transactionId,
          timestamp: new Date().toISOString(),
        });
      }

      // Add error code to message for user reporting (can be removed later)
      const messageWithCode = `${userFriendlyMessage} (Error: ${errorCode})`;
      onError(messageWithCode);
    } finally {
      setIsProcessing(false);
      document.body.style.cursor = 'default';
      setShowLimitConfirmation(false);
    }
  };

  const overLimitConfirmationContent = () => {
    return (
      <Stack
        spacing={3}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 1 }}
      >
        <DialogTitle sx={{ p: 0 }} id="customized-dialog-title" component="div">
          <Typography variant="h4" sx={{ m: 0 }}>
            {totalItemLimitExceeded && categoryLimitExceeded
              ? 'Over the usual limits'
              : totalItemLimitExceeded
                ? 'Over the usual total limit'
                : 'Over the usual category limit'}
          </Typography>
        </DialogTitle>

        <Stack spacing={1} sx={{ px: 0 }}>
          {totalItemLimitExceeded && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography>Total items:</Typography>
              <Typography>{totalItemCount} / 10</Typography>
            </Stack>
          )}

          {categoryLimitExceeded && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Typography>Categories:</Typography>
              <Stack spacing={0.5}>
                {categoryLimitErrors.map((c) => (
                  <Typography
                    key={c.id}
                  >{`${c.category}: ${c.categoryCount} / ${c.checkout_limit}`}</Typography>
                ))}
              </Stack>
            </Stack>
          )}

          <Typography>
            Please chat with a staff member before continuing.
          </Typography>
        </Stack>

        <DialogActions sx={{ marginTop: 'auto', px: 0 }}>
          <Button
            variant="text"
            onClick={() => setShowLimitConfirmation(false)}
            id="checkout-dialog-return-to-summary-btn"
          >
            Return to checkout summary
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleConfirm(true)}
            disabled={isProcessing}
            id="checkout-dialog-override-confirm-btn"
          >
            {isProcessing ? 'Working...' : 'Staff said it is OK'}
          </Button>
        </DialogActions>
      </Stack>
    );
  };

  const checkoutSummaryContent = () => {
    return (
      <Stack
        spacing={1}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 1 }}
      >
        {/* Dialog Title */}
        <DialogTitle sx={{ p: 0 }} id="customized-dialog-title" component="div">
          <Typography variant="h4" sx={{ m: 0 }}>
            Checkout Summary{isEditMode && ' (Editing)'}
          </Typography>
        </DialogTitle>

        {/* Resident Information */}
        <Stack>
          <Typography>
            <strong>Building or voucher code: </strong>
            {selectedBuildingCode}
          </Typography>
          <Typography>
            <strong>Unit number: </strong>
            {residentInfo.unit.unit_number}
          </Typography>
          <Typography>
            <strong>Resident name: </strong>
            {residentInfo.name}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography>
              <strong>Total items: </strong>
              {totalItemCount} / 10
            </Typography>
            {totalItemLimitExceeded && (
              <Alert severity="warning">Over the usual limit</Alert>
            )}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography>
              <strong>Categories: </strong>
              {checkoutItems.reduce((acc, category) => {
                return category.categoryCount > 0 ? acc + 1 : acc;
              }, 0)}{' '}
              total
            </Typography>
            {categoryLimitExceeded && (
              <Alert severity="warning">
                {categoryLimitErrors.map((c) => c.category).join(', ')} over the
                limit
              </Alert>
            )}
          </Stack>
        </Stack>

        {/* Limit Information */}
        <Alert severity="info">
          Usual limit for total and category items helps make sure everyone has
          enough. If a resident truly needs an extra, please chat with staff.
        </Alert>

        {/* Checkout Items */}
        <DialogContent
          dividers
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 0,
            height: '60vh',
            borderTop: 'none',
          }}
        >
          {checkoutItems.map((section: CategoryProps) => {
            if (section.categoryCount > 0) {
              return (
                <CategorySection
                  key={section.id}
                  category={section}
                  categoryCheckout={section}
                  addItemToCart={(item, quantity) => {
                    addItemToCart(item, quantity, section.category);
                  }}
                  removeItemFromCart={removeItemFromCart}
                  removeButton={true}
                />
              );
            }
          })}
        </DialogContent>

        {/* Status Message */}
        {statusMessage?.trim() ? (
          <DialogContent
            sx={{
              p: 1,
              textAlign: 'center',
            }}
          >
            <Typography>{statusMessage}</Typography>
          </DialogContent>
        ) : null}

        {/* Dialog Actions */}
        <DialogActions sx={{ px: 0 }}>
          {isEditMode ? (
            <>
              <Button
                variant="text"
                onClick={onCancelEdits}
                id="checkout-dialog-cancel-edit-btn"
              >
                Cancel
              </Button>
              <Button
                variant="text"
                onClick={handleCancel}
                id="checkout-dialog-add-item-btn"
              >
                Add item
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleConfirm()}
                disabled={isProcessing || !hasChanges}
                id="checkout-dialog-save-btn"
              >
                {isProcessing
                  ? 'Working...'
                  : hasChanges
                    ? 'Save changes'
                    : 'No changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="text"
                onClick={handleCancel}
                id="checkout-dialog-return-btn"
              >
                Return to checkout page
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleConfirm()}
                disabled={isProcessing}
                id="checkout-dialog-confirm-btn"
              >
                {isProcessing ? 'Working...' : 'Confirm'}
              </Button>
            </>
          )}
        </DialogActions>
      </Stack>
    );
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          width: { xs: '80vw', md: '50vw' },
          maxHeight: '90vh',
          borderRadius: '15px',
          py: 4,
          px: 6,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        },
      }}
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          pt: 2,
        }}
      >
        {isProcessing && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {showLimitConfirmation
          ? overLimitConfirmationContent()
          : checkoutSummaryContent()}
      </Box>
    </Dialog>
  );
};
