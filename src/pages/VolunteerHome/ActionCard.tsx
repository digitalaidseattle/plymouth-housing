/**
 *  ActionCard.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// ==============================|| VOLUNTEER HOME - ACTION CARD ||============================== //

const CardButton = styled(ButtonBase)(({ theme }) => ({
  flex: 1,
  minHeight: 180,
  padding: theme.spacing(3),
  borderRadius: Number(theme.shape.borderRadius) * 4,
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  textAlign: 'left',
  gap: theme.spacing(3),
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  },
}));

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  subtitle,
  onClick,
}) => (
  <CardButton onClick={onClick}>
    {icon}
    <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" component="span">
        {title}
      </Typography>
      <Typography
        variant="body1"
        component="span"
        sx={{ color: 'text.secondary' }}
      >
        {subtitle}
      </Typography>
    </Box>
  </CardButton>
);

export default ActionCard;
