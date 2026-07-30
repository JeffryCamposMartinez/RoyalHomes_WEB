import React, { useRef, useEffect, useState } from 'react';

export default function InfiniteCategoryCarousel({ categories, selectedCategory, onSelectCategory }) {
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const isHovered = useRef(false);
  const isDraggingRef = useRef(false);

  // We duplicate the items 3 times for the infinite effect.
  const duplicatedItems = [...categories, ...categories, ...categories];

  // Global mouse up to handle releasing drag outside the container
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      isDraggingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let exactScrollLeft = 0;

    // Wait for render to get accurate dimensions
    const handleInitialScroll = () => {
        // Set initial scroll to the start of the SECOND block (the middle one)
        const blockWidth = container.scrollWidth / 3;
        container.scrollLeft = blockWidth;
        exactScrollLeft = blockWidth;
    };
    
    setTimeout(handleInitialScroll, 100);

    let animationId;
    let lastTime = 0;
    const speed = 0.04; // pixels per millisecond (approx 40px per second)

    const scrollLoop = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      const blockWidth = container.scrollWidth / 3;
      if (blockWidth === 0) {
        animationId = requestAnimationFrame(scrollLoop);
        return; // Not fully rendered yet
      }

      // Auto scroll only if not hovered and not dragging
      if (!isHovered.current && !isDraggingRef.current) {
        exactScrollLeft += speed * deltaTime;
        
        // Infinite loop logic
        if (exactScrollLeft >= blockWidth * 2) {
          exactScrollLeft -= blockWidth;
        } else if (exactScrollLeft <= 0) {
          exactScrollLeft += blockWidth;
        }
        
        container.scrollLeft = exactScrollLeft;
      } else {
        // When dragging or hovered, keep exactScrollLeft synced with actual scroll
        exactScrollLeft = container.scrollLeft;
        
        // Infinite loop logic during drag
        if (container.scrollLeft >= blockWidth * 2) {
          container.scrollLeft -= blockWidth;
          exactScrollLeft -= blockWidth;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += blockWidth;
          exactScrollLeft += blockWidth;
        }
      }

      animationId = requestAnimationFrame(scrollLoop);
    };

    animationId = requestAnimationFrame(scrollLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [categories]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    isHovered.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll-fast
    scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleMouseEnter = () => {
    isHovered.current = true;
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll-fast
    scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  return (
    <div className="relative w-full mb-12" id="catalog-grid">
      <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg font-light mb-8 text-primary text-center">
        Nuestras Categorías
      </h2>
      
      {/* 
        We use a calculated negative right margin to let the carousel bleed exactly to the right edge of the screen,
        while keeping the left side perfectly aligned with the main container.
      */}
      <div 
        className="flex max-w-full -mr-[calc(50vw-50%+20px)] md:-mr-[calc(50vw-50%+80px)]"
      >
        
        <div 
          onClick={() => onSelectCategory(null)}
          className={`relative flex-none w-[110px] h-[150px] md:w-[240px] md:h-[320px] rounded-2xl overflow-hidden group cursor-pointer mr-3 md:mr-5 shrink-0 flex items-center justify-center transition-all duration-300 ${!selectedCategory ? 'ring-2 ring-primary ring-offset-[3px] ring-offset-surface bg-primary text-on-primary shadow-md scale-100' : 'bg-surface-variant/30 text-primary opacity-80 hover:opacity-100 hover:scale-[1.02]'}`}
        >
          <h3 className="font-display-lg text-lg md:text-3xl font-light tracking-wide pointer-events-none transition-transform duration-700 group-hover:scale-110">
            Todos
          </h3>
        </div>

        {/* Scrolling Carousel */}
        <div 
          ref={scrollContainerRef}
          className={`flex overflow-x-hidden gap-3 md:gap-4 pb-6 flex-1 cursor-grab touch-pan-y ${isDragging ? 'cursor-grabbing select-none' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedItems.map((cat, index) => {
            return (
              <div 
                key={`${cat.id}-${index}`}
                onClick={(e) => { 
                  // If dragged more than 10 pixels, ignore the click
                  const moved = Math.abs(scrollContainerRef.current.scrollLeft - scrollLeftPos);
                  if (moved < 10) {
                    onSelectCategory(cat.id);
                  }
                }}
                onMouseUp={(e) => {
                  setIsDragging(false);
                  isDraggingRef.current = false;
                }}
                onTouchEnd={(e) => {
                  setIsDragging(false);
                  isDraggingRef.current = false;
                }}
                className={`relative flex-none shrink-0 w-[110px] h-[150px] md:w-[240px] md:h-[320px] rounded-2xl overflow-hidden group pointer-events-auto cursor-pointer transition-all duration-300 ${selectedCategory === cat.id ? 'ring-2 ring-primary ring-offset-[3px] ring-offset-surface scale-100 shadow-md z-10' : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'}`}
              >
                <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110 pointer-events-none">
                  {cat.imagen_url || cat.image ? (
                    <img 
                      src={cat.imagen_url || cat.image}
                      alt={cat.name} 
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-high flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">image</span>
                    </div>
                  )}
                </div>
                
                {/* Smooth Elegant Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                
                <h3 className="absolute bottom-3 md:bottom-5 left-0 right-0 px-2 text-center text-white font-display-lg text-[14px] md:text-2xl font-light tracking-wide pointer-events-none leading-tight drop-shadow-lg">
                  {cat.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
