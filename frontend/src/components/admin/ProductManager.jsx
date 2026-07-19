import React, { useState, useEffect } from 'react';
import ProductFormModal from './ProductFormModal';
import { useAlert } from '../../contexts/AlertContext';

export default function ProductManager({ user }) {
  const { showAlert, showConfirm } = useAlert();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('http://localhost:3001/api/products'),
        fetch('http://localhost:3001/api/products/categories')
      ]);
      setProducts(await prodRes.json());
      setCategories(await catRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const isConfirmed = await showConfirm('¿Seguro que deseas eliminar este producto? Se eliminarán también todas sus variantes.');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3001/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        showAlert(data.message || 'Error al eliminar', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de red al eliminar el producto', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="font-headline-sm text-headline-sm text-primary">Catálogo de Productos Base</h3>
        <button 
          onClick={() => { setSelectedProduct(null); setModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors font-label-md text-label-md uppercase tracking-widest w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo Producto
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="overflow-hidden md:overflow-visible">
            <table className="w-full text-left border-collapse block md:table">
              <thead className="bg-surface-container-low hidden md:table-header-group">
                <tr className="border-b border-outline-variant/30 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
                  <th className="py-4 px-4 font-medium">Producto</th>
                  <th className="py-4 px-4 font-medium">Categoría</th>
                  <th className="py-4 px-4 font-medium">Precio Base</th>
                  <th className="py-4 px-4 font-medium">Variantes</th>
                  <th className="py-4 px-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md block md:table-row-group w-full">
                {products.map(p => (
                  <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors flex flex-col md:table-row p-4 md:p-0 relative w-full block md:table-row">
                    <td className="py-2 md:py-4 px-0 md:px-4 flex items-center gap-4 pr-20 md:pr-4 overflow-hidden w-full block md:table-cell">
                      <img className="w-16 h-16 md:w-12 md:h-12 object-cover rounded-md border border-outline-variant/20 shrink-0" src={p.image} alt={p.name} />
                      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                        <span className="font-medium text-primary text-base md:text-body-md leading-tight truncate w-full block">{p.name}</span>
                        <span className="text-on-surface-variant font-caption text-[11px] md:hidden mt-1 truncate block">{p.category} • {p.variantes?.length || 0} Variantes</span>
                      </div>
                    </td>
                    <td className="py-2 px-0 md:py-4 md:px-4 text-on-surface-variant hidden md:table-cell">{p.category}</td>
                    <td className="py-1 px-0 md:py-4 md:px-4 text-primary font-bold md:font-normal block md:table-cell text-lg md:text-base">${Number(p.price).toLocaleString('es-CL')}</td>
                    <td className="py-2 px-0 md:py-4 md:px-4 hidden md:table-cell">
                      <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-label-md text-[11px]">{p.variantes?.length || 0}</span>
                    </td>
                    <td className="py-2 px-0 md:py-4 md:px-4 text-right absolute top-4 right-2 md:relative md:top-auto md:right-auto flex gap-1 justify-end">
                      <button onClick={() => { setSelectedProduct(p); setModalOpen(true); }} className="text-on-surface-variant hover:text-primary transition-colors p-2 md:p-2 bg-surface/80 rounded-full md:bg-transparent shadow-sm md:shadow-none">
                        <span className="material-symbols-outlined text-[18px] md:text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-on-surface-variant hover:text-error transition-colors p-2 md:p-2 bg-surface/80 rounded-full md:bg-transparent shadow-sm md:shadow-none">
                        <span className="material-symbols-outlined text-[18px] md:text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <ProductFormModal 
          product={selectedProduct} 
          categories={categories}
          user={user}
          onClose={() => setModalOpen(false)} 
          onRefresh={fetchData} 
        />
      )}
    </div>
  );
}
