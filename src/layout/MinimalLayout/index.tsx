/**
 *  index.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { UserContext } from '../../components/contexts/UserContext';
import { useKeepAlive } from '../../hooks/useKeepAlive';

const MinimalLayout = () => {
  const { user } = useContext(UserContext);

  // Keep backend warm during business hours to prevent cold starts during PIN entry
  useKeepAlive({ user, enabled: true });

  return (
    <>
      <Outlet />
    </>
  );
};

export default MinimalLayout;
