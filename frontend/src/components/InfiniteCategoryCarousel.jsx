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
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
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

  return (
    <div className="relative w-full overflow-hidden mb-12" id="catalog-grid">
      <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg font-light mb-8 text-primary text-center">
        Nuestras Categorías
      </h2>
      
      {/* 
        We use negative margins on mobile so it can bleed to the edges, 
        and flex wrapper to put the static 'Todos' next to the infinite carousel 
      */}
      <div className="flex px-4 -mx-4 md:px-0 md:mx-0 max-w-full">
        
        <div 
          onClick={(e) => { if(!isDragging) onSelectCategory(null); }}
          className="relative flex-none w-[110px] h-[140px] md:w-[240px] md:h-[320px] rounded-sm overflow-hidden group cursor-pointer mr-3 md:mr-4 shrink-0 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className={`absolute inset-0 border-[3px] transition-colors pointer-events-none ${!selectedCategory ? 'border-primary' : 'border-transparent'}`}></div>
          <h3 className="text-primary font-display-lg text-lg md:text-3xl font-light tracking-wide pointer-events-none transition-transform duration-700 group-hover:scale-110">
            Todos
          </h3>
        </div>

        {/* Scrolling Carousel */}
        <div 
          ref={scrollContainerRef}
          className={`flex overflow-x-hidden gap-3 md:gap-4 pb-6 flex-1 cursor-grab ${isDragging ? 'cursor-grabbing select-none' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedItems.map((cat, index) => {
            return (
              <div 
                key={`${cat.id}-${index}`}
                onClick={(e) => { 
                  // If dragged more than 10 pixels, ignore the click
                  const moved = Math.abs((e.pageX - scrollContainerRef.current.offsetLeft) - startX);
                  if (moved < 10) {
                    onSelectCategory(cat.id);
                  }
                }}
                onMouseUp={(e) => {
                  setIsDragging(false);
                  isDraggingRef.current = false;
                }}
                className="relative flex-none shrink-0 min-w-[110px] w-[110px] h-[140px] md:min-w-[240px] md:w-[240px] md:h-[320px] rounded-sm overflow-hidden group pointer-events-auto"
              >
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 pointer-events-none">
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
                <div className={`absolute inset-0 border-[3px] transition-colors pointer-events-none ${selectedCategory === cat.id ? 'border-primary' : 'border-transparent'}`}></div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                <h3 className="absolute bottom-2 left-2 md:bottom-4 md:left-4 text-white font-display-lg text-sm md:text-xl font-light tracking-wide pointer-events-none">
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
