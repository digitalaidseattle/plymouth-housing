/**
 *  ActionCard.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// ==============================|| VOLUNTEER HOME - ACTION CARD ||============================== //

// A Button reshaped into a card: MUI centres its content on a single row, the
// design wants an icon above left-aligned text. minHeight, not a fixed height,
// so both cards stay level when one subtitle wraps.
const CardButton = styled(Button)(({ theme }) => ({
  flex: 1,
  minHeight: 180,
  padding: theme.spacing(3),
  borderRadius: 16,
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  textAlign: 'left',
  gap: theme.spacing(3),
}));

const ActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}> = ({ icon, title, subtitle, onClick }) => (
  <CardButton variant="contained" color="secondary" onClick={onClick}>
    {icon}
    <Box>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="body1" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  </CardButton>
);

export default ActionCard;
