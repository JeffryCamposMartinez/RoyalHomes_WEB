import React from 'react';
import { useNavigate } from 'react-router-dom';

function ShoppingCart({ cart, products, removeFromCart, updateCartQuantity }) {
  const navigate = useNavigate();
  const [itemToDelete, setItemToDelete] = React.useState(null);
  
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return url; // Servido por frontend localmente (Vite)
    return `http://localhost:3001${url}`;
  };

  const getCalculatedPrice = (basePrice, discount) => {
    return discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
  };

  const cartItems = cart.map(item => {
    const latestProduct = products?.find(p => p.id === item.id);
    const discount = latestProduct?.discount_percentage || 0;
    const calcPrice = getCalculatedPrice(parseFloat(item.price), discount);
    return {
      ...item,
      latestProduct,
      discount,
      calcPrice,
      imageUrl: latestProduct ? latestProduct.image : item.image
    };
  });

  const totalOriginal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const total = cartItems.reduce((sum, item) => sum + (item.calcPrice * item.quantity), 0);
  const totalAhorro = totalOriginal - total;

  return (
    <div className="pt-24 pb-16 px-container-margin-mobile md:px-container-margin-desktop max-w-[1200px] mx-auto min-h-screen">
      <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-12 text-center">Tu Selección</h1>
      
      {cart.length === 0 ? (
        <div className="text-center bg-surface-container-low p-12 rounded-2xl max-w-[800px] mx-auto">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-4">shopping_bag</span>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">Tu carrito está vacío, como un lienzo en blanco.</p>
          <button 
            onClick={() => navigate('/')} 
            className="px-8 py-4 bg-primary text-on-primary rounded-full font-label-md text-label-md uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            Explorar el Estudio
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pb-24 lg:pb-0">
          {/* Left Column: Products */}
          <div className="flex-1 flex flex-col gap-3 md:gap-4">
            {cartItems.map((item, idx) => {
              return (
                <div key={idx} className="flex flex-row items-start md:items-center gap-4 p-3 md:p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.02)] relative">
                  <button 
                    onClick={() => setItemToDelete(idx)}
                    className="absolute top-2 right-2 md:static md:ml-auto text-error hover:opacity-70 p-1 md:p-2 rounded-full hover:bg-error-container transition-colors z-10"
                    title="Eliminar producto"
                  >
                    <span className="material-symbols-outlined text-[18px] md:text-[24px]">delete</span>
                  </button>

                  {item.imageUrl && (
                    <div className="relative shrink-0">
                      <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md bg-surface-container" />
                      {item.discount > 0 && (
                        <div className="absolute -top-2 -left-2 bg-error text-on-error px-1 md:px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest z-10">
                          -{item.discount}%
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1 flex flex-col justify-between min-h-[5rem] w-full pr-6 md:pr-0">
                    <div className="text-left">
                      <h3 className="font-headline-sm text-sm md:text-headline-sm text-primary mb-0.5 line-clamp-2 leading-tight">{item.name}</h3>
                      <p className="font-caption text-[10px] md:text-caption text-on-surface-variant uppercase tracking-widest truncate">{item.variant}</p>
                    </div>
                    
                    <div className="flex flex-row items-end justify-between w-full mt-2">
                      <div className="font-body-lg text-body-md md:text-body-lg text-primary font-medium text-left">
                        {item.discount > 0 ? (
                          <div className="flex flex-col">
                            <span className="font-body-sm text-[10px] md:text-xs line-through opacity-70 text-on-surface-variant">${Number(item.price * item.quantity).toLocaleString('es-CL')}</span>
                            <span className="text-error font-bold">${Number(item.calcPrice * item.quantity).toLocaleString('es-CL')}</span>
                          </div>
                        ) : (
                          <span className="font-bold">${Number(item.price * item.quantity).toLocaleString('es-CL')}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center border border-outline-variant/50 rounded-full px-1.5 py-0.5 md:px-2 md:py-1 bg-surface">
                        <button 
                          onClick={() => {
                            if (item.quantity === 1) {
                              setItemToDelete(idx);
                            } else {
                              updateCartQuantity(idx, -1);
                            }
                          }} 
                          className="text-on-surface-variant hover:text-primary p-0.5 md:p-1"
                        >
                          <span className="material-symbols-outlined text-[14px] md:text-[16px]">remove</span>
                        </button>
                        <span className="font-body-md w-6 md:w-8 text-center text-sm md:text-base">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(idx, 1)} className="text-on-surface-variant hover:text-primary p-0.5 md:p-1">
                          <span className="material-symbols-outlined text-[14px] md:text-[16px]">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[350px] shrink-0">
            {/* Mobile Sticky Bar (AliExpress Style) */}
            <div className="lg:hidden fixed bottom-[64px] left-0 right-0 bg-surface border-t border-outline-variant/30 px-4 py-3 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Total estimado</span>
                <span className="font-display-sm text-lg font-bold text-primary leading-none">${Math.round(total).toLocaleString('es-CL')}</span>
                {totalAhorro > 0 && <span className="text-[10px] text-error font-bold mt-0.5">Ahorras ${Math.round(totalAhorro).toLocaleString('es-CL')}</span>}
              </div>
              <button 
                onClick={() => navigate('/checkout')}
                className="px-6 py-3 bg-primary text-on-primary rounded-full font-label-md text-xs uppercase tracking-widest hover:bg-primary/90 shadow-md transition-all font-bold"
              >
                Continuar ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </button>
            </div>
            
            {/* Desktop Summary Card */}
            <div className="hidden lg:flex bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.02)] flex-col sticky top-28">
              <h2 className="font-display-md text-2xl text-primary mb-6 text-left">Resumen de Compra</h2>
              
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between items-center text-on-surface-variant font-body-md">
                  <span>Subtotal</span>
                  <span>${Math.round(totalOriginal).toLocaleString('es-CL')}</span>
                </div>
                {totalAhorro > 0 && (
                  <div className="flex justify-between items-center text-error font-body-md font-bold">
                    <span>Ahorro</span>
                    <span>-${Math.round(totalAhorro).toLocaleString('es-CL')}</span>
                  </div>
                )}
                <div className="border-t border-outline-variant/30 pt-4 flex justify-between items-end mt-2">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Total</span>
                  <span className="font-display-sm text-3xl text-primary">${Math.round(total).toLocaleString('es-CL')}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full px-8 py-4 bg-primary text-on-primary rounded-full font-label-md text-label-md uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-md text-center"
                >
                  Proceder al Pago
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full px-8 py-4 border border-outline-variant text-primary rounded-full font-label-md text-label-md uppercase tracking-widest hover:bg-surface-container-low transition-colors text-center"
                >
                  Seguir Explorando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Placeholder (Bottom) */}
      <div className="w-full flex justify-center mt-16 mb-4">
        <div className="w-full max-w-[970px] h-[90px] md:h-[250px] bg-surface border border-dashed border-outline-variant/50 rounded flex items-center justify-center opacity-60 select-none">
          <span className="font-caption text-caption text-on-surface-variant text-center px-4">Espacio reservado para anuncio (Google Ads)</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[32px]">delete_forever</span>
              </div>
              <h3 className="font-display-md text-2xl text-on-surface mb-2">¿Eliminar producto?</h3>
              <p className="font-body-md text-on-surface-variant mb-8">
                ¿Estás seguro que deseas quitar este producto de tu carrito?
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 border border-outline-variant rounded-full text-on-surface-variant font-label-md uppercase tracking-widest hover:bg-surface-variant transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    removeFromCart(itemToDelete);
                    setItemToDelete(null);
                  }}
                  className="flex-1 py-3 bg-error text-on-error rounded-full font-label-md uppercase tracking-widest hover:bg-error/90 transition-colors shadow-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingCart;
