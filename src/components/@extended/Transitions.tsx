import { ReactNode, forwardRef } from 'react';

// material-ui
import { Box, Fade, Grow } from '@mui/material';

// ==============================|| TRANSITIONS ||============================== //
interface TransitionsProp {
  children: ReactNode,
  type? : string, // oneOf(['grow', 'fade', 'collapse', 'slide', 'zoom']),
  position?: string, // oneOf(['top-left', 'top-right', 'top', 'bottom-left', 'bottom-right', 'bottom'])
};
const Transitions: React.FC<TransitionsProp> = forwardRef(({ children, position, type, ...others }, ref) => {
  let positionSX = {
    transformOrigin: '0 0 0'
  };

  switch (position? position: 'top-left') {
    case 'top-right':
    case 'top':
    case 'bottom-left':
    case 'bottom-right':
    case 'bottom':
    case 'top-left':
    default:
      positionSX = {
        transformOrigin: '0 0 0'
      };
      break;
  }

  return (
    <Box ref={ref}>
      {(type ? type === 'grow' : true) && (
        <Grow {...others}>
          <Box sx={positionSX}>{children}</Box>
        </Grow>
      )}
      {(type ? type === 'fade' : false) && (
        <Fade
          {...others}
          timeout={{
            appear: 0,
            enter: 300,
            exit: 150
          }}
        >
          <Box sx={positionSX}>{children}</Box>
        </Fade>
      )}
    </Box>
  );
});



export default Transitions;
