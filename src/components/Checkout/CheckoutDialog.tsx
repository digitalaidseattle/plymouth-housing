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
  const [categoryLimitErrors, setCategoryLimitErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setOriginalCheckoutItems([...checkoutItems]);
      setStatusMessage('');
      setAllItems(checkoutItems.flatMap((item) => item.items));

      const errors: string[] = [];
      checkoutItems.forEach((category) => {
        if (category.categoryCount > category.checkout_limit) {
          errors.push(
            `${category.category}: ${category.categoryCount} items (limit: ${category.checkout_limit})`,
          );
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

  const handleConfirm = async () => {
    setIsProcessing(true);
    document.body.style.cursor = 'wait';
    try {
      if (!loggedInUserId) {
        throw new Error(
          'No valid user (volunteer or admin) found. Cannot checkout.',
        );
      }

      const newTransactionID = crypto.randomUUID();

      const welcomeBasketItemIds = welcomeBasketData.flatMap((basket) =>
        basket.items.map((item) => item.id),
      );
      const isWelcomeBasket = allItems.some((item) =>
        welcomeBasketItemIds.includes(item.id),
      );
      let data = null;
      if (isWelcomeBasket) {
        data = await processWelcomeBasket(
          newTransactionID,
          user,
          loggedInUserId,
          allItems,
          residentInfo,
        );
      } else {
        data = await processGeneralItems(
          newTransactionID,
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

        if (errorMessage.includes('transaction already exists')) {
          userFriendlyMessage = error.message;
        } else if (errorMessage.includes('cannot read properties of undefined')) {
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
          userFriendlyMessage = error.message;
        } else if (error.message && error.message.trim() !== '') {
          userFriendlyMessage = error.message;
        }
      }

      onError(userFriendlyMessage);
    } finally {
      setIsProcessing(false);
      document.body.style.cursor = 'default';
    }
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
          <Typography
            sx={{
              color:
                allItems.reduce((acc, item) => acc + item.quantity, 0) > 10
                  ? 'red'
                  : 'black',
            }}
          >
            <strong>Total Items Checked Out: </strong>
            {allItems.reduce((acc, item) => acc + item.quantity, 0)} / 10
            allowed
          </Typography>

          {/* Display category limit errors */}
          {categoryLimitErrors.length > 0 && (
            <Box
              sx={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
              }}
            >
              <Typography
                sx={{
                  color: '#c62828',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                }}
              >
                Category Limits Exceeded:
              </Typography>
              {categoryLimitErrors.map((error, index) => (
                <Typography
                  key={index}
                  sx={{ color: '#c62828', fontSize: '14px' }}
                >
                  • {error}
                </Typography>
              ))}
              <Typography
                sx={{
                  color: '#c62828',
                  fontSize: '12px',
                  marginTop: '5px',
                  fontStyle: 'italic',
                }}
              >
                Please remove items from the categories above to proceed with
                checkout.
              </Typography>
            </Box>
          )}
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
            onClick={handleConfirm}
            disabled={
              isProcessing ||
              allItems.reduce((acc, item) => acc + item.quantity, 0) > 10 ||
              categoryLimitErrors.length > 0
            }
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
      </Box>
    </Dialog>
  );
};
