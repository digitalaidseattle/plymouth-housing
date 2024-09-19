import React, { useState, ChangeEvent, KeyboardEvent, useRef, useCallback } from 'react';
import { Box, TextField} from '@mui/material';
import { styled } from '@mui/system';
import SnackbarAlert from './SnackbarAlert';

const PinInput = styled(TextField)(({ }) => ({
  width: '50px',
  margin: '0 8px',
  textAlign: 'center',
  '& input': {
    textAlign: 'center',
    fontSize: '24px',
    padding: '10px',
  },
}));

const PinInputComponent: React.FC<{ onPinChange: (pin: string[]) => void }> = ({ onPinChange }) => {
  const [pin, setPin] = useState<string[]>(() => Array(4).fill(''));
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updatePin = useCallback((index: number, value: string) => {
    setPin((prevPin) => {
      const newPin = [...prevPin];
      newPin[index] = value;
      onPinChange(newPin);
      return newPin;
    });
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const value = e.target.value;
  
    if (!/^\d*$/.test(value)) {
      setOpenSnackbar(true);
      return;
    }
  
    if (value.length <= 1) {
      updatePin(index, value);
      setVisibleIndex(index);
  
      if (value && index < 3 && pinRefs.current[index + 1]) {
        pinRefs.current[index + 1]?.focus();
      }
  
      const timeout = setTimeout(() => {
        setVisibleIndex(null);
      }, 1000);
  
      return () => clearTimeout(timeout); 
    }
  }, [updatePin, onPinChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement | HTMLDivElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (pinRefs.current[index]?.value) {
        updatePin(index, '');
      } else if (index > 0) {
        pinRefs.current[index - 1]?.focus();
        updatePin(index - 1, '');
      }
    } else if (e.key === 'ArrowRight' && index < 3) {
      pinRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  }, [updatePin]);

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Box display="flex" alignItems="center">
        <Box display="flex" justifyContent="center" >
          {pin.map((digit, index) => (
            <PinInput
              key={`pin-input-${index}`}
              id={`pin-input-${index}`}
              variant="outlined"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputProps={{ maxLength: 1 }}
              type={visibleIndex === index ? 'text' : 'password'}
              inputRef={(el) => (pinRefs.current[index] = el)}
            />
          ))}
          <SnackbarAlert open={openSnackbar} onClose={handleSnackbarClose} severity="warning">
            Please enter only numbers for your PIN.
          </SnackbarAlert>
        </Box>
      </Box>
    </Box>
  );
};

export default PinInputComponent;