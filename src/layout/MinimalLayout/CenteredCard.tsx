/**
 *  CenteredCard.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

// material-ui
import { Box } from '@mui/material';

// project import
import { ReactNode } from 'react';
import MainCard, { MainCardProp } from '../../components/MainCard';

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

const CenteredCard = (props: { children: ReactNode, other?: MainCardProp }) => (
  <MainCard
    sx={{
      maxWidth: { xs: 400, lg: 475 },
      margin: { xs: 2.5, md: 3 },
      '& > *': {
        flexGrow: 1,
        flexBasis: '50%'
      }
    }}
    content={false}
    {...props.other}
    border={false}
    boxShadow
  >
    <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>{props.children}</Box>
  </MainCard>
);

export default CenteredCard;
