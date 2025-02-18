import { ReactNode, forwardRef } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import PageHeading from './PageHeading';

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
      <>
        {/* card header and action */}
        {title && (
          <PageHeading 
            title={title}/>
        )}

        {/* card content */}
        {/* id is used to select container, to reset its scroll value in the checkout page */}
        {content && children}
        {!content && children}
      </>
    );
  },
);

export default MainCard;
