import React, { useContext, useEffect, useState } from 'react';
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
    active: string,
  ) => void;
  setCheckoutItems: (items: CategoryProps[]) => void;
  selectedBuildingCode: string;
  setActiveSection: (s: string) => void;
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
  setActiveSection,
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
  const [cartItems, setCartItems] = useState<CheckoutItemProp[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [categoryLimitErrors, setCategoryLimitErrors] = useState<
    CategoryProps[]
  >([]);
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

  useEffect(() => {
    if (open) {
      setCartItems(checkoutItems.flatMap((item) => item.items));
      const errors: CategoryProps[] = checkoutItems.filter(
        (category) => category.categoryCount > category.checkout_limit,
      );
      setCategoryLimitErrors(errors);
    }
  }, [open, checkoutItems]);

  const computeDeltas = () => {
    const cartMap = new Map<number, CheckoutItemProp>();
    cartItems.forEach((item) => cartMap.set(item.id, item));
    const effectiveMap = new Map<number, { quantity: number }>();
    (editTransaction?.effectiveItems ?? []).forEach((ei) =>
      effectiveMap.set(ei.id, { quantity: ei.quantity }),
    );
    const allIds = new Set([
      ...cartItems.map((i) => i.id),
      ...(editTransaction?.effectiveItems ?? []).map((ei) => ei.id),
    ]);
    return Array.from(allIds).filter(
      (id) =>
        (cartMap.get(id)?.quantity ?? 0) !==
        (effectiveMap.get(id)?.quantity ?? 0),
    ).length;
  };

  const hasChanges = isEditMode && computeDeltas() > 0;

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
      const effectiveMap = new Map<
        number,
        { quantity: number; additional_notes: string }
      >();
      effectiveItems.forEach((ei) => {
        effectiveMap.set(ei.id, {
          quantity: ei.quantity,
          additional_notes: ei.additional_notes ?? '',
        });
      });

      const itemsToSubmit: CheckoutItemProp[] = isEditMode
        ? (() => {
            const cartMap = new Map<number, CheckoutItemProp>();
            cartItems.forEach((item) => cartMap.set(item.id, item));
            const allItemIds = new Set([
              ...cartItems.map((i) => i.id),
              ...effectiveItems.map((ei) => ei.id),
            ]);
            const deltas: CheckoutItemProp[] = [];
            allItemIds.forEach((itemId) => {
              const cartItem = cartMap.get(itemId);
              const cartQty = cartItem?.quantity ?? 0;
              const effectiveQty = effectiveMap.get(itemId)?.quantity ?? 0;
              const delta = cartQty - effectiveQty;
              if (delta !== 0) {
                deltas.push({
                  id: itemId,
                  name: cartItem?.name ?? '',
                  description: cartItem?.description ?? '',
                  quantity: delta,
                  additional_notes:
                    cartItem?.additional_notes ??
                    effectiveMap.get(itemId)?.additional_notes,
                });
              }
            });
            return deltas;
          })()
        : cartItems;

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
        setActiveSection('');
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
        setActiveSection('');
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
      let errorCode = 'UNKNOWN';

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
      <>
        <DialogTitle
          sx={{ padding: '20px 0px 0px 0px', marginBottom: '1rem' }}
          id="customized-dialog-title"
        >
          <Typography variant="h4">
            {totalItemLimitExceeded && categoryLimitExceeded
              ? 'Over the usual limits'
              : totalItemLimitExceeded
                ? 'Over the usual total limit'
                : 'Over the usual category limit'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {totalItemLimitExceeded && (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <Typography>Total Items:</Typography>
              <Typography>{totalItemCount} / 10</Typography>
            </Box>
          )}
          {categoryLimitExceeded && (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <Typography>Categories:</Typography>
              <Box>
                {categoryLimitErrors.map((c) => (
                  <Typography
                    key={c.id}
                  >{`${c.category}: ${c.categoryCount} / ${c.checkout_limit}`}</Typography>
                ))}
              </Box>
            </Box>
          )}
          <Typography sx={{ marginTop: '1rem' }}>
            Please chat with a staff member before continuing.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ marginTop: 'auto' }}>
          <Button
            onClick={() => setShowLimitConfirmation(false)}
            id="checkout-dialog-return-to-summary-btn"
            sx={{
              color: 'black',
              textDecoration: 'underline',
            }}
          >
            Return to Checkout Summary
          </Button>
          <Button
            onClick={() => handleConfirm(true)}
            disabled={isProcessing}
            id="checkout-dialog-override-confirm-btn"
            sx={{
              color: 'black',
              backgroundColor: '#F2F2F2',
              '&.Mui-disabled': {
                backgroundColor: '#E0E0E0',
                color: '#757575',
              },
            }}
          >
            {isProcessing ? 'Working...' : 'Staff said it is ok'}
          </Button>
        </DialogActions>
      </>
    );
  };

  const checkoutSummaryContent = () => {
    return (
      <>
        <DialogTitle
          sx={{ padding: '20px 0px 0px 0px' }}
          id="customized-dialog-title"
        >
          <Typography variant="h4">Checkout Summary{isEditMode && ' (Editing)'}</Typography>
        </DialogTitle>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '15px',
            marginBottom: '30px',
          }}
        >
          <Typography>
            <strong>Building code: </strong>
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

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>
              <strong>Total Items: </strong>
              {totalItemCount} / 10
            </Typography>
            {totalItemLimitExceeded && (
              <Alert severity="warning">Over the usual limit</Alert>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          </Box>

          <Alert severity="info" sx={{ marginY: '1rem' }}>
            Usual limit for total and category items helps make sure everyone
            has enough. If a resident truly needs an extra, please chat with
            staff.
          </Alert>
        </Box>
        <DialogContent
          dividers
          sx={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 20px',
            height: '40vh',
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
                    addItemToCart(
                      item,
                      quantity,
                      section.category,
                      section.category,
                    );
                  }}
                  removeItemFromCart={removeItemFromCart}
                  removeButton={true}
                  disabled={false}
                  activeSection=""
                />
              );
            }
          })}
        </DialogContent>
        <DialogContent
          sx={{
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <Typography>{statusMessage}</Typography>
        </DialogContent>
        <DialogActions sx={{ marginTop: 'auto' }}>
          {isEditMode ? (
            <>
              <Button
                onClick={onCancelEdits}
                id="checkout-dialog-cancel-edit-btn"
                sx={{
                  color: 'black',
                  textDecoration: 'underline',
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCancel}
                id="checkout-dialog-add-item-btn"
                sx={{
                  color: 'black',
                }}
              >
                Add Item
              </Button>
              <Button
                onClick={() => handleConfirm()}
                disabled={isProcessing || !hasChanges}
                id="checkout-dialog-save-btn"
                sx={{
                  color: 'black',
                  backgroundColor: '#F2F2F2',
                  '&.Mui-disabled': {
                    backgroundColor: '#E0E0E0',
                    color: '#757575',
                  },
                }}
              >
                {isProcessing ? 'Working...' : hasChanges ? 'Save Changes' : 'No Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleCancel}
                id="checkout-dialog-return-btn"
                sx={{
                  color: 'black',
                  textDecoration: 'underline',
                }}
              >
                Return to Checkout Page
              </Button>
              <Button
                onClick={() => handleConfirm()}
                disabled={isProcessing}
                id="checkout-dialog-confirm-btn"
                sx={{
                  color: 'black',
                  backgroundColor: '#F2F2F2',
                  '&.Mui-disabled': {
                    backgroundColor: '#E0E0E0',
                    color: '#757575',
                  },
                }}
              >
                {isProcessing ? 'Working...' : 'Confirm'}
              </Button>
            </>
          )}
        </DialogActions>
      </>
    );
  };

  return (
    <>
      <Dialog
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '80vw', md: '65vw' },
            maxHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            borderRadius: '15px',
          },
        }}
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <Box
          sx={{
            width: { xs: '90%', sm: '80%', md: '70%' },
            paddingTop: '20px',
            height: '100%',
            position: 'relative',
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
    </>
  );
};
