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
        {/* card header and action */}
        {title && (
          <PageHeading 
            title={title}/>
        )}

        {/* card content */}
        {/* id is used to select container, to reset its scroll value in the checkout page */}
        {content && children}
        {!content && children}
      </Box>
    );
  },
);

export default MainCard;
