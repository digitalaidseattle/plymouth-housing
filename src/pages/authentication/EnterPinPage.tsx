/**
 *  pages/authentication/EnterPinPage.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Box } from '@mui/material';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import PinInput from './PinInput';
import CenteredLayout from './CenteredLayout';
import SnackbarAlert from '../../components/SnackbarAlert';
import { UserContext } from '../../components/contexts/UserContext';
import { trackEvent, trackException } from '../../utils/appInsights';
import { verifyPin as verifyPinService } from '../../services/authService';
import { updateUser } from '../../services/userService';
import { useSnackbar } from '../../hooks/useSnackbar';

const EnterPinPage: React.FC = () => {
  const [pin, setPin] = useState<string[]>(() => Array(4).fill(''));
  const [pinAttempt, setPinAttempt] = useState<number>(0);
  const { snackbarState, showSnackbar, handleClose } = useSnackbar();
  const { loggedInUserId, user, activeVolunteers, setPinVerified } = useContext(UserContext);
  const navigate = useNavigate();

  const handlePinChange = useCallback((newPin: string[]) => {
    setPin(newPin);
  }, []);

  const isPinComplete = pin.every((p) => p !== '');

  useEffect(() => {
    setPin(Array(4).fill(''));  
    if (!loggedInUserId) {
      navigate('/pick-your-name');
    }
  }, [loggedInUserId, navigate]);

  const getVolunteerName = (id: number | null): string => {
    if (!id) return 'Unknown';
    return activeVolunteers.find((v) => v.id === id)?.name || 'Unknown';
  };

  const showSnackMessage = (
    message: string,
    severity: 'success' | 'warning',
  ) => {
    showSnackbar(message, severity);
  };

  const verifyPin = async (id: number, enteredPin: string) => {
    try {
      const data = await verifyPinService(user, id, enteredPin);

      // Validate response structure
      if (
        !data?.value ||
        !Array.isArray(data.value) ||
        data.value.length === 0
      ) {
        console.error('Invalid response format from PIN verification API:', {
          hasData: !!data,
          hasValue: !!(data && data.value),
          isArray: !!(data && data.value && Array.isArray(data.value)),
          arrayLength: data?.value?.length ?? 0,
          timestamp: new Date().toISOString(),
        });
        throw new Error('Invalid response format from PIN verification API');
      }

      const result = data.value[0];

      // Validate result has required properties
      if (typeof result.IsValid !== 'boolean') {
        console.error('PIN verification response missing IsValid field:', {
          result,
          timestamp: new Date().toISOString(),
        });
        throw new Error('PIN verification response missing IsValid field');
      }

      return result;
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Unknown error verifying PIN');

      // Check if this is an authentication/authorization error
      if (
        (err as Error & { status?: number }).status === 401 ||
        (err as Error & { status?: number }).status === 403
      ) {
        console.error(
          'Authentication error detected - Azure AD token may have expired',
        );
        showSnackMessage(
          'Your session has expired. Please log out and log back in.',
          'warning',
        );
        return null;
      }

      console.error('Error verifying PIN:', error);
      trackException(err, {
        component: 'EnterPinPage',
        action: 'verifyPin',
        volunteerId: id.toString(),
      });
      trackEvent('PIN_Submission', {
        volunteerId: id.toString(),
        volunteerName: getVolunteerName(id),
        success: false,
        errorMessage: err instanceof Error ? err.message : 'API error',
        component: 'EnterPinPage',
        action: 'pin_api_error',
      });
      showSnackMessage('Failed to verify PIN. Please try again.', 'warning');
      return null;
    }
  };

  const updateLastSignedIn = async (id: number) => {
    try {
      await updateUser(user, id, { last_signed_in: new Date().toISOString() });
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Unknown error updating last signed in');
      console.error('Error updating last signed in:', error);
      trackException(err, {
        component: 'EnterPinPage',
        action: 'updateLastSignedIn',
        volunteerId: id.toString(),
      });
    }
  };

  const handleNextClick = async () => {
    if (pin.every((p) => p !== '')) {
      const enteredPin = pin.join(''); // Combine array into a single string (e.g., '1234')
      let result = null;
      if (loggedInUserId !== null) {
        result = await verifyPin(loggedInUserId, enteredPin);
      } else {
        showSnackMessage(
          'Volunteer ID is missing. Please try again.',
          'warning',
        );
      }

      if (result?.IsValid) {
        trackEvent('PIN_Submission', {
          volunteerId: loggedInUserId?.toString() || 'unknown',
          volunteerName: getVolunteerName(loggedInUserId),
          success: true,
          component: 'EnterPinPage',
          action: 'pin_verified',
        });
        showSnackMessage('Login successful! Redirecting...', 'success');
        if (loggedInUserId !== null) {
          await updateLastSignedIn(loggedInUserId); // Update last signed-in date after successful login
        }
        setPinVerified(true);
        navigate('/volunteer-home');
      } else if (result) {
        trackEvent('PIN_Submission', {
          volunteerId: loggedInUserId?.toString() || 'unknown',
          volunteerName: getVolunteerName(loggedInUserId),
          success: false,
          errorMessage: result.ErrorMessage || 'Incorrect PIN',
          component: 'EnterPinPage',
          action: 'pin_failed',
        });
        showSnackMessage(
          `${getVolunteerName(loggedInUserId)}: ${result.ErrorMessage || 'Incorrect PIN. Please try again.'}`,
          'warning',
        );
        setPinAttempt((prev) => prev + 1);
      }
      // If result is null, verifyPin() already displayed an error message, so don't show another
    } else {
      showSnackMessage('Please enter your PIN before continuing.', 'warning');
    }
  };

  const handlePreviousClick = () => {
    navigate('/pick-your-name');
  };

  if (!loggedInUserId) {
    return null;
  }

  return (
    <MinimalWrapper>
      <CenteredLayout>
        <Box sx={{ maxWidth: '340px', width: '100%' }}>
          <Typography
            variant="h4"
            sx={{
              lineHeight: '50px',
              textAlign: 'left',
            }}
          >
            Welcome,{' '}
            <span id="volunteer-name">{getVolunteerName(loggedInUserId)}!</span>
          </Typography>

          <Typography
            variant="h4"
            sx={{
              lineHeight: '50px',
              marginBottom: 2,
              textAlign: 'left',
            }}
          >
            Enter your PIN
          </Typography>

          <Typography
            variant="body2"
            sx={{
              maxWidth: '100%',
              textAlign: 'left',
              marginBottom: 4,
              lineHeight: 1.5,
            }}
          >
            <strong>Forget your PIN?</strong> Let a staff member know
          </Typography>
          <Box sx={{ marginBottom: 4 }}>
            <PinInput
              key={`${loggedInUserId}-${pinAttempt}`}
              onPinChange={handlePinChange}
              onSubmit={handleNextClick}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleNextClick}
            disabled={!isPinComplete}
            sx={{ height: '56px' }}
          >
            Continue
          </Button>
          <Typography
            variant="body2"
            onClick={handlePreviousClick}
            sx={{
              cursor: 'pointer',
              textAlign: 'center',
              marginTop: 2,
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Back to the name selection
          </Typography>
        </Box>
        <SnackbarAlert
          open={snackbarState.open}
          onClose={handleClose}
          severity={snackbarState.severity}
        >
          {snackbarState.message}
        </SnackbarAlert>
      </CenteredLayout>
    </MinimalWrapper>
  );
};

export default EnterPinPage;

