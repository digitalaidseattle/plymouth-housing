
// third-party
// FIXME
// import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// ==============================|| ANIMATION BUTTON ||============================== //

export default function AnimateButton(props: { children: ReactNode, type?: string }) {
  switch (props.type ? props.type: 'scale') {
    case 'rotate': // only available in paid version
    case 'slide': // only available in paid version
    case 'scale': // only available in paid version
    default:
      return (
        <>
          {/* <motion.div whileHover={{ scale: 1 }} whileTap={{ scale: 0.9 }}> */}
          {props.children}
          {/* </motion.div> */}
        </>
      );
  }
}

