import { useLocation } from 'react-router-dom';
import MainContainer from '../../components/MainContainer';
import CheckoutPage from './CheckoutPage';

const CheckoutPageContainer = () => {
  const location = useLocation();
  const checkoutType =
    (location.state as { checkoutType?: 'general' | 'welcomeBasket' })
      ?.checkoutType || 'general';
  const title = `Check out - ${checkoutType === 'general' ? 'General' : 'Welcome Basket'}`;

  return (
    <MainContainer title={title}>
      <CheckoutPage checkoutType={checkoutType} />
    </MainContainer>
  );
};

export default CheckoutPageContainer;
