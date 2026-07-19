import React, { useState, useEffect } from 'react';

function ProductDetail({ product, onBack, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [product?.id]);
  
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://localhost:3001${url}`;
  };

  const allImages = [];
  
  if (selectedVariant && (selectedVariant.imagen_variante || (selectedVariant.galeria && selectedVariant.galeria.length > 0) || (typeof selectedVariant.galeria === 'string' && selectedVariant.galeria.length > 2))) {
    if (selectedVariant.imagen_variante) allImages.push(selectedVariant.imagen_variante);
    let galExtra = [];
    try {
      galExtra = typeof selectedVariant.galeria === 'string' ? JSON.parse(selectedVariant.galeria) : (selectedVariant.galeria || []);
    } catch(e) {}
    if (Array.isArray(galExtra)) {
      allImages.push(...galExtra);
    }
  } else {
    if (product.imagen_base || product.image) allImages.push(product.imagen_base || product.image);
    let galeriaExtra = [];
    try {
      galeriaExtra = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : (product.gallery || []);
    } catch(e) {}
    if (Array.isArray(galeriaExtra)) {
      allImages.push(...galeriaExtra);
    }
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const discount = product.discount_percentage || 0;
  const getCalculatedPrice = (basePrice) => {
    return discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
  };

  const currentPrice = selectedVariant ? selectedVariant.precio_especifico : product.price;
  const currentCalculatedPrice = getCalculatedPrice(currentPrice);

  return (
    <div className="pt-20 pb-16 md:pt-24 px-container-margin-mobile md:px-container-margin-desktop max-w-[1440px] mx-auto min-h-screen">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md uppercase tracking-widest mb-6 md:mb-12"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Volver al Estudio
      </button>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-12 lg:gap-24">
        {/* Imagen del producto */}
        <div className="flex-1 w-full bg-surface-container-low rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.03)] relative group">
          <img src={getImageUrl(allImages[currentImageIndex])} alt={product.nombre} className="w-full aspect-[4/3] md:aspect-square lg:h-[600px] lg:aspect-auto object-cover transition-all duration-300" />
          
          {selectedVariant && (
            <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-outline-variant/20 flex items-center z-10 pointer-events-none">
              <span className="font-label-md text-[10px] md:text-xs text-primary uppercase tracking-widest">{selectedVariant.material} / {selectedVariant.acabado_color}</span>
            </div>
          )}
          
          {allImages.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface/80 rounded-full flex items-center justify-center text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm hover:bg-surface"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button 
                onClick={() => setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface/80 rounded-full flex items-center justify-center text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm hover:bg-surface"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                {allImages.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-primary w-6' : 'bg-primary/30 w-2 hover:bg-primary/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info del producto */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="font-caption text-caption text-on-surface-variant mb-2 md:mb-4 uppercase tracking-widest">{product.category}</p>
          <h1 className="font-display-lg text-4xl md:text-display-lg text-primary mb-4 md:mb-6 leading-tight">{product.name}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 md:mb-8 leading-relaxed">{product.description}</p>
          
          <div className="mb-10">
            <h3 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4">Seleccionar Variante</h3>
            <div className="grid grid-cols-2 gap-4">
              {product.variantes && product.variantes.map(v => (
                <button 
                  key={v.id}
                  onClick={() => { setSelectedVariant(v); setCurrentImageIndex(0); }}
                  className={`p-4 border rounded-xl flex flex-col text-left transition-colors ${selectedVariant?.id === v.id ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant hover:border-primary bg-surface'}`}
                >
                  <span className="font-label-md text-label-md mb-1 uppercase">{v.material}</span>
                  <span className="font-caption text-caption opacity-80">{v.acabado_color}</span>
                  <div className="mt-2">
                    {discount > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="font-body-sm line-through opacity-70">${Number(v.precio_especifico).toLocaleString('es-CL')}</span>
                        <span className="font-body-md font-bold">${Number(getCalculatedPrice(v.precio_especifico)).toLocaleString('es-CL')}</span>
                      </div>
                    ) : (
                      <span className="font-body-md">${Number(v.precio_especifico).toLocaleString('es-CL')}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between border-t border-outline-variant/30 pt-8 mb-8">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-2">Precio Total</p>
              {discount > 0 ? (
                <div className="flex flex-col gap-1">
                  <p className="font-headline-sm text-on-surface-variant line-through opacity-70">
                    ${Number(currentPrice).toLocaleString('es-CL')}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="font-display-lg-mobile text-display-lg-mobile text-error font-bold">
                      ${Number(currentCalculatedPrice).toLocaleString('es-CL')}
                    </p>
                    <span className="bg-error text-on-error px-2 py-1 rounded text-xs font-bold uppercase tracking-widest">
                      -{discount}% OFF
                    </span>
                  </div>
                </div>
              ) : (
                <p className="font-display-lg-mobile text-display-lg-mobile text-primary">
                  ${Number(currentPrice).toLocaleString('es-CL')}
                </p>
              )}
            </div>
            <button 
              onClick={() => onAddToCart(product, selectedVariant)}
              disabled={!selectedVariant}
              className={`px-8 py-4 rounded-full font-label-md text-label-md uppercase tracking-widest transition-all ${!selectedVariant ? 'bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary/90 hover:scale-105 shadow-md'}`}
            >
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>

      {/* Ad Placeholder (Bottom) */}
      <div className="w-full flex justify-center mt-16 mb-4">
        <div className="w-full max-w-[970px] h-[90px] md:h-[250px] bg-surface border border-dashed border-outline-variant/50 rounded flex items-center justify-center opacity-60 select-none">
          <span className="font-caption text-caption text-on-surface-variant text-center px-4">Espacio reservado para anuncio (Google Ads)</span>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
