import { useLocation } from 'react-router-dom';
import MainContainer from '../../components/MainContainer';
import CheckoutPage from './CheckoutPage';
import { CheckoutType, EditTransactionState } from '../../types/interfaces';

const CheckoutPageContainer = () => {
  const location = useLocation();
  const state = location.state as
    | {
        checkoutType?: CheckoutType;
        editTransaction?: EditTransactionState;
      }
    | undefined;

  const checkoutType = state?.checkoutType || 'general';
  const editTransaction = state?.editTransaction;

  const title = `Check out - ${checkoutType === 'general' ? 'General' : 'Welcome Basket'}`;

  return (
    <MainContainer title={title}>
      <CheckoutPage
        key={checkoutType}
        checkoutType={checkoutType}
        editTransaction={editTransaction}
      />
    </MainContainer>
  );
};

export default CheckoutPageContainer;
