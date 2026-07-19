import React, { useState } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { Reorder } from 'framer-motion';

export const generateRandomSku = () => 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase();

const checkSkuUnique = async (sku, currentId = null) => {
  try {
    let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/check-sku?sku=${sku}`;
    if (currentId) url += `&currentId=${currentId}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.unique;
  } catch (err) {
    return true; // Fallback
  }
};

export default function ProductFormModal({ product, categories, user, onClose, onRefresh }) {
  const { showAlert, showConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState('base'); // 'base' | 'variants'
  const isEdit = !!product;

  // Product State
  const [nombre, setNombre] = useState(product?.name || '');
  const [descripcion, setDescripcion] = useState(product?.description || '');
  const [especificaciones, setEspecificaciones] = useState(product?.specifications || '');
  const [precioBase, setPrecioBase] = useState(product?.price ? Math.round(Number(product.price)) : '');
  const [categoriaId, setCategoriaId] = useState(product?.categoryId || (categories[0]?.id || ''));
  const [productId, setProductId] = useState(product?.id || null);

  const initialGallery = [];
  if (product?.image) initialGallery.push({ id: 'existing-0', type: 'existing', url: product.image });
  
  let parsedGallery = [];
  if (product?.gallery) {
    try {
      parsedGallery = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
    } catch(e) {
      console.error("Error parsing gallery", e);
    }
  }

  if (Array.isArray(parsedGallery)) {
    parsedGallery.forEach((url, i) => initialGallery.push({ id: `existing-${i+1}`, type: 'existing', url }));
  }
  const [gallery, setGallery] = useState(initialGallery);
  const [galleryChanged, setGalleryChanged] = useState(false);

  const isBaseChanged = () => {
    if (!isEdit) return true;
    if (nombre !== (product.name || '')) return true;
    if (descripcion !== (product.description || '')) return true;
    if (especificaciones !== (product.specifications || '')) return true;
    if (String(precioBase) !== String(product.price || '')) return true;
    if (String(categoriaId) !== String(product.categoryId || '')) return true;
    if (galleryChanged) return true;
    return false;
  };
  const hasChanges = isBaseChanged();

  // Variants State
  const [variants, setVariants] = useState(product?.variantes || []);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    if (gallery.length === 0) {
      return showAlert('Debes subir al menos una imagen para el producto (portada).', 'error');
    }
    
    const finalUrls = [];
    
    // Subir imágenes nuevas
    for (let i = 0; i < gallery.length; i++) {
      const item = gallery[i];
      if (item.type === 'existing') {
        finalUrls.push(item.url);
      } else if (item.type === 'new') {
        const formData = new FormData();
        formData.append('image', item.file);
        try {
          const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, {
            method: 'POST',
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalUrls.push(uploadData.url);
          } else {
            return showAlert('Error al subir una de las imágenes', 'error');
          }
        } catch (err) {
          console.error(err);
          return showAlert('Error de red al subir imágenes', 'error');
        }
      }
    }

    const imagenBase = finalUrls[0];
    const galeriaUrls = finalUrls.slice(1);

    const payload = { nombre, descripcion, especificaciones, precio_base: precioBase, imagen_base: imagenBase, galeria: galeriaUrls, categoria_id: categoriaId };
    try {
      const url = isEdit ? `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}/api/admin/products/${productId}` : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/products`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        if (!isEdit) {
          setProductId(data.id);
          showAlert('Producto Base Creado. Ahora puedes añadir variantes.', 'success');
          setActiveTab('variants');
        } else {
          showAlert('Producto Base Actualizado', 'success');
        }
        onRefresh();
      } else {
        showAlert(data.message || 'Error guardando producto', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') || url.startsWith('blob:') ? url : `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}${url}`;
  };

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newItems = files.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      type: 'new',
      file,
      preview: URL.createObjectURL(file)
    }));
    setGallery([...gallery, ...newItems]);
    setGalleryChanged(true);
    e.target.value = null; // reset input
  };

  const removeImage = (idToRemove) => {
    const newGal = gallery.filter(item => item.id !== idToRemove);
    setGallery(newGal);
    setGalleryChanged(true);
  };

  const [newVariant, setNewVariant] = useState({ material: '', acabado_color: '', sku: '', stock: 0, precio_especifico: '', especificaciones: '' });
  const [newVariantGallery, setNewVariantGallery] = useState([]);

  const handleNewVariantFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newItems = files.map((file, idx) => ({
      id: `new-var-${Date.now()}-${idx}`,
      type: 'new',
      file,
      preview: URL.createObjectURL(file)
    }));
    setNewVariantGallery([...newVariantGallery, ...newItems]);
    e.target.value = null;
  };

  const removeNewVariantImage = (idToRemove) => {
    setNewVariantGallery(newVariantGallery.filter(item => item.id !== idToRemove));
  };

  const handleAddVariant = async () => {
    if (!productId) return showAlert('Guarda el producto base primero', 'error');
    if (!newVariant.material || !newVariant.acabado_color || !newVariant.sku) return showAlert('Material, Color y SKU son requeridos', 'error');
    
    const isUnique = await checkSkuUnique(newVariant.sku);
    if (!isUnique) return showAlert('El SKU ya está en uso. Por favor ingresa o genera uno único.', 'error');
    
    try {
      const finalUrls = [];
      
      for (let i = 0; i < newVariantGallery.length; i++) {
        const item = newVariantGallery[i];
        if (item.type === 'existing') {
          finalUrls.push(item.url);
        } else if (item.type === 'new') {
          const formData = new FormData();
          formData.append('image', item.file);
          const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, { method: 'POST', body: formData });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalUrls.push(uploadData.url);
          } else {
            return showAlert('Error al subir la imagen de la variante', 'error');
          }
        }
      }

      const payload = {
        producto_id: productId,
        ...newVariant,
        precio_especifico: newVariant.precio_especifico || precioBase,
        stock: parseInt(newVariant.stock) || 0,
        imagen_variante: finalUrls[0] || null,
        galeria: finalUrls.slice(1)
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setVariants([...variants, { id: data.id, ...payload }]);
        setNewVariant({ material: '', acabado_color: '', sku: '', stock: 0, precio_especifico: '', especificaciones: '' });
        setNewVariantGallery([]);
        onRefresh();
      } else {
        showAlert(data.message || 'Error al añadir variante', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVariant = async (id) => {
    const isConfirmed = await showConfirm('¿Seguro que deseas eliminar esta variante?');
    if (!isConfirmed) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}/api/admin/variants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      if (res.ok) {
        setVariants(variants.filter(v => v.id !== id));
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStock = async (variant, newStock) => {
    try {
      const payload = {
        ...variant,
        stock: parseInt(newStock) || 0
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}/api/admin/variants/${variant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setVariants(variants.map(v => v.id === variant.id ? { ...v, stock: parseInt(newStock) || 0 } : v));
        onRefresh();
        showAlert('Stock actualizado exitosamente', 'success');
      } else {
        const data = await res.json();
        showAlert(data.message || 'Error al actualizar stock', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de red al actualizar stock', 'error');
    }
  };

  const handleUpdateVariant = async (variantId, updatedData, editGallery) => {
    try {
      const finalUrls = [];
      
      for (let i = 0; i < editGallery.length; i++) {
        const item = editGallery[i];
        if (item.type === 'existing') {
          finalUrls.push(item.url);
        } else if (item.type === 'new') {
          const formData = new FormData();
          formData.append('image', item.file);
          const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, { method: 'POST', body: formData });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalUrls.push(uploadData.url);
          } else {
            return showAlert('Error al subir la nueva imagen de la variante', 'error');
          }
        }
      }

      const payload = { 
        ...updatedData, 
        imagen_variante: finalUrls[0] || null,
        galeria: finalUrls.slice(1)
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}/api/admin/variants/${variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setVariants(variants.map(v => v.id === variantId ? { ...v, ...payload } : v));
        onRefresh();
        showAlert('Variante actualizada exitosamente', 'success');
      } else {
        const data = await res.json();
        showAlert(data.message || 'Error al actualizar variante', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de red al actualizar variante', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 md:p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="font-headline-md text-headline-md text-primary">{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex border-b border-outline-variant/30 px-2 md:px-6 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('base')} className={`shrink-0 py-4 px-4 font-label-md uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === 'base' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>
            Info Base
          </button>
          <button onClick={() => setActiveTab('variants')} disabled={!productId} className={`shrink-0 py-4 px-4 font-label-md uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${!productId ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'variants' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>
            Variantes ({variants.length})
          </button>
          <button onClick={() => setActiveTab('stock')} disabled={!productId || variants.length === 0} className={`shrink-0 py-4 px-4 font-label-md uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${(!productId || variants.length === 0) ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'stock' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`}>
            Stock
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex-1 font-body-md text-on-surface">
          {activeTab === 'base' && (
            <form id="productForm" onSubmit={handleSaveProduct} className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Nombre del Producto</label>
                  <input required value={nombre} onChange={e => setNombre(e.target.value)} className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Categoría</label>
                  <select required value={categoriaId} onChange={e => setCategoriaId(e.target.value)} className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Precio Base ($)</label>
                  <input required type="number" step="1" value={precioBase} onChange={e => setPrecioBase(e.target.value)} className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none" />
                </div>
              </div>

              {/* GALLERY SECTION */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Galería de Imágenes</label>
                  <input type="file" multiple accept="image/*" onChange={handleFilesSelect} id="gallery-upload" className="hidden" />
                  <label htmlFor="gallery-upload" className="cursor-pointer px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full font-label-md uppercase tracking-widest text-xs transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span> Añadir Fotos
                  </label>
                </div>
                
                {gallery.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-on-surface-variant/50">
                    <span className="material-symbols-outlined text-4xl mb-2">image</span>
                    <p className="font-body-sm text-center">No hay imágenes.<br/>Sube al menos una para la portada.</p>
                  </div>
                ) : (
                  <Reorder.Group 
                    axis="x" 
                    values={gallery} 
                    onReorder={(newOrder) => { setGallery(newOrder); setGalleryChanged(true); }}
                    className="flex gap-4 overflow-x-auto py-2 px-1 no-scrollbar min-h-[140px] items-center"
                  >
                    {gallery.map((item, index) => (
                      <Reorder.Item 
                        key={item.id} 
                        value={item}
                        className={`relative min-w-[120px] w-[120px] h-[120px] rounded-xl border border-outline-variant overflow-hidden group shadow-sm shrink-0 cursor-grab active:cursor-grabbing bg-surface`}
                      >
                        <img src={getImageUrl(item.type === 'existing' ? item.url : item.preview)} className="w-full h-full object-cover pointer-events-none select-none" />
                        
                        <div className="absolute top-1 left-1 bg-surface text-primary font-bold rounded shadow-sm px-1.5 py-0.5 text-[11px] z-20 border border-outline-variant/30 pointer-events-none">
                          #{index + 1}
                        </div>

                        {index === 0 && <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-on-primary text-[10px] font-bold text-center py-1 uppercase tracking-widest z-0 pb-2 pointer-events-none">Portada</div>}
                        
                        <button type="button" onClick={() => removeImage(item.id)} className="absolute top-1 right-1 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-700 transition-colors z-20" title="Eliminar foto">
                          <span className="material-symbols-outlined text-[14px] font-bold">close</span>
                        </button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Descripción</label>
                  <textarea required rows={4} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Especificaciones</label>
                  <textarea rows={4} placeholder="Medidas, materiales, cuidados..." value={especificaciones} onChange={e => setEspecificaciones(e.target.value)} className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none" />
                </div>
              </div>
            </form>
          )}

          {activeTab === 'variants' && (
            <div className="flex flex-col gap-6">
              {/* Variant List */}
              <div className="flex flex-col gap-3">
                {variants.length === 0 && <p className="text-on-surface-variant italic">No hay variantes para este producto. Añade una abajo.</p>}
                {variants.map(v => (
                  <VariantItem key={v.id} variant={v} onDelete={handleDeleteVariant} onUpdate={handleUpdateVariant} />
                ))}
              </div>

              {/* Add Variant Form */}
              <div className="bg-surface-container-low p-5 rounded-xl flex flex-col gap-4 border border-outline-variant/30 mt-4">
                <h4 className="font-label-md uppercase tracking-widest text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">add_box</span>
                  Añadir Nueva Variante
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input placeholder="Material (Ej. Roble)" value={newVariant.material} onChange={e => setNewVariant({...newVariant, material: e.target.value})} className="w-full bg-surface p-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
                  <input placeholder="Color (Ej. Natural)" value={newVariant.acabado_color} onChange={e => setNewVariant({...newVariant, acabado_color: e.target.value})} className="w-full bg-surface p-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
                  <div className="flex gap-2 w-full">
                    <input placeholder="SKU Único" value={newVariant.sku} onChange={e => setNewVariant({...newVariant, sku: e.target.value})} className="flex-1 bg-surface p-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
                    <button type="button" onClick={() => setNewVariant({...newVariant, sku: generateRandomSku()})} className="bg-surface-variant p-3 rounded-lg text-on-surface-variant hover:bg-primary/20 transition-colors" title="Generar SKU Automático">
                      <span className="material-symbols-outlined text-[20px]">autorenew</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="number" placeholder="Stock Inicial" value={newVariant.stock} onChange={e => setNewVariant({...newVariant, stock: e.target.value})} className="w-full bg-surface p-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
                  <input type="number" step="1" placeholder="Precio Específico ($)" value={newVariant.precio_especifico} onChange={e => setNewVariant({...newVariant, precio_especifico: e.target.value})} className="w-full bg-surface p-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface-variant uppercase tracking-widest mt-2">Especificaciones</label>
                  <textarea placeholder="Medidas, materiales, cuidados..." rows={3} value={newVariant.especificaciones} onChange={e => setNewVariant({...newVariant, especificaciones: e.target.value})} className="w-full bg-surface p-3 rounded-lg border border-outline-variant outline-none focus:border-primary resize-y" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center mt-2">
                    <label className="font-caption text-on-surface-variant uppercase tracking-widest">Galería de Variante</label>
                    <input type="file" multiple accept="image/*" onChange={handleNewVariantFilesSelect} id="var-gallery-upload" className="hidden" />
                    <label htmlFor="var-gallery-upload" className="cursor-pointer px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-full font-label-md uppercase tracking-widest text-[10px] transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">add_photo_alternate</span> Añadir Fotos
                    </label>
                  </div>
                  
                  {newVariantGallery.length === 0 ? (
                    <div className="p-4 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-on-surface-variant/50">
                      <p className="font-body-sm text-center text-xs">Sin imágenes</p>
                    </div>
                  ) : (
                    <Reorder.Group 
                      axis="x" 
                      values={newVariantGallery} 
                      onReorder={setNewVariantGallery}
                      className="flex gap-2 overflow-x-auto py-2 px-1 no-scrollbar items-center"
                    >
                      {newVariantGallery.map((item, index) => (
                        <Reorder.Item 
                          key={item.id} 
                          value={item}
                          className="relative w-16 h-16 rounded-lg border border-outline-variant overflow-hidden shrink-0 bg-surface"
                        >
                          <img src={getImageUrl(item.type === 'existing' ? item.url : item.preview)} className="w-full h-full object-cover pointer-events-none" />
                          <div className="absolute top-0.5 left-0.5 bg-surface text-primary font-bold rounded shadow-sm px-1 py-0.5 text-[9px] z-20 border border-outline-variant/30 pointer-events-none">
                            #{index + 1}
                          </div>
                          {index === 0 && <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-on-primary text-[8px] font-bold text-center py-0.5 uppercase tracking-widest z-0 pb-1.5 pointer-events-none">Portada</div>}
                          <button type="button" onClick={() => removeNewVariantImage(item.id)} className="absolute top-0 right-0 bg-error/90 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-md hover:bg-red-700 m-0.5 z-20" title="Eliminar">
                            <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                          </button>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  )}
                </div>
                <button onClick={handleAddVariant} className="mt-2 bg-secondary text-on-secondary font-label-md uppercase tracking-widest py-3 rounded-lg hover:bg-secondary/90 transition-colors">Guardar Variante</button>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="flex flex-col gap-4">
              <h4 className="font-label-md uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">inventory</span>
                Gestión de Inventario (Cantidades)
              </h4>
              {variants.map(v => (
                <StockItem key={v.id} variant={v} onUpdate={handleUpdateStock} />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-outline-variant/30 flex justify-end gap-2 md:gap-4 bg-surface-container-lowest rounded-b-2xl">
          <button onClick={onClose} className="px-4 md:px-6 py-2 border border-outline-variant rounded-full font-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Cerrar</button>
          {activeTab === 'base' && (
            <button 
              form="productForm" 
              type="submit" 
              disabled={!hasChanges}
              className={`px-6 py-2 rounded-full font-label-md uppercase tracking-widest transition-all duration-300 ${hasChanges ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-md hover:shadow-lg' : 'bg-surface-variant/50 text-on-surface-variant/70 cursor-not-allowed'}`}
            >
              {isEdit ? 'Actualizar Producto' : 'Crear Producto Base'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const StockItem = ({ variant, onUpdate }) => {
  const [stock, setStock] = useState(variant.stock);
  const isChanged = String(stock) !== String(variant.stock);

  return (
    <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <div>
        <p className="font-label-md text-primary font-bold">{variant.material} - {variant.acabado_color}</p>
        <p className="font-caption text-on-surface-variant mt-1">SKU: {variant.sku}</p>
      </div>
      <div className="flex items-center gap-2">
        <label className="font-caption text-on-surface-variant uppercase mr-2">Cantidad:</label>
        <input 
          type="number" 
          value={stock} 
          onChange={(e) => setStock(e.target.value)}
          className="w-24 bg-surface p-2 rounded-lg border border-outline-variant outline-none focus:border-primary text-center font-body-lg"
        />
        <button 
          onClick={() => onUpdate(variant, stock)}
          disabled={!isChanged}
          className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${isChanged ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm hover:scale-105' : 'bg-surface-variant/50 text-on-surface-variant/70 cursor-not-allowed'}`}
          title="Guardar Stock"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
        </button>
      </div>
    </div>
  );
};

const VariantItem = ({ variant, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...variant });
  
  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') || url.startsWith('blob:') ? url : `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}${url}`;
  };

  const initialGallery = [];
  if (variant.imagen_variante) initialGallery.push({ id: 'existing-0', type: 'existing', url: variant.imagen_variante });
  
  let parsedGallery = [];
  if (variant.galeria) {
    try {
      parsedGallery = typeof variant.galeria === 'string' ? JSON.parse(variant.galeria) : variant.galeria;
    } catch(e) {}
  }
  if (Array.isArray(parsedGallery)) {
    parsedGallery.forEach((url, i) => initialGallery.push({ id: `existing-${i+1}`, type: 'existing', url }));
  }
  
  const [editGallery, setEditGallery] = useState(initialGallery);
  const [galleryChanged, setGalleryChanged] = useState(false);

  const hasChanges = 
    editData.material !== variant.material ||
    editData.acabado_color !== variant.acabado_color ||
    editData.sku !== variant.sku ||
    String(editData.precio_especifico) !== String(variant.precio_especifico) ||
    (editData.especificaciones || '') !== (variant.especificaciones || '') ||
    galleryChanged;

  const handleSave = async () => {
    if (editData.sku !== variant.sku) {
      const isUnique = await checkSkuUnique(editData.sku, variant.id);
      if (!isUnique) return alert('El SKU ya está en uso. Por favor ingresa o genera uno único.');
    }
    onUpdate(variant.id, editData, editGallery);
    setIsEditing(false);
    setGalleryChanged(false);
  };

  const handleEditFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newItems = files.map((file, idx) => ({
      id: `new-edit-${Date.now()}-${idx}`,
      type: 'new',
      file,
      preview: URL.createObjectURL(file)
    }));
    setEditGallery([...editGallery, ...newItems]);
    setGalleryChanged(true);
    e.target.value = null;
  };

  const removeEditImage = (idToRemove) => {
    setEditGallery(editGallery.filter(item => item.id !== idToRemove));
    setGalleryChanged(true);
  };

  if (isEditing) {
    return (
      <div className="bg-surface-container-lowest p-4 rounded-lg border border-primary/50 flex flex-col gap-3 shadow-sm">
        <div className="flex flex-col md:flex-row gap-2">
          <input 
            value={editData.material} 
            onChange={e => setEditData({...editData, material: e.target.value})} 
            placeholder="Material"
            className="flex-1 bg-surface p-2 rounded-lg border border-outline-variant outline-none focus:border-primary text-sm"
          />
          <input 
            value={editData.acabado_color} 
            onChange={e => setEditData({...editData, acabado_color: e.target.value})} 
            placeholder="Color"
            className="flex-1 bg-surface p-2 rounded-lg border border-outline-variant outline-none focus:border-primary text-sm"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex flex-1 gap-1">
            <input 
              value={editData.sku} 
              onChange={e => setEditData({...editData, sku: e.target.value})} 
              placeholder="SKU"
              className="flex-1 bg-surface p-2 rounded-lg border border-outline-variant outline-none focus:border-primary text-sm min-w-0"
            />
            <button type="button" onClick={() => setEditData({...editData, sku: generateRandomSku()})} className="bg-surface-variant px-2 rounded-lg text-on-surface-variant hover:bg-primary/20 transition-colors" title="Generar SKU Automático">
              <span className="material-symbols-outlined text-[16px]">autorenew</span>
            </button>
          </div>
          <input 
            type="number"
            step="1"
            value={editData.precio_especifico} 
            onChange={e => setEditData({...editData, precio_especifico: e.target.value})} 
            placeholder="Precio"
            className="flex-1 bg-surface p-2 rounded-lg border border-outline-variant outline-none focus:border-primary text-sm"
          />
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <label className="text-xs text-on-surface-variant uppercase tracking-widest">Especificaciones</label>
          <textarea 
            rows={2}
            value={editData.especificaciones || ''} 
            onChange={e => setEditData({...editData, especificaciones: e.target.value})} 
            placeholder="Medidas, materiales, cuidados..."
            className="w-full bg-surface p-2 rounded-lg border border-outline-variant outline-none focus:border-primary text-sm resize-y"
          />
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex justify-between items-center mt-2">
            <label className="text-xs text-on-surface-variant uppercase tracking-widest">Galería de Variante</label>
            <input type="file" multiple accept="image/*" onChange={handleEditFilesSelect} id={`edit-gallery-${variant.id}`} className="hidden" />
            <label htmlFor={`edit-gallery-${variant.id}`} className="cursor-pointer px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-full font-label-md uppercase tracking-widest text-[10px] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">add_photo_alternate</span> Añadir Fotos
            </label>
          </div>
          
          {editGallery.length === 0 ? (
            <div className="p-4 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-on-surface-variant/50">
              <p className="font-body-sm text-center text-xs">Sin imágenes</p>
            </div>
          ) : (
            <Reorder.Group 
              axis="x" 
              values={editGallery} 
              onReorder={(newOrder) => { setEditGallery(newOrder); setGalleryChanged(true); }}
              className="flex gap-2 overflow-x-auto py-2 px-1 no-scrollbar items-center"
            >
              {editGallery.map((item, index) => (
                <Reorder.Item 
                  key={item.id} 
                  value={item}
                  className="relative w-16 h-16 rounded-lg border border-outline-variant overflow-hidden shrink-0 bg-surface"
                >
                  <img src={getImageUrl(item.type === 'existing' ? item.url : item.preview)} className="w-full h-full object-cover pointer-events-none" />
                  <div className="absolute top-0.5 left-0.5 bg-surface text-primary font-bold rounded shadow-sm px-1 py-0.5 text-[9px] z-20 border border-outline-variant/30 pointer-events-none">
                    #{index + 1}
                  </div>
                  {index === 0 && <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-on-primary text-[8px] font-bold text-center py-0.5 uppercase tracking-widest z-0 pb-1.5 pointer-events-none">Portada</div>}
                  <button type="button" onClick={() => removeEditImage(item.id)} className="absolute top-0 right-0 bg-error/90 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-md hover:bg-red-700 m-0.5 z-20" title="Eliminar">
                    <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={() => { setIsEditing(false); setEditData({ ...variant }); setEditGallery(initialGallery); setGalleryChanged(false); }} className="px-4 py-2 text-sm font-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Cancelar</button>
          <button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-lg text-sm font-label-md uppercase tracking-widest transition-all duration-300 ${hasChanges ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-md hover:shadow-lg' : 'bg-surface-variant/50 text-on-surface-variant/70 cursor-not-allowed'}`}
          >
            Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 flex justify-between items-center group">
      <div className="flex items-center gap-4">
        {variant.imagen_variante && (
          <img src={variant.imagen_variante} alt={variant.sku} className="w-12 h-12 object-cover rounded-md border border-outline-variant/30" />
        )}
        <div>
          <p className="font-label-md text-primary font-bold">{variant.material} - {variant.acabado_color}</p>
          <p className="font-caption text-on-surface-variant mt-1">SKU: {variant.sku} | Stock: {variant.stock} | Precio: ${Number(variant.precio_especifico).toLocaleString('es-CL')}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="text-on-surface-variant hover:text-primary p-2 transition-colors bg-surface-container rounded-full" title="Editar Variante">
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button onClick={() => onDelete(variant.id)} className="text-on-surface-variant hover:text-error p-2 transition-colors bg-surface-container rounded-full" title="Eliminar Variante">
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
};


