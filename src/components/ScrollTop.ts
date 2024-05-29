/**
 *  main.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ==============================|| NAVIGATION - SCROLL TO TOP ||============================== //

const ScrollTop = (props: { children: ReactNode }) => {
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return props.children || null;
};

export default ScrollTop;
