import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';

export default function CategoryManager({ user }) {
  const { showAlert, showConfirm } = useAlert();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/products/categories');
      setCategories(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    setSelectedCategory(cat);
    setNombre(cat ? (cat.name || cat.nombre) : '');
    setDescripcion(cat ? (cat.descripcion || '') : '');
    setImagenUrl(cat ? (cat.imagen_url || '') : '');
    setImageFile(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await showConfirm('¿Seguro que deseas eliminar esta categoría? No se podrá eliminar si hay productos que la usan.');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3001/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      if (res.ok) {
        fetchCategories();
        showAlert('Categoría eliminada', 'success');
      } else {
        const errorData = await res.json();
        showAlert(errorData.message || 'Error al eliminar', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de conexión', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImageUrl = imagenUrl;
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await fetch('http://localhost:3001/api/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.url;
        } else {
          setSaving(false);
          return showAlert('Error al subir la imagen', 'error');
        }
      }

      const isEdit = !!selectedCategory;
      const url = isEdit 
        ? `http://localhost:3001/api/admin/categories/${selectedCategory.id}` 
        : `http://localhost:3001/api/admin/categories`;
        
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}` 
        },
        body: JSON.stringify({ nombre, descripcion, imagen_url: finalImageUrl })
      });
      
      if (res.ok) {
        setModalOpen(false);
        fetchCategories();
        showAlert('Categoría guardada exitosamente', 'success');
      } else {
        showAlert('Error al guardar la categoría', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="font-headline-sm text-headline-sm text-primary">Gestión de Categorías</h3>
        <button 
          onClick={() => handleOpenModal(null)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors font-label-md text-label-md uppercase tracking-widest w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nueva Categoría
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-on-surface-variant font-label-md">Cargando categorías...</div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="overflow-x-hidden md:overflow-visible">
            <table className="w-full text-left border-collapse block md:table">
              <thead className="bg-surface-container-low hidden md:table-header-group">
                <tr className="border-b border-outline-variant/30 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
                  <th className="py-4 px-4 font-medium">Categoría</th>
                  <th className="py-4 px-4 font-medium">Descripción</th>
                  <th className="py-4 px-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md block md:table-row-group w-full">
                {categories.map(c => (
                  <tr key={c.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors flex flex-col md:table-row p-4 md:p-0 relative w-full block md:table-row">
                    
                    <td className="py-2 md:py-4 px-0 md:px-4 pr-20 md:pr-4 overflow-hidden w-full md:w-auto block md:table-cell align-middle">
                      <div className="flex items-center gap-4 w-full">
                        {c.imagen_url ? (
                          <img src={`http://localhost:3001${c.imagen_url}`} alt={c.name || c.nombre} className="w-16 h-16 md:w-12 md:h-12 object-cover rounded-md border border-outline-variant/20 shrink-0" />
                        ) : (
                          <div className="w-16 h-16 md:w-12 md:h-12 bg-surface-container-high rounded-md border border-outline-variant/20 shrink-0 flex items-center justify-center text-on-surface-variant/50">
                            <span className="material-symbols-outlined text-[24px] md:text-[20px]">image</span>
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                          <span className="font-medium text-primary text-base md:text-body-md leading-tight truncate w-full block">{c.name || c.nombre}</span>
                          <span className="text-on-surface-variant font-caption text-[11px] md:hidden mt-1 truncate block">
                            {c.descripcion || <span className="opacity-50 italic">Sin descripción</span>}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-2 px-0 md:py-4 md:px-4 text-on-surface-variant hidden md:table-cell">
                      {c.descripcion || <span className="opacity-50 italic">Sin descripción</span>}
                    </td>

                    <td className="py-2 px-0 md:py-4 md:px-4 text-right absolute top-4 right-2 md:relative md:top-auto md:right-auto flex gap-1 justify-end">
                      <button onClick={() => handleOpenModal(c)} className="text-on-surface-variant hover:text-primary transition-colors p-2 md:p-2 bg-surface/80 rounded-full md:bg-transparent shadow-sm md:shadow-none">
                        <span className="material-symbols-outlined text-[18px] md:text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-on-surface-variant hover:text-error transition-colors p-2 md:p-2 bg-surface/80 rounded-full md:bg-transparent shadow-sm md:shadow-none">
                        <span className="material-symbols-outlined text-[18px] md:text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-on-surface-variant">No hay categorías registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/30">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-on-surface-variant hover:opacity-80 p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-2 uppercase tracking-widest">Nombre</label>
                  <input 
                    type="text" 
                    required 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)} 
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-highest border-none text-primary focus:ring-2 focus:ring-primary font-body-md" 
                    placeholder="Ej. Sofás"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-2 uppercase tracking-widest">Descripción (Opcional)</label>
                  <textarea 
                    value={descripcion} 
                    onChange={e => setDescripcion(e.target.value)} 
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-highest border-none text-primary focus:ring-2 focus:ring-primary font-body-md h-24 resize-none" 
                    placeholder="Muebles para el descanso y la sala..."
                  />
                </div>
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-2 uppercase tracking-widest">Imagen de Portada</label>
                  <div className="flex flex-col gap-3">
                    {(imageFile || imagenUrl) && (
                      <img 
                        src={imageFile ? URL.createObjectURL(imageFile) : `http://localhost:3001${imagenUrl}`} 
                        alt="Preview" 
                        className="w-full h-40 object-cover rounded-lg border border-outline-variant/30"
                      />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) setImageFile(file);
                      }} 
                      className="w-full px-4 py-3 rounded-lg bg-surface-container-highest border-none text-primary focus:ring-2 focus:ring-primary font-body-md text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-outline-variant/30">
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 rounded-full font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-highest transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full font-label-md text-label-md uppercase tracking-widest bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
