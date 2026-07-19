import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';

function ImageManager({ token }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [imageUsage, setImageUsage] = useState({ loading: false, data: null });
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchImages = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload/images`);
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      showAlert('Error al cargar las imágenes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDeleteClick = async (imageUrl) => {
    setConfirmDelete(imageUrl);
    setImageUsage({ loading: true, data: null });
    try {
      const filename = imageUrl.split('/').pop();
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`}/api/upload/check-usage?filename=${filename}`);
      if (res.ok) {
        const data = await res.json();
        setImageUsage({ loading: false, data });
      } else {
        setImageUsage({ loading: false, data: null });
      }
    } catch (err) {
      console.error(err);
      setImageUsage({ loading: false, data: null });
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload/image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: confirmDelete })
      });

      if (res.ok) {
        showAlert('Imagen eliminada correctamente', 'success');
        setImages(images.filter(img => img !== confirmDelete));
      } else {
        const data = await res.json();
        showAlert(data.message || 'Error al eliminar la imagen', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error al eliminar la imagen', 'error');
    } finally {
      setConfirmDelete(null);
      setImageUsage({ loading: false, data: null });
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
    setImageUsage({ loading: false, data: null });
  };

  if (loading) {
    return <div className="text-center py-10 font-body-md text-on-surface-variant">Cargando galería...</div>;
  }

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6">
      <div className="mb-6">
        <h2 className="font-display-sm text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px]">perm_media</span>
          Gestor de Medios
        </h2>
        <p className="font-body-md text-on-surface-variant mt-1">
          Aquí puedes ver y eliminar las imágenes subidas a la carpeta de uploads.
        </p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-[48px] text-outline mb-2">image_not_supported</span>
          <p className="font-body-md text-on-surface-variant">No hay imágenes en la carpeta de subidas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((imgUrl, idx) => {
            const filename = imgUrl.split('/').pop();
            return (
              <div key={idx} className="group relative aspect-square bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src={imgUrl} 
                  alt={filename} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => setSelectedImage(imgUrl)}
                    className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-primary hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-lg"
                    title="Ver original"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(imgUrl)}
                    className="w-10 h-10 bg-error rounded-full flex items-center justify-center text-on-error hover:bg-[#ba1a1a] transition-colors shadow-lg"
                    title="Eliminar imagen"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                {/* Filename banner */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-[10px] text-white font-caption truncate" title={filename}>{filename}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4 text-error">
              <span className="material-symbols-outlined text-[32px]">warning</span>
              <h3 className="font-display-sm text-on-surface">Confirmar Eliminación</h3>
            </div>
            
            <p className="font-body-md text-on-surface-variant mb-6">
              ¿Estás seguro que deseas eliminar esta imagen? Esta acción no se puede deshacer.
            </p>

            {imageUsage.loading ? (
              <div className="mb-6 py-4 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-center flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                <span className="font-body-sm text-on-surface-variant">Comprobando si la imagen está en uso...</span>
              </div>
            ) : imageUsage.data?.inUse ? (
              <div className="mb-6 p-4 bg-error-container/20 border border-error/30 rounded-lg">
                <div className="flex items-center gap-2 text-error mb-2">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <h4 className="font-label-md font-bold">¡Cuidado! Esta imagen está en uso</h4>
                </div>
                <p className="font-body-sm text-on-surface-variant mb-2">
                  Si la eliminas, dejará de mostrarse en los siguientes lugares:
                </p>
                <ul className="list-disc pl-5 font-body-sm text-on-surface-variant max-h-32 overflow-y-auto">
                  {imageUsage.data.usages.map((usage, idx) => (
                    <li key={idx} className="mb-1">{usage}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 font-label-md rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={imageUsage.loading}
                className="px-4 py-2 font-label-md rounded-full bg-error text-on-error hover:bg-[#ba1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Eliminar Imagen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          
          <img 
            src={selectedImage} 
            alt="Vista previa" 
            className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default ImageManager;
