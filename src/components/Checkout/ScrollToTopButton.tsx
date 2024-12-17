import React, { useState, useEffect } from 'react';
import { Button, Box } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

interface ScrollToTopButtonProps {
  showAfter?: number; // Optional: how many pixels to scroll before showing the button
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ showAfter = 300 }) => {
  const [visible, setVisible] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > showAfter) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToTop = () => {
    const element = document.getElementById('top'); // Add 'top' as the target id
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    visible && (
      <Box
        sx={{
          position: 'fixed',
          bottom: '120px',
          right: '40px',
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={scrollToTop}
          sx={{ borderRadius: '50%', minWidth: '50px', height: '50px' }}
        >
          <KeyboardArrowUp />
        </Button>
      </Box>
    )
  );
};

export default ScrollToTopButton;
