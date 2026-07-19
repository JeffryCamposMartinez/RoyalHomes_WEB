import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';

export default function StoreLayoutManager({ user }) {
  const { showAlert } = useAlert();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [layout, setLayout] = useState([
    { slot_index: 1, categoria_id: '', imagen_url: '' },
    { slot_index: 2, categoria_id: '', imagen_url: '' },
    { slot_index: 3, categoria_id: '', imagen_url: '' },
    { slot_index: 4, categoria_id: '', imagen_url: '' },
    { slot_index: 5, categoria_id: '', imagen_url: '' },
    { slot_index: 6, categoria_id: '', imagen_url: '' },
  ]);
  const [heroText, setHeroText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFolder, setImageFolder] = useState('uploads');

  // Drag and Drop & Touch State
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catsRes, layoutRes, heroRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/categories`),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/layout`, {
            headers: { 'Authorization': `Bearer ${user.accessToken}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/hero`)
        ]);
        const catsData = await catsRes.json();
        const layoutData = await layoutRes.json();
        const heroData = await heroRes.json();
        
        setCategories(catsData);
        if (heroData && heroData.hero_text) {
          setHeroText(heroData.hero_text);
        }
        if (heroData && heroData.footer_text) {
          setFooterText(heroData.footer_text);
        }
        
        if (layoutData && layoutData.length > 0) {
          setLayout(prev => prev.map(slot => {
            const found = layoutData.find(l => l.slot_index === slot.slot_index);
            return found ? { 
              ...slot, 
              categoria_id: found.categoria_id || '',
              imagen_url: found.layout_imagen_url || '',
              descuento_porcentaje: found.descuento_porcentaje || 0
            } : slot;
          }));
        }
      } catch (err) {
        console.error(err);
        showAlert('Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}/api/upload/images?folder=${imageFolder}`);
        const data = await res.json();
        setImages(data);
      } catch (err) {
        console.error('Error fetching images:', err);
      }
    };
    fetchImages();
  }, [imageFolder]);

  const handleSlotCategoryChange = (slotIndex, catId) => {
    setLayout(prev => prev.map(slot => 
      slot.slot_index === slotIndex ? { ...slot, categoria_id: catId } : slot
    ));
  };

  const handleSlotDiscountChange = (slotIndex, value) => {
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0) num = 0;
    if (num > 100) num = 100;
    setLayout(prev => prev.map(slot => 
      slot.slot_index === slotIndex ? { ...slot, descuento_porcentaje: num } : slot
    ));
  };

  const handleSlotImageChange = (slotIndex, imgUrl) => {
    setLayout(prev => prev.map(slot => 
      slot.slot_index === slotIndex ? { ...slot, imagen_url: imgUrl } : slot
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/layout`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}` 
        },
        body: JSON.stringify(layout.map(l => ({
          slot_index: l.slot_index,
          categoria_id: l.categoria_id ? parseInt(l.categoria_id) : null,
          imagen_url: l.imagen_url || null,
          descuento_porcentaje: l.descuento_porcentaje || 0
        })))
      });
      
      const resHero = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/hero`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}` 
        },
        body: JSON.stringify({ hero_text: heroText, footer_text: footerText })
      });

      if (res.ok && resHero.ok) {
        showAlert('Diseño de tienda guardado exitosamente', 'success');
      } else {
        showAlert('Error al guardar diseño', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}/api/upload?folder=${imageFolder}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.accessToken}`
          },
          body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      });

      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(data => data.url);
      
      setImages(prev => [...newUrls, ...prev]);
      showAlert(`${newUrls.length} imagen(es) subida(s) correctamente`, 'success');
    } catch (err) {
      console.error(err);
      showAlert('Error al subir algunas imágenes', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) return <div className="py-10 text-center text-on-surface-variant font-label-md">Cargando diseño...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-primary">Diseño Inicio (Portada)</h3>
          <p className="text-on-surface-variant text-body-sm mt-1">Configura el mensaje de bienvenida y arrastra imágenes para el catálogo.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors font-label-md text-label-md uppercase tracking-widest disabled:opacity-50 w-full md:w-auto shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {saving ? 'Guardando...' : 'Guardar Diseño'}
        </button>
      </div>

      <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 mb-8 shadow-sm">
        <label className="block font-label-md text-label-md text-primary mb-2">
          Mensaje de Bienvenida (Hero Banner)
        </label>
        <textarea
          value={heroText}
          onChange={(e) => setHeroText(e.target.value)}
          className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-xl p-4 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          rows="3"
          placeholder="Escribe el texto de bienvenida que verán tus clientes al entrar a la tienda..."
        />
        <p className="text-on-surface-variant/70 text-body-sm mt-2">
          Este texto aparecerá en tamaño grande debajo del logo principal en la página de inicio.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left: Layout Visualizer */}
        <div className="flex-1 min-w-0 bg-surface-container-lowest p-2 md:p-6 rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
          {/* Always use 2 columns to simulate true masonry view exactly on mobile */}
          <div className="flex flex-row gap-2 md:gap-4 bg-surface p-2 md:p-4 rounded-xl border border-outline-variant/20 relative min-w-0 w-full overflow-hidden">
            
            {/* Mobile Selection Hint overlay */}
            {selectedImage && (
              <div className="md:hidden absolute -top-8 left-0 right-0 text-center animate-in fade-in slide-in-from-bottom-2">
                <span className="bg-primary text-on-primary text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-md">
                  ¡Ahora toca un recuadro!
                </span>
              </div>
            )}
            
            {/* Helper function to render a slot */}
            {(() => {
              const renderSlot = (slotIndex, isLarge) => {
                const slot = layout.find(s => s.slot_index === slotIndex);
                if (!slot) return null;
                const aspectClass = isLarge ? "aspect-[16/9]" : "aspect-[4/3]";
                const selectedCat = categories.find(c => String(c.id) === String(slot.categoria_id));
                const isHovered = hoveredSlot === slot.slot_index;
                
                let displayImage = slot.imagen_url;
                let isPreviewing = false;
                if (isHovered && selectedImage) {
                  displayImage = selectedImage;
                  isPreviewing = true;
                }

                return (
                  <div key={slot.slot_index} className="flex flex-col gap-1 md:gap-2 relative group w-full">
                    <div 
                      className={`w-full ${aspectClass} bg-surface-container-high rounded-xl flex items-center justify-center overflow-hidden border-2 transition-all relative cursor-pointer md:cursor-default ${isHovered || (selectedImage && !displayImage) ? 'border-primary scale-[1.02] shadow-lg md:border-dashed' : 'border-dashed border-outline-variant/40 hover:border-primary/50'}`}
                      onClick={() => {
                        if (selectedImage) {
                          handleSlotImageChange(slot.slot_index, selectedImage);
                          setSelectedImage(null);
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault(); 
                        setHoveredSlot(slot.slot_index);
                      }}
                      onDragLeave={() => setHoveredSlot(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (selectedImage) {
                          handleSlotImageChange(slot.slot_index, selectedImage);
                        }
                        setHoveredSlot(null);
                        setSelectedImage(null);
                      }}
                    >
                      {displayImage ? (
                        <>
                          <img src={`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}${displayImage}`} className={`w-full h-full object-cover transition-opacity ${isPreviewing ? 'opacity-50' : 'opacity-90'}`} />
                          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-1 pointer-events-none">
                            <span className="text-white font-label-md font-bold text-center text-[8px] md:text-sm leading-tight">{selectedCat ? (selectedCat.name || selectedCat.nombre) : 'Sin Enlace'}</span>
                          </div>
                          {isPreviewing && (
                            <div className="absolute inset-0 border-2 md:border-4 border-primary rounded-xl pointer-events-none"></div>
                          )}
                        </>
                      ) : (
                        <div className={`flex flex-col items-center gap-1 md:gap-2 text-center px-1 pointer-events-none ${selectedImage ? 'opacity-100 text-primary' : 'opacity-50 text-on-surface'}`}>
                          <span className="material-symbols-outlined text-[16px] md:text-[24px]">add_photo_alternate</span>
                          <span className="font-label-md uppercase tracking-widest text-[6px] md:text-[10px] leading-tight">
                            {selectedImage ? 'Toca para agregar' : (
                              <>Arrastra Imagen<br className="hidden md:block" />({isLarge ? 'Grande' : 'Pequeño'} {slot.slot_index})</>
                            )}
                          </span>
                        </div>
                      )}

                      {slot.imagen_url && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSlotImageChange(slot.slot_index, '');
                          }}
                          className="absolute top-1 right-1 md:top-2 md:right-2 w-6 h-6 md:w-8 md:h-8 bg-error text-on-error rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20 shadow-sm"
                          title="Quitar imagen personalizada"
                        >
                          <span className="material-symbols-outlined text-[12px] md:text-[16px]">delete</span>
                        </button>
                      )}

                      {/* Diagonal Discount Ribbon Preview */}
                      {slot.descuento_porcentaje > 0 && (
                        <div className="absolute top-2 -left-6 md:top-4 md:-left-8 w-24 md:w-32 bg-error text-on-error text-center py-0.5 md:py-1 text-[8px] md:text-[10px] font-bold uppercase tracking-widest shadow-md z-10 -rotate-45 pointer-events-none">
                          -{slot.descuento_porcentaje}% OFF
                        </div>
                      )}
                    </div>
                    
                    {/* Category Link Selector & Discount Input */}
                    <div className="flex flex-col gap-1 mt-1 md:mt-2 w-full min-w-0">
                      
                      {/* Enlace */}
                      <div className="flex items-center gap-1 md:gap-2 w-full">
                        <span className="material-symbols-outlined text-on-surface-variant text-[12px] md:text-[16px] hidden md:block shrink-0" title="Enlace">link</span>
                        <select 
                          value={slot.categoria_id}
                          onChange={(e) => handleSlotCategoryChange(slot.slot_index, e.target.value)}
                          className="flex-1 w-0 min-w-[60px] bg-surface-container px-1 py-1 md:px-2 md:py-1.5 rounded md:rounded-lg border border-outline-variant/30 text-[9px] md:text-[11px] text-primary focus:border-primary outline-none truncate"
                        >
                          <option value="">-- Sin Enlace --</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name || c.nombre}</option>
                          ))}
                        </select>
                      </div>

                      {/* Descuento */}
                      <div className="flex items-center gap-1 md:gap-2 w-full">
                        <span className="material-symbols-outlined text-on-surface-variant text-[12px] md:text-[16px] hidden md:block shrink-0" title="Descuento">sell</span>
                        <div className="relative flex items-center flex-1" title="Porcentaje de descuento para esta sección">
                          <span className="absolute right-2 md:right-3 text-[10px] md:text-[11px] text-on-surface-variant pointer-events-none">%</span>
                          <input 
                            type="number" 
                            min="0" max="100" 
                            value={slot.descuento_porcentaje || ''} 
                            onChange={(e) => handleSlotDiscountChange(slot.slot_index, e.target.value)}
                            placeholder="0"
                            className="w-full bg-surface-container pr-5 pl-2 py-1 md:py-1.5 rounded md:rounded-lg border border-outline-variant/30 text-[10px] md:text-[11px] text-primary focus:border-primary outline-none text-right font-bold"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                );
              };

              return (
                <>
                  {/* Left Column (50%) */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2 md:gap-4">
                    {renderSlot(1, true)}
                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                      {renderSlot(4, false)}
                      {renderSlot(5, false)}
                    </div>
                  </div>
                  {/* Right Column (50%) */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2 md:gap-4">
                    <div className="grid grid-cols-2 gap-2 md:gap-4 min-w-0">
                      {renderSlot(2, false)}
                      {renderSlot(3, false)}
                    </div>
                    {renderSlot(6, true)}
                  </div>
                </>
              );
            })()}

          </div>
        </div>

        {/* Right: Images Palette */}
        <div className="w-full lg:w-80 bg-surface-container-lowest p-4 md:p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col lg:h-[600px] shrink-0">
          <div className="mb-4 shrink-0">
            <h4 className="font-headline-sm text-primary mb-1">Galería de Imágenes</h4>
            <p className="font-body-sm text-on-surface-variant text-sm mb-4 hidden md:block">Arrastra la imagen hacia los recuadros grises para personalizar la portada.</p>
            <p className="font-body-sm text-on-surface-variant text-[11px] leading-tight mb-4 md:hidden"><strong>Toca una foto para seleccionarla</strong> y luego toca el recuadro donde quieras ponerla.</p>
            
            <div className="flex gap-2 p-1 bg-surface-container-high/50 rounded-xl mb-4">
              <button
                onClick={() => setImageFolder('uploads')}
                className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${imageFolder === 'uploads' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Muebles
              </button>
              <button
                onClick={() => setImageFolder('Publicidad')}
                className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${imageFolder === 'Publicidad' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Publicidad
              </button>
            </div>

            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <button 
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors font-label-md"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {uploading ? 'hourglass_empty' : 'upload'}
                </span>
                {uploading ? 'Subiendo...' : 'Subir Imagen'}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-0 lg:pr-2 min-h-[140px]">
            <div className="flex lg:grid lg:grid-cols-2 gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x">
              {images.map((imgUrl, idx) => (
                <div 
                  key={idx}
                  draggable 
                  onClick={() => {
                    setSelectedImage(selectedImage === imgUrl ? null : imgUrl);
                  }}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'copyMove';
                    e.dataTransfer.setData('text/plain', imgUrl); 
                    setSelectedImage(imgUrl);
                  }}
                  onDragEnd={() => {
                    setSelectedImage(null);
                    setHoveredSlot(null);
                  }}
                  className={`w-28 lg:w-full shrink-0 aspect-square bg-surface rounded-xl border overflow-hidden transition-all cursor-pointer cursor-grab active:cursor-grabbing snap-start relative ${selectedImage === imgUrl ? 'border-primary shadow-md opacity-90 scale-[0.95] ring-2 ring-primary ring-offset-2' : 'border-outline-variant/30 hover:border-primary/50 hover:shadow-sm'}`}
                >
                  <img src={`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}${imgUrl}`} className="w-full h-full object-cover pointer-events-none" loading="lazy" />
                  {selectedImage === imgUrl && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-on-primary rounded-full p-1 shadow-lg">
                        <span className="material-symbols-outlined text-[16px] block">check</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {images.length === 0 && (
                <div className="w-full col-span-2 text-center py-8 text-on-surface-variant text-body-sm shrink-0">
                  No hay imágenes en la galería.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 mt-8 shadow-sm">
        <label className="block font-label-md text-label-md text-primary mb-2">
          Texto del Pie de Página (Footer)
        </label>
        <textarea
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          className="w-full bg-surface-container/50 border border-outline-variant/50 rounded-xl p-4 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          rows="3"
          placeholder="Escribe el texto que verán tus clientes en la parte inferior de todas las páginas..."
        />
      </div>
    </div>
  );
}
