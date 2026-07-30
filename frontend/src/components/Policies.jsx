import React from 'react';
import { useParams, Link } from 'react-router-dom';

const policyContent = {
  privacy: {
    title: 'Política de Privacidad',
    content: (
      <div className="space-y-6">
        <p>
          En <strong>Royal Homes</strong>, valoramos y respetamos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos tu información personal cuando visitas nuestro sitio web y utilizas nuestros servicios.
        </p>
        
        <h3 className="font-bold text-lg mt-6">1. Información que recopilamos</h3>
        <p>
          Podemos recopilar información personal que tú nos proporcionas directamente, como tu nombre, dirección de correo electrónico, número de teléfono y detalles de compra cuando te registras, realizas un pedido o te comunicas con nosotros.
        </p>

        <h3 className="font-bold text-lg mt-6">2. Uso de tu información</h3>
        <p>
          Utilizamos la información que recopilamos para procesar y gestionar tus pedidos, comunicarnos contigo sobre tu compra, responder a tus consultas y, si has dado tu consentimiento, enviarte información sobre nuestras ofertas y nuevos productos.
        </p>

        <h3 className="font-bold text-lg mt-6">3. Protección de tus datos</h3>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra el acceso no autorizado, la alteración, divulgación o destrucción. No vendemos ni compartimos tu información con terceros, excepto cuando sea estrictamente necesario para procesar tu pedido (por ejemplo, pasarelas de pago).
        </p>

        <h3 className="font-bold text-lg mt-6">4. Tus derechos</h3>
        <p>
          Tienes el derecho de acceder, corregir o solicitar la eliminación de tu información personal en cualquier momento. Si deseas ejercer estos derechos, por favor contáctanos a través de nuestros canales oficiales de atención al cliente.
        </p>
      </div>
    )
  },
  shipping: {
    title: 'Políticas de Compra y Retiro',
    content: (
      <div className="space-y-6">
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-6">
          <p className="font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            Importante: Solo operamos con retiro en tienda.
          </p>
          <p className="text-sm mt-2">
            Por el momento <strong>no realizamos despachos a domicilio ni envíos a regiones</strong>. Todas las compras realizadas a través de nuestra plataforma deben ser retiradas de forma presencial en nuestras instalaciones.
          </p>
        </div>

        <h3 className="font-bold text-lg mt-6">1. Proceso de Retiro</h3>
        <p>
          Una vez que tu compra haya sido confirmada y el producto se encuentre fabricado o separado de nuestro stock, nos pondremos en contacto contigo vía WhatsApp o correo electrónico para coordinar el día y horario de retiro.
        </p>
        <p>
          Por favor, no te acerques a retirar tu producto sin antes haber recibido la confirmación oficial de que tu pedido está listo.
        </p>

        <h3 className="font-bold text-lg mt-6">2. Requisitos para el Retiro</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Deberás presentar tu cédula de identidad original al momento del retiro.</li>
          <li>Es necesario presentar el comprobante de pago o el número de pedido (enviado a tu correo).</li>
          <li>Si enviaras a un tercero a retirar el producto, debes notificarnos previamente indicando el nombre completo y RUT de la persona autorizada.</li>
        </ul>

        <h3 className="font-bold text-lg mt-6">3. Responsabilidad durante el traslado</h3>
        <p>
          Al momento de realizar el retiro, te invitamos a revisar el producto para verificar que se encuentre en óptimas condiciones. Una vez que el producto sea entregado y salga de nuestras dependencias, <strong>Royal Homes no se hace responsable por daños sufridos durante el traslado o instalación</strong> por parte del cliente.
        </p>
        
        <h3 className="font-bold text-lg mt-6">4. Tiempos de Entrega</h3>
        <p>
          Nuestros muebles son fabricados con los más altos estándares de calidad. Si el producto adquirido es a pedido (fabricación), el tiempo estimado será informado al momento de tu compra. Para productos en stock, el retiro suele coordinarse dentro de los siguientes 2 a 5 días hábiles tras la confirmación del pago.
        </p>
      </div>
    )
  },
  care: {
    title: 'Guía de Cuidado de Muebles',
    content: (
      <div className="space-y-6">
        <p>
          Para mantener la elegancia y durabilidad de tus muebles <strong>Royal Homes</strong> de diseño Japandi, te recomendamos seguir estas instrucciones de cuidado:
        </p>

        <h3 className="font-bold text-lg mt-6">Maderas y Chapas</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Limpieza regular:</strong> Utiliza un paño suave, seco o ligeramente húmedo (sin empapar) en dirección a la veta de la madera. Seca inmediatamente con un paño limpio.</li>
          <li><strong>Evita el calor directo:</strong> Nunca coloques objetos calientes (como ollas o tazas) directamente sobre la madera. Usa siempre posavasos o individuales.</li>
          <li><strong>Sol y humedad:</strong> Evita la exposición directa y prolongada a la luz solar para prevenir la decoloración. Mantén los muebles alejados de fuentes directas de calor o humedad extrema.</li>
        </ul>

        <h3 className="font-bold text-lg mt-6">Telas y Tapizados</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Aspirado:</strong> Aspira regularmente con el accesorio de cepillo suave para evitar que el polvo se asiente en las fibras.</li>
          <li><strong>Manchas:</strong> Limpia los derrames inmediatamente secando (no frotando) con un paño limpio y absorbente. Para manchas más persistentes, consulta a un servicio de limpieza profesional de tapicería.</li>
        </ul>

        <h3 className="font-bold text-lg mt-6">Metales</h3>
        <p>
          Para las estructuras metálicas, utiliza un paño suave y seco. Si es necesario, emplea un paño ligeramente humedecido con agua y jabón neutro, secando inmediatamente para evitar la oxidación. No uses productos abrasivos.
        </p>
      </div>
    )
  }
};

export default function Policies() {
  const { type } = useParams();
  const currentPolicy = policyContent[type] || policyContent['privacy'];

  return (
    <div className="pt-24 pb-16 px-container-margin-mobile md:px-container-margin-desktop max-w-[800px] mx-auto min-h-screen">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md uppercase tracking-widest text-xs">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Volver a la Tienda
        </Link>
      </div>
      
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
        <h1 className="font-display-md text-2xl md:text-4xl text-primary mb-8 pb-6 border-b border-outline-variant/30 text-center md:text-left">
          {currentPolicy.title}
        </h1>
        
        <div className="font-body-md text-on-surface-variant leading-relaxed text-sm md:text-base">
          {currentPolicy.content}
        </div>
      </div>
    </div>
  );
}
