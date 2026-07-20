import React, { useState, useEffect } from 'react';
import AdSenseBlock from './AdSenseBlock';

function ProductDetail({ product, onBack, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState(product?.variantes?.[0] || null);
  const [showSpecs, setShowSpecs] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSelectedVariant(product?.variantes?.[0] || null);
  }, [product?.id]);
  
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}${url}`;
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
    <div className="pt-16 pb-20 md:pt-24 px-4 md:px-container-margin-desktop max-w-[1440px] mx-auto min-h-screen md:h-auto flex flex-col">
      <button 
        onClick={onBack}
        className="flex items-center gap-1 md:gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-xs md:text-label-md uppercase tracking-widest mb-3 md:mb-12 shrink-0"
      >
        <span className="material-symbols-outlined text-[18px] md:text-[20px]">arrow_back</span>
        Volver al Estudio
      </button>

      <div className="flex flex-col lg:flex-row gap-3 md:gap-12 lg:gap-24 flex-1">
        {/* Imagen del producto */}
        <div className="flex-1 w-full bg-surface-container-low rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.03)] relative group shrink-0 aspect-square md:aspect-auto">
          <img src={getImageUrl(allImages[currentImageIndex])} alt={product.nombre} className="w-full h-full md:aspect-square lg:h-[600px] lg:aspect-auto object-cover transition-all duration-300" />
          
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
        <div className="flex-1 flex flex-col justify-start md:justify-center">
          <p className="font-caption text-[10px] md:text-caption text-on-surface-variant mb-1 md:mb-4 uppercase tracking-widest">{product.category}</p>
          <h1 className="font-display-lg text-2xl md:text-display-lg text-primary mb-2 md:mb-6 leading-tight">{product.name}</h1>
          <p className={`font-body-sm md:font-body-lg text-sm md:text-body-lg text-on-surface-variant mb-1 md:mb-4 leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-2'} md:line-clamp-none`}>{product.description}</p>
          <button 
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} 
            className="md:hidden text-primary font-label-md text-[10px] uppercase tracking-widest mb-3"
          >
            {isDescriptionExpanded ? 'Mostrar menos' : 'Mostrar más'}
          </button>
          {(selectedVariant?.especificaciones || product.specifications) && (
            <button onClick={() => setShowSpecs(true)} className="flex items-center gap-1 text-primary text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-8 hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-[16px]">info</span> Ver Especificaciones
            </button>
          )}
          
          <div className="mb-3 md:mb-10">
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h3 className="font-label-md text-xs md:text-label-md text-primary uppercase tracking-widest">Seleccionar Variante</h3>
            </div>
            <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-2 md:gap-4 pb-2 md:pb-0" style={{ scrollbarWidth: 'none' }}>

              {product.variantes && product.variantes.map(v => (
                <button 
                  key={v.id}
                  onClick={() => { setSelectedVariant(v); setCurrentImageIndex(0); }}
                  className={`p-2 md:p-4 border rounded-lg md:rounded-xl flex flex-col text-left shrink-0 min-w-[130px] md:min-w-0 transition-colors ${selectedVariant?.id === v.id ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant hover:border-primary bg-surface'}`}
                >
                  <span className="font-label-md text-xs md:text-label-md mb-0.5 md:mb-1 uppercase">{v.material}</span>
                  <span className="font-caption text-[10px] md:text-caption opacity-80">{v.acabado_color}</span>
                  <div className="mt-1 md:mt-2">
                    {discount > 0 ? (
                      <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        <span className="font-body-sm text-[10px] md:text-sm line-through opacity-70">${Number(v.precio_especifico).toLocaleString('es-CL')}</span>
                        <span className="font-body-md text-sm md:text-base font-bold">${Number(getCalculatedPrice(v.precio_especifico)).toLocaleString('es-CL')}</span>
                      </div>
                    ) : (
                      <span className="font-body-md text-sm md:text-base">${Number(v.precio_especifico).toLocaleString('es-CL')}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center md:items-end justify-between border-t border-outline-variant/30 pt-3 md:pt-8 mt-auto md:mt-0 mb-2 md:mb-8">
            <div>
              <p className="hidden md:block font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-2">Precio Total</p>
              {discount > 0 ? (
                <div className="flex flex-col gap-0 md:gap-1">
                  <p className="font-headline-sm text-xs md:text-lg text-on-surface-variant line-through opacity-70">
                    ${Number(currentPrice).toLocaleString('es-CL')}
                  </p>
                  <div className="flex items-center gap-2 md:gap-3">
                    <p className="font-display-lg-mobile text-xl md:text-display-lg-mobile text-error font-bold">
                      ${Number(currentCalculatedPrice).toLocaleString('es-CL')}
                    </p>
                    <span className="bg-error text-on-error px-1 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest">
                      -{discount}% OFF
                    </span>
                  </div>
                </div>
              ) : (
                <p className="font-display-lg-mobile text-xl md:text-display-lg-mobile text-primary">
                  ${Number(currentPrice).toLocaleString('es-CL')}
                </p>
              )}
            </div>
            <button 
              onClick={() => onAddToCart(product, selectedVariant)}
              className="px-5 py-3 md:px-8 md:py-4 rounded-full font-label-md text-xs md:text-label-md uppercase tracking-widest transition-all bg-primary text-on-primary hover:bg-primary/90 hover:scale-105 shadow-md"
            >
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>

      {/* Ad Placeholder (Bottom) */}
      <div className="hidden md:flex w-full justify-center mt-16 mb-4">
        <div className="w-full max-w-[970px] min-h-[90px] md:min-h-[250px] bg-surface rounded flex items-center justify-center overflow-hidden">
          <AdSenseBlock slot="8250857236" />
        </div>
      </div>

      {/* Specifications Modal */}
      {showSpecs && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowSpecs(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-primary">Especificaciones</h3>
              <button onClick={() => setShowSpecs(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto whitespace-pre-wrap font-body-md text-on-surface-variant leading-relaxed">
              {selectedVariant?.especificaciones || product.specifications}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
