import React, { useState, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { Box, TextField, Button, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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

const PinInputComponent: React.FC = () => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>, index: number) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      if (value && index < 3 && pinRefs.current[index + 1]) {
        pinRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement|HTMLDivElement>   , index: number) => {
    if (e.key === 'Backspace') {
      if (pin[index]) {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      } else if (index > 0) {
        pinRefs.current[index - 1]?.focus();
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
      }
    } else if (e.key === 'ArrowRight' && index < 3) {
      pinRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Box display="flex" alignItems="center">
        <Box display="flex" justifyContent="center" mb={2}>
          {pin.map((digit, index) => (
            <PinInput
              key={index}
              id={`pin-input-${index}`}
              variant="outlined"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputProps={{ maxLength: 1 }}
              type={showPassword ? 'text' : 'password'}
              inputRef={(el) => (pinRefs.current[index] = el)}
            />
          ))}
        </Box>
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
          edge="end"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </Box>
      <Button variant="contained" color="primary" style={{ marginTop: '20px' }}>
        Next
      </Button>
    </Box>
  );
};

export default PinInputComponent;
