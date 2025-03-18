import { ForwardedRef, ReactNode, forwardRef } from 'react';

// material-ui
import PageHeading from './PageHeading';
import { Box } from '@mui/material';

// ==============================|| CUSTOM - MAIN CARD ||============================== //

export interface MainContainerProp {
  title?: string | ReactNode;
  content?: boolean;
  children?: ReactNode;
}

const MainContainer: React.FC<MainContainerProp> = forwardRef(
  (
    {
      children,
      content = true,
      title,
    },
    ref: ForwardedRef<HTMLDivElement>
  ) => {

    return (
      <Box 
        ref={ref}
        sx={{
        padding: '1rem',
        minHeight: '100vh',
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

export default MainContainer;
