import {
  Box,
  Typography,
  TextField,
  styled,
  IconButton,
  Tooltip,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from '@mui/material';
import { useContext, useState, useEffect } from 'react';
import { InventoryItem } from '../../types/interfaces.ts';
import SnackbarAlert from '../SnackbarAlert.tsx';
import { ENDPOINTS, API_HEADERS } from '../../types/constants.ts';
import { getRole, UserContext } from '../contexts/UserContext.ts';
import InfoIcon from '@mui/icons-material/Info';
import DialogTemplate from '../DialogTemplate.tsx';

type FormData = {
  newQuantity: number | null;
  comments?: string;
  howYouKnow?: string;
};

type AdjustQuantityModalProps = {
  showDialog: boolean;
  handleClose: () => void;
  fetchData: () => void;
  itemToEdit: InventoryItem | null;
  handleSnackbar: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      message: string;
      severity: 'success' | 'warning';
    }>
  >;
};

const AdjustQuantityModal = ({
  showDialog,
  handleClose,
  fetchData,
  itemToEdit,
  handleSnackbar,
}: AdjustQuantityModalProps) => {
  const { user, loggedInUserId } = useContext(UserContext);
  const [formData, setFormData] = useState<FormData>({
    newQuantity: null,
    comments: '',
    howYouKnow: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Generate a new transaction ID when the dialog opens
  useEffect(() => {
    if (showDialog) {
      setTransactionId(crypto.randomUUID());
    }
  }, [showDialog]);

  const DialogTitle = styled('h1')({
    fontSize: '1.25rem',
    fontWeight: '600',
    textTransform: 'capitalize',
    margin: '0',
  });

  const handleInputChange = (field: string, value: string | number) => {
    const parsedValue =
      field === 'newQuantity' && typeof value === 'string'
        ? value === ''
          ? null
          : Number(value)
        : value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: parsedValue,
    }));
  };

  const resetInputsHandler = () => {
    handleClose();
    setFormData({
      newQuantity: null,
      comments: '',
      howYouKnow: '',
    });
    setErrorMessage('');
    setIsSubmitting(false);
  };

  const updateItemHandler = async () => {
    if (!itemToEdit) {
      setErrorMessage('Invalid item');
      return;
    }
    if (loggedInUserId === null) {
      setErrorMessage('You must be signed in to update inventory.');
      return;
    }
    if (formData.newQuantity === null) {
      setErrorMessage('You must enter a number for the new quantity.');
      return;
    }
    // regex test to check for only whole numbers
    const rx = new RegExp(/^\d+$/);
    if (!rx.test(formData.newQuantity.toString())) {
      setErrorMessage(
        'The new total quantity must be a positive whole number.',
      );
      return;
    }
    if (!transactionId) {
      setErrorMessage('Transaction ID is missing. Please reopen dialog.');
      return;
    }
    setIsSubmitting(true);
    document.body.style.cursor = 'wait';
    try {
      const headers = { ...API_HEADERS, 'X-MS-API-ROLE': getRole(user) };
      const response = await fetch(ENDPOINTS.PROCESS_INVENTORY_RESET_QUANTITY, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: loggedInUserId,
          item_id: itemToEdit?.id,
          new_quantity: formData.newQuantity,
          additional_notes: JSON.stringify({
            comments: formData.comments,
            howYouKnow: formData.howYouKnow,
          }),
          new_transaction_id: transactionId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`,
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid JSON response from server');
      }

      const result = data?.value?.[0];

      if (!result) {
        throw new Error('Empty response from server.');
      }

      if (result.Status === 'Success') {
        fetchData();
        handleSnackbar({
          open: true,
          message: `${itemToEdit?.name} successfully updated to ${formData.newQuantity}.`,
          severity: 'success',
        });
        resetInputsHandler();
      } else if (
        result.Status === 'Error' &&
        result.ErrorCode === 'DUPLICATE_TRANSACTION'
      ) {
        setErrorMessage('This transaction has already been submitted.');
        // Close the dialog to generate a new transaction ID
        setTimeout(() => {
          resetInputsHandler();
        }, 2000); // Give user time to see the error message
      } else if (result.Status === 'Error') {
        throw new Error(result.message || 'Unknown error occurred');
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error updating the database:', error);
      setErrorMessage(`Error updating the database: ${error}`);
    } finally {
      setIsSubmitting(false);
      document.body.style.cursor = 'default';
    }
  };

  return (
    <DialogTemplate
      showDialog={showDialog}
      handleShowDialog={resetInputsHandler}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: '1rem',
          width: '100%',
          margin: 'auto',
          height: '100%',
        }}
      >
        <DialogTitle>Adjust {itemToEdit?.name} number</DialogTitle>

        <Box id="current-stock">
          <Typography sx={{ fontSize: '1rem' }}>
            Current stock: {itemToEdit?.quantity}
          </Typography>
        </Box>

        <Box id="add-item-quantity" sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Typography>New Total Quantity</Typography>
            <Tooltip title="Enter the updated number of items available. If the current stock is negative, don't worry, just input the correct new total. The system will automatically update the inventory.">
              <IconButton aria-label="Information about new quantity input">
                <InfoIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <TextField
              sx={{ textAlign: 'center', width: '100%' }}
              value={formData.newQuantity ?? ''}
              type="number"
              placeholder="Enter the updated quantity"
              onChange={(e) => handleInputChange('newQuantity', e.target.value)}
            ></TextField>
          </Box>
        </Box>

        <Box id="how-do-you-know-input">
          <Typography>How do you know this? (optional)</Typography>
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={formData.howYouKnow}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange(
                  'howYouKnow',
                  (e.target as HTMLInputElement).value,
                )
              }
            >
              <FormControlLabel
                value="counted"
                control={<Radio />}
                label="Counted"
              />
              <FormControlLabel
                value="estimated"
                control={<Radio />}
                label="Estimated"
              />
              <FormControlLabel
                value="told by someone"
                control={<Radio />}
                label="Told by someone"
              />
              <FormControlLabel
                value="correction"
                control={<Radio />}
                label="Correction"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box id="comments-input" sx={{ width: '100%' }}>
          <Typography>Comments (optional)</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <TextField
              sx={{ textAlign: 'center', width: '100%' }}
              value={formData.comments}
              type="text"
              placeholder="Add a reason or comment"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange(
                  'comments',
                  (e.target as HTMLInputElement).value,
                )
              }
            ></TextField>
          </Box>
        </Box>

        <Box
          id="modal-buttons"
          sx={{ display: 'flex', width: '100%', justifyContent: 'end' }}
        >
          <Button
            sx={{ mr: '20px', color: 'black' }}
            onClick={resetInputsHandler}
          >
            Cancel
          </Button>
          <Button
            sx={{ color: 'black' }}
            onClick={updateItemHandler}
            disabled={isSubmitting}
          >
            Submit
          </Button>
        </Box>
        {errorMessage.length > 0 ? (
          <SnackbarAlert
            open={true}
            onClose={() => setErrorMessage('')}
            severity={'error'}
          >
            {' '}
            {errorMessage}{' '}
          </SnackbarAlert>
        ) : null}
      </Box>
    </DialogTemplate>
  );
};

export default AdjustQuantityModal;
