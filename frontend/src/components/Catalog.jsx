import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdSenseBlock from './AdSenseBlock';

import InfiniteCategoryCarousel from './InfiniteCategoryCarousel';

function Catalog({ products, categories, selectedCategory, onSelectCategory, onProductClick, loading }) {
  const [layoutCategories, setLayoutCategories] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroText, setHeroText] = useState('Elevando tus espacios a través de la esencia del diseño Japandi. Combinamos el minimalismo funcional escandinavo con la elegancia atemporal japonesa.');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/layout`)
      .then(res => res.json())
      .then(data => setLayoutCategories(data))
      .catch(err => console.error('Error fetching layout:', err));
      
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/hero`)
      .then(res => res.json())
      .then(data => {
        if (data && data.hero_text) {
          setHeroText(data.hero_text);
        }
      })
      .catch(err => console.error('Error fetching hero text:', err));
  }, []);

  useEffect(() => {
    if (layoutCategories.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % layoutCategories.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [layoutCategories]);

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const getPageData = () => {
    const startIndex = (currentPage - 1) * 16;
    return products.slice(startIndex, startIndex + 16);
  };

  const currentProducts = getPageData();
  const totalPages = Math.max(1, Math.ceil(products.length / 16));

  return (
    <>
      <main className="pt-16 pb-24 md:pb-0 px-container-margin-mobile md:px-container-margin-desktop max-w-[1440px] mx-auto min-h-screen">
        
        {/* Brand Hero Section */}
        <section className="mt-8 md:mt-16 mb-8 md:mb-16 flex flex-col items-center justify-center text-center px-4 animate-fade-in">
          <div className="mb-2 w-48 md:w-64 h-48 md:h-64 flex items-center justify-center">
            <img src="/images/logo/logo_completo_negro.png" alt="Royal Home" className="w-full h-full object-contain scale-[2]" />
          </div>
          <p className="font-body-md text-on-surface-variant max-w-xl text-[16px] md:text-[18px] leading-relaxed">
            {heroText}
          </p>
        </section>

        {/* Dynamic Category Grid (Replacing Hero) */}
        {layoutCategories.length > 0 && (
          <section className="mt-20 mb-0 md:mt-12 md:mb-16 md:px-0">
            {/* Mobile Carousel (hidden on md) */}
            <div className="block md:hidden relative w-full overflow-hidden rounded-xl">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {layoutCategories.map((cat, idx) => (
                  <div 
                    key={idx} 
                    className="w-full flex-shrink-0 cursor-pointer pb-6" 
                    onClick={() => {
                      onSelectCategory(cat.id);
                      document.getElementById('catalog-grid').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="w-full aspect-[16/9] relative rounded-xl overflow-hidden shadow-lg bg-surface-container-high">
                      {cat.imagen_url ? (
                        <img 
                          src={cat.imagen_url} 
                          alt={cat.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display-sm text-on-surface-variant/30 text-center px-4">
                          {cat.name}
                        </div>
                      )}
                      {cat.descuento_porcentaje > 0 && (
                        <div className="absolute top-4 -left-8 w-32 bg-error text-on-error text-center py-1 text-xs font-bold uppercase tracking-widest shadow-md z-10 -rotate-45 pointer-events-none">
                          -{cat.descuento_porcentaje}% OFF
                        </div>
                      )}
                    </div>
                    <h3 className="text-center text-on-surface mt-2 font-body-lg text-lg truncate px-1">
                      {cat.name}
                    </h3>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-2">
                {layoutCategories.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'bg-primary w-6' : 'bg-primary/30 w-1.5'}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Bento Grid (hidden on mobile) */}
            <div className="hidden md:flex flex-row gap-6">
              
              {(() => {
                const renderCategoryCard = (catIndex, isLarge) => {
                  const cat = layoutCategories[catIndex];
                  if (!cat) return null;
                  const aspectClass = isLarge ? "aspect-[16/9]" : "aspect-[4/3]";
                  return (
                    <div 
                      key={cat.id} 
                      onClick={() => {
                        onSelectCategory(cat.id);
                        document.getElementById('catalog-grid').scrollIntoView({ behavior: 'smooth' });
                      }} 
                      className={`flex flex-col group cursor-pointer w-full`}
                    >
                      <div className={`w-full ${aspectClass} overflow-hidden rounded-xl bg-surface-container-high transition-shadow group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] relative`}>
                        {cat.imagen_url ? (
                          <img 
                            src={cat.imagen_url} 
                            alt={cat.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-display-sm text-on-surface-variant/30 text-center px-4">
                            {cat.name}
                          </div>
                        )}
                        {cat.descuento_porcentaje > 0 && (
                          <div className="absolute top-4 -left-8 w-32 bg-error text-on-error text-center py-1 text-xs font-bold uppercase tracking-widest shadow-md z-10 -rotate-45 pointer-events-none">
                            -{cat.descuento_porcentaje}% OFF
                          </div>
                        )}
                      </div>
                      <h3 className={`text-center text-on-surface mt-3 truncate px-1 group-hover:text-primary transition-colors text-base font-body-lg leading-tight`}>
                        {cat.name}
                      </h3>
                    </div>
                  );
                };

                return (
                  <>
                    {/* Left Column (50%) */}
                    <div className="flex-1 flex flex-col gap-6">
                      {renderCategoryCard(0, true)}
                      <div className="grid grid-cols-2 gap-6">
                        {renderCategoryCard(3, false)}
                        {renderCategoryCard(4, false)}
                      </div>
                    </div>
                    {/* Right Column (50%) */}
                    <div className="flex-1 flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-6">
                        {renderCategoryCard(1, false)}
                        {renderCategoryCard(2, false)}
                      </div>
                      {renderCategoryCard(5, true)}
                    </div>
                  </>
                );
              })()}
              
            </div>
          </section>
        )}

        {/* Ad Placeholder (Top) */}
        <div className="w-full flex justify-center my-8 md:my-12">
          <div className="w-full max-w-[970px] min-h-[90px] md:min-h-[120px] bg-surface rounded flex items-center justify-center overflow-hidden">
            <AdSenseBlock slot="8250857236" />
          </div>
        </div>

        <InfiniteCategoryCarousel 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onSelectCategory={onSelectCategory} 
        />

        {/* Product Grid (Asymmetric Bento) */}
        {loading ? (
          <div className="py-24 text-center font-display-lg text-primary">Cargando colección...</div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center font-body-lg text-on-surface-variant">No se encontraron productos en esta categoría.</div>
        ) : (
          <div className="flex flex-col" id="catalog-grid">
            <div className="grid grid-cols-2 md:grid-cols-12 gap-y-8 gap-x-4 md:gap-y-16 md:gap-x-gutter lg:gap-x-8 pb-12">
              {currentProducts.map((product, index) => {
                let spanClass = "col-span-1 md:col-span-4";
              let aspectClass = "aspect-[4/5] md:aspect-[3/4]";
              let mtClass = "";
              
              if (index % 4 === 0) {
                spanClass = "col-span-1 md:col-span-8";
                aspectClass = "aspect-[4/5] md:aspect-[4/3]";
              } else if (index % 4 === 1) {
                spanClass = "col-span-1 md:col-span-4";
                aspectClass = "aspect-[4/5] md:aspect-[3/4]";
                mtClass = "md:mt-24";
              } else if (index % 4 === 2 || index % 4 === 3) {
                spanClass = "col-span-1 md:col-span-6";
                aspectClass = "aspect-[4/5] md:aspect-square";
              }

              return (
                <article key={product.id} className={`${spanClass} ${mtClass} group relative flex flex-col gap-2 md:gap-4 cursor-pointer`} onClick={() => onProductClick(product.id)}>
                  <div className={`relative w-full ${aspectClass} bg-surface-container-low overflow-hidden group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-shadow duration-500 rounded-xl`}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <button className="absolute bottom-3 right-3 md:bottom-6 md:right-6 w-8 h-8 md:w-12 md:h-12 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center text-primary shadow-sm hover:bg-white hover:scale-110 transition-all duration-300">
                      <span className="material-symbols-outlined text-[16px] md:text-[20px]" style={{fontVariationSettings: "'wght' 300"}}>arrow_forward</span>
                    </button>
                    {product.discount_percentage > 0 && (
                      <div className="absolute top-4 -left-8 w-32 bg-error text-on-error text-center py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-md z-10 -rotate-45 pointer-events-none">
                        -{product.discount_percentage}% OFF
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-left px-1 md:px-2">
                    <h3 className="font-body-md md:font-headline-sm text-body-md md:text-headline-sm mb-1 text-primary truncate">{product.name}</h3>
                    <p className="font-caption text-[9px] md:text-caption text-on-surface-variant mb-1 md:mb-2 uppercase tracking-widest truncate">{product.category}</p>
                    {product.discount_percentage > 0 ? (
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-through opacity-70">${Number(product.price).toLocaleString('es-CL')}</p>
                        <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-error font-bold">${Number(product.price_calculated).toLocaleString('es-CL')}</p>
                      </div>
                    ) : (
                      <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-primary">${Number(product.price).toLocaleString('es-CL')}</p>
                    )}
                  </div>
                </article>
              );
            })}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button 
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-label-md transition-colors ${currentPage === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant text-on-surface'}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        )}

          {/* Ad Placeholder (Middle) */}
          <div className="flex w-full justify-center my-8 md:my-16">
            <div className="w-full max-w-[970px] min-h-[90px] md:min-h-[250px] bg-surface rounded flex items-center justify-center overflow-hidden">
              <AdSenseBlock slot="8250857236" />
            </div>
          </div>
      </main>

    </>
  );
}

export default Catalog;
