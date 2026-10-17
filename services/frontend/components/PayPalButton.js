import { useEffect } from 'react';

export default function PayPalButton({ amount }) {
  useEffect(() => {
    if (window.paypal) {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount,
                },
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            alert(`Pago completado por ${details.payer.name.given_name}`);
          });
        },
        onError: (err) => {
          console.error('Error en el pago:', err);
        },
      }).render('#paypal-button-container');
    }
  }, []);

  return <div id="paypal-button-container"></div>;
}