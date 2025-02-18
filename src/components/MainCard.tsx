import { ReactNode, forwardRef } from 'react';

// material-ui
import PageHeading from './PageHeading';
import { Box } from '@mui/material';

// ==============================|| CUSTOM - MAIN CARD ||============================== //

export interface MainCardProp {
  title?: string | ReactNode;
  content?: boolean;
  children?: ReactNode;
}

const MainCard: React.FC<MainCardProp> = forwardRef(
  (
    {
      children,
      content = true,
      title,
    },
  ) => {

    return (
      <Box sx={{
        width: {sm: '100%', lg: '90%', xl: '80%'},
        margin: '0 auto'  
      }}>
        {title && (
          <PageHeading 
            title={title}/>
        )}
        {content && children}
        {!content && children}
      </Box>
    );
  },
);

export default MainCard;
