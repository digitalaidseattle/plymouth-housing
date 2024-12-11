import React from 'react'
import { CheckoutItem } from '../../types/interfaces';

const CheckoutFooter = ({checkoutItems}: CheckoutItem[]) => {
  return (
    <div>
      {checkoutItems.length > 0 && (
        <div
          style={{
            padding: '0 100px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            height: '100px',
            backgroundColor: '#C0C0C0',
          }}
        >
          <p>
            {checkoutItems.reduce(
              (accumulator, item) => accumulator + item.quantity,
              0,
            )}{' '}
            items selected
          </p>
          <Button
            variant="text"
            style={{ color: 'black', backgroundColor: 'white' }}
            onClick={() => setOpenSummary(true)}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}

export default CheckoutFooter;