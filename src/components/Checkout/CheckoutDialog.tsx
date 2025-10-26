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
  ResidentInfo,
} from '../../types/interfaces';
import { UserContext } from '../contexts/UserContext';
import { processGeneralItems, processWelcomeBasket } from './CheckoutAPICalls';
import CategorySection from './CategorySection';

type CheckoutDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  checkoutItems: CategoryProps[];
  welcomeBasketData: CategoryProps[];
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
  activeSection: string;
  residentInfo: ResidentInfo;
  setResidentInfo: (residentInfo: ResidentInfo) => void;
  onError: (message: string) => void;
};

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  checkoutItems,
  welcomeBasketData,
  setCheckoutItems,
  removeItemFromCart,
  addItemToCart,
  selectedBuildingCode,
  setActiveSection,
  fetchData,
  onSuccess,
  activeSection,
  residentInfo,
  setResidentInfo,
  onError,
}) => {
  const { user, loggedInUserId } = useContext(UserContext);
  const [originalCheckoutItems, setOriginalCheckoutItems] = useState<
    CategoryProps[]
  >([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [allItems, setAllItems] = useState<CheckoutItemProp[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [categoryLimitErrors, setCategoryLimitErrors] = useState<
    CategoryProps[]
  >([]);
  const [showLimitConfirmation, setShowLimitConfirmation] = useState(false);

  const totalItemCount = allItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalItemLimitExceeded = totalItemCount > 10;
  const categoryLimitExceeded = categoryLimitErrors.length > 0;

  useEffect(() => {
    if (open) {
      setOriginalCheckoutItems([...checkoutItems]);
      setStatusMessage('');
      setAllItems(checkoutItems.flatMap((item) => item.items));

      const errors: CategoryProps[] = [];
      checkoutItems.forEach((category) => {
        if (category.categoryCount > category.checkout_limit) {
          errors.push(category);
        }
      });
      setCategoryLimitErrors(errors);
    }
  }, [open, checkoutItems]);

  const handleCancel = () => {
    setCheckoutItems(originalCheckoutItems);
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

      const welcomeBasketItemIds = welcomeBasketData.flatMap((basket) =>
        basket.items.map((item) => item.id),
      );
      const isWelcomeBasket = allItems.some((item) =>
        welcomeBasketItemIds.includes(item.id),
      );
      let data = null;
      if (isWelcomeBasket) {
        data = await processWelcomeBasket(
          user,
          loggedInUserId,
          allItems,
          residentInfo,
        );
      } else {
        data = await processGeneralItems(
          user,
          loggedInUserId,
          allItems,
          residentInfo,
        );
      }

      if (data.error) {
        const errorMessage =
          data.error.message || 'An unexpected error occurred during checkout';
        throw new Error(errorMessage);
      }

      const result = data.value[0];
      if (result.Status === 'Success') {
        setActiveSection('');
        setResidentInfo({
          id: 0,
          name: '',
          unit: { id: 0, unit_number: '' },
          building: { id: 0, code: '', name: '' },
        });
        fetchData();
        setStatusMessage('Transaction Successful');
        onClose();
        onSuccess();
      } else {
        const errorMessage =
          result.message || 'Checkout failed. Please try again.';
        throw new Error(errorMessage);
      }
    } catch (error) {
      let userFriendlyMessage = 'Checkout failed. Please try again.';

      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('cannot read properties of undefined')) {
          userFriendlyMessage =
            'There was a connection issue with the checkout system. Please try again in a moment.';
        } else if (
          errorMessage.includes('network') ||
          errorMessage.includes('fetch')
        ) {
          userFriendlyMessage =
            'Network connection issue. Please check your connection and try again.';
        } else if (errorMessage.includes('timeout')) {
          userFriendlyMessage = 'The request timed out. Please try again.';
        } else if (
          errorMessage.includes('500') ||
          errorMessage.includes('internal server error')
        ) {
          userFriendlyMessage =
            'Server error. Please try again in a moment or contact support.';
        } else if (
          error.message.includes('checkout limit') ||
          error.message.includes('limit exceeded')
        ) {
          userFriendlyMessage = error.message; // Keep specific business logic errors as-is
        } else if (error.message && error.message.trim() !== '') {
          userFriendlyMessage = error.message;
        }
      }

      onError(userFriendlyMessage);
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
          <Typography sx={{ fontSize: '1.5rem' }}>
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
          <Typography sx={{ fontSize: '1.5rem' }}>Checkout Summary</Typography>
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
                  activeSection={activeSection}
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
          <Button
            onClick={handleCancel}
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
        </DialogActions>
      </>
    );
  };

  return (
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
          width: { xs: '90%', s: '80%', md: '70%' },
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
  );
};
