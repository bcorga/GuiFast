import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PayPalButton from '../components/PayPalButton';

export default function Checkout() {
  const router = useRouter();
  const { packageName, packagePrice } = router.query;

  // Estado para manejar la carga de los parámetros
  const [loading, setLoading] = useState(true);

  // Verifica si los parámetros se han recibido correctamente
  useEffect(() => {
    if (packageName && packagePrice) {
      setLoading(false);
    }
  }, [packageName, packagePrice]);

  // Si los parámetros no se han recibido, mostramos un mensaje de error
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!packageName || !packagePrice) {
    return <p>Error: No se recibieron los parámetros del paquete correctamente.</p>;
  }

  // Lógica para el pago con tarjeta
  const handleCardPayment = async () => {
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packageName,
        packagePrice,
      }),
    });
    const { url } = await res.json();
    window.location.href = url; // Redirige a Stripe
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Compra: {packageName}</h1>
      <p className="text-2xl mb-8">Precio: ${packagePrice}</p>

      <div className="mb-4">
        <button
          onClick={handleCardPayment}
          className="bg-blue-600 text-white px-6 py-3 rounded shadow-md hover:bg-blue-700 mb-4"
        >
          Pagar con Tarjeta (Visa/MasterCard)
        </button>
      </div>

      <h2 className="text-xl mb-4">O paga con PayPal:</h2>
      <PayPalButton amount={packagePrice} />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { packageName, packagePrice } = context.query;

  // Si no se reciben los parámetros necesarios, redirigimos a la página de productos
  if (!packageName || !packagePrice) {
    return {
      redirect: {
        destination: '/products',
        permanent: false,
      },
    };
  }

  return {
    props: { packageName, packagePrice },
  };
}
