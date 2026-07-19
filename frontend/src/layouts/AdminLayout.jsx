import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductManager from '../components/admin/ProductManager';
import CategoryManager from '../components/admin/CategoryManager';
import StoreLayoutManager from '../components/admin/StoreLayoutManager';
import ContactSettingsManager from '../components/admin/ContactSettingsManager';
import ImageManager from '../components/admin/ImageManager';

function AdminLayout({ user }) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ totalRevenue: 0, totalOrders: 0, activeUsers: 0, lowStock: 0 });
  const [staff, setStaff] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = user?.accessToken;
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        const [metricsRes, staffRes, inventoryRes] = await Promise.all([
          fetch('http://localhost:3001/api/admin/metrics', { headers }),
          fetch('http://localhost:3001/api/admin/staff', { headers }),
          fetch('http://localhost:3001/api/admin/inventory', { headers })
        ]);

        if (metricsRes.status === 403 || metricsRes.status === 401) {
          navigate('/');
          return;
        }

        setMetrics(await metricsRes.json());
        setStaff(await staffRes.json());
        setInventory(await inventoryRes.json());
      } catch (err) {
        console.error('Error fetching admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-display-lg text-primary w-full">Cargando Panel...</div>;
  }

  return (
    <div className="bg-background text-on-surface font-body-lg min-h-screen flex flex-col md:flex-row antialiased w-full">
      {/* Mobile Top App Bar */}
      <header className="md:hidden fixed top-0 w-full z-40 bg-surface/70 backdrop-blur-xl flex justify-between items-center px-container-margin-mobile h-16 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-on-surface-variant hover:opacity-80 transition-opacity p-2">
          <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
        <div className="flex items-center">
          <img src="/images/logo/logo_solo_texto.png" alt="Royal Home" className="h-4 object-contain" />
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar Navigation */}
      <aside className={`fixed md:sticky inset-y-0 left-0 flex flex-col w-64 h-screen bg-surface border-r border-outline-variant/30 px-gutter py-section-gap z-50 shrink-0 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex`}>
        <div className="mb-section-gap px-4">
          <div className="flex items-center ml-2 mt-4 mb-4">
            <img src="/images/logo/logo_solo_texto.png" alt="Royal Home" className="h-10 object-contain scale-[4] origin-left" />
          </div>
          <p className="font-caption text-caption text-on-surface-variant mt-2 uppercase tracking-widest">Admin Portal</p>
        </div>
        <nav className="flex flex-col gap-2 flex-1 mt-12 md:mt-0">
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold group transition-colors ${activeTab === 'dashboard' ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary'}`}>
            <span className={`material-symbols-outlined ${activeTab === 'dashboard' ? 'fill' : ''}`}>dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </button>
          <button onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold group transition-colors ${activeTab === 'products' ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary'}`}>
            <span className={`material-symbols-outlined ${activeTab === 'products' ? 'fill' : ''}`}>inventory_2</span>
            <span className="font-label-md text-label-md">Productos</span>
          </button>
          <button onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold group transition-colors ${activeTab === 'categories' ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary'}`}>
            <span className={`material-symbols-outlined ${activeTab === 'categories' ? 'fill' : ''}`}>category</span>
            <span className="font-label-md text-label-md">Categorías</span>
          </button>
          <button onClick={() => { setActiveTab('store_layout'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold group transition-colors ${activeTab === 'store_layout' ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary'}`}>
            <span className={`material-symbols-outlined ${activeTab === 'store_layout' ? 'fill' : ''}`}>web</span>
            <span className="font-label-md text-label-md">Diseño Inicio</span>
          </button>
          <button onClick={() => { setActiveTab('contact_settings'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold group transition-colors ${activeTab === 'contact_settings' ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary'}`}>
            <span className={`material-symbols-outlined ${activeTab === 'contact_settings' ? 'fill' : ''}`}>contact_page</span>
            <span className="font-label-md text-label-md">Redes y Contacto</span>
          </button>
          <button onClick={() => { setActiveTab('images'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold group transition-colors ${activeTab === 'images' ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary'}`}>
            <span className={`material-symbols-outlined ${activeTab === 'images' ? 'fill' : ''}`}>perm_media</span>
            <span className="font-label-md text-label-md">Multimedia</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary transition-colors group">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md">Usuarios</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary transition-colors group">
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="font-label-md text-label-md">Reportes</span>
          </button>
        </nav>
        <div className="mt-auto">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary transition-colors group hidden md:flex">
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-label-md text-label-md">Volver a la Tienda</span>
          </Link>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary transition-colors group border-t border-outline-variant/30 pt-6">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Configuración</span>
          </button>
          <div className="flex items-center gap-3 px-4 mt-6">
            <img src={`https://ui-avatars.com/api/?name=${user.nombre}&background=random`} alt={user.nombre} className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" />
            <div>
              <p className="font-label-md text-label-md text-primary">{user.nombre}</p>
              <p className="font-caption text-caption text-on-surface-variant truncate max-w-[150px]">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-3 bg-surface/95 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:hidden border-t border-outline-variant/30">
        <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center justify-center transition-colors ${activeTab === 'dashboard' ? 'text-primary' : 'text-on-surface-variant opacity-70'}`}>
          <span className={`material-symbols-outlined text-[24px] ${activeTab === 'dashboard' ? 'fill' : ''}`}>dashboard</span>
          <span className="font-label-md text-[10px] uppercase tracking-widest mt-1">Inicio</span>
        </button>
        <Link to="/" className="flex flex-col items-center justify-center transition-colors text-on-surface-variant opacity-70">
          <span className="material-symbols-outlined text-[24px]">storefront</span>
          <span className="font-label-md text-[10px] uppercase tracking-widest mt-1">Tienda</span>
        </Link>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 px-container-margin-mobile md:px-container-margin-desktop pt-24 pb-28 md:py-16 overflow-y-auto w-full">
        {activeTab === 'dashboard' ? (
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary">Overview</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">Monitorea el rendimiento de la tienda y el inventario.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-outline-variant text-primary rounded-full hover:bg-surface-container-low transition-colors font-label-md text-label-md uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Exportar
                </button>
                <button onClick={() => setActiveTab('products')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors font-label-md text-label-md uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Nuevo Producto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-section-gap">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-8">
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Ingresos Totales</p>
                  <span className="material-symbols-outlined text-secondary">payments</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">${Number(metrics.totalRevenue || 0).toLocaleString('es-CL')}</h3>
                </div>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-8">
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Órdenes</p>
                  <span className="material-symbols-outlined text-on-surface-variant">shopping_bag</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">{metrics.totalOrders}</h3>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-8">
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Stock Bajo</p>
                  <span className="material-symbols-outlined text-error">warning</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">{metrics.lowStock} Items</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-section-gap">
              {/* Chart Section */}
              <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-headline-sm text-headline-sm text-primary">Resumen de Ventas</h3>
                  <select className="bg-transparent border-b border-outline-variant/50 pb-1 font-label-md text-label-md text-on-surface-variant focus:outline-none focus:border-primary">
                    <option>Últimos 30 Días</option>
                    <option>Este Año</option>
                  </select>
                </div>
                <div className="flex-1 flex items-end gap-4 h-64 mt-4 border-b border-outline-variant/20 pb-4">
                  <div className="w-full flex justify-between items-end h-full">
                    {/* Fake bars for aesthetics */}
                    <div className="w-1/12 bg-surface-container-highest h-[30%] rounded-t-sm hover:bg-secondary/50 transition-colors relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface font-caption text-caption px-2 py-1 rounded">May</div>
                    </div>
                    <div className="w-1/12 bg-surface-container-highest h-[45%] rounded-t-sm hover:bg-secondary/50 transition-colors relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface font-caption text-caption px-2 py-1 rounded">Jun</div>
                    </div>
                    <div className="w-1/12 bg-surface-container-highest h-[40%] rounded-t-sm hover:bg-secondary/50 transition-colors relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface font-caption text-caption px-2 py-1 rounded">Jul</div>
                    </div>
                    <div className="w-1/12 bg-surface-container-highest h-[60%] rounded-t-sm hover:bg-secondary/50 transition-colors relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface font-caption text-caption px-2 py-1 rounded">Ago</div>
                    </div>
                    <div className="w-1/12 bg-secondary/80 h-[85%] rounded-t-sm hover:bg-secondary transition-colors relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface font-caption text-caption px-2 py-1 rounded">Sep</div>
                    </div>
                    <div className="w-1/12 bg-surface-container-highest h-[55%] rounded-t-sm hover:bg-secondary/50 transition-colors relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface font-caption text-caption px-2 py-1 rounded">Oct</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Staff Section */}
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-6">Staff Access (RBAC)</h3>
                <div className="flex flex-col gap-6 flex-1">
                  {staff.map(s => (
                    <div key={s.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-label-md uppercase">
                          {s.nombre.charAt(0)}{s.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-primary">{s.nombre} {s.apellido}</p>
                          <p className="font-caption text-caption text-on-surface-variant">{s.rol}</p>
                        </div>
                      </div>
                      <span className="font-caption text-caption px-2 py-1 bg-surface-container-high rounded text-on-surface-variant">Full</span>
                    </div>
                  ))}
                </div>
                <button className="mt-6 w-full py-3 border border-outline-variant/50 rounded-full text-on-surface-variant font-label-md text-label-md hover:border-primary hover:text-primary transition-colors">
                  Gestionar Roles
                </button>
              </div>
            </div>

            {/* Inventory List Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-headline-sm text-primary">Estado de Inventario (Solo Lectura)</h3>
                <div className="relative w-64 hidden md:block">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                  <input className="w-full pl-10 pr-4 py-2 bg-transparent border-b border-outline-variant/50 focus:border-primary focus:outline-none font-body-md text-body-md text-primary placeholder:text-on-surface-variant/50 transition-colors" placeholder="Buscar productos..." type="text"/>
                </div>
              </div>
              <div className="overflow-x-hidden md:overflow-visible">
                <table className="w-full text-left border-collapse">
                  <thead className="hidden md:table-header-group">
                    <tr className="border-b border-outline-variant/30 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
                      <th className="py-4 px-4 font-medium">Producto</th>
                      <th className="py-4 px-4 font-medium hidden lg:table-cell">SKU</th>
                      <th className="py-4 px-4 font-medium hidden md:table-cell">Categoría</th>
                      <th className="py-4 px-4 font-medium">Precio</th>
                      <th className="py-4 px-4 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md block md:table-row-group">
                    {inventory.map((item) => (
                      <tr key={item.variante_id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors group flex flex-col md:table-row p-4 md:p-0 relative">
                        <td className="py-2 md:py-4 md:px-4 flex items-center gap-4">
                          <img className="w-16 h-16 md:w-12 md:h-12 object-cover rounded-md border border-outline-variant/20" src={item.imagen_base} alt={item.producto} />
                          <div className="flex flex-col pr-12 md:pr-0">
                            <span className="font-medium text-primary text-headline-sm md:text-body-md">{item.producto}</span>
                            <span className="text-on-surface-variant font-caption text-caption md:hidden mt-1">{item.categoria} • {item.sku}</span>
                          </div>
                        </td>
                        <td className="py-2 px-0 md:py-4 md:px-4 text-on-surface-variant hidden lg:table-cell">{item.sku}</td>
                        <td className="py-2 px-0 md:py-4 md:px-4 text-on-surface-variant hidden md:table-cell">{item.categoria}</td>
                        
                        {/* Contenedor móvil para precio y estado */}
                        <td className="py-2 px-0 md:py-4 md:px-4 flex items-center justify-between md:table-cell">
                          <span className="text-primary font-bold md:font-normal">${item.price}</span>
                          <div className="md:hidden">
                            {item.status === 'In Stock' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333] font-caption text-[11px] uppercase tracking-wider font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#137333]"></span> En Stock ({item.stock})
                              </span>
                            )}
                            {item.status === 'Low Stock' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fef7e0] text-[#b06000] font-caption text-[11px] uppercase tracking-wider font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#b06000]"></span> Stock Bajo ({item.stock})
                              </span>
                            )}
                            {item.status === 'Out of Stock' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fce8e6] text-[#c5221f] font-caption text-[11px] uppercase tracking-wider font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c5221f]"></span> Agotado
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-2 px-0 md:py-4 md:px-4 hidden md:table-cell">
                          {item.status === 'In Stock' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333] font-caption text-[11px] uppercase tracking-wider font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#137333]"></span> En Stock ({item.stock})
                            </span>
                          )}
                          {item.status === 'Low Stock' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fef7e0] text-[#b06000] font-caption text-[11px] uppercase tracking-wider font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#b06000]"></span> Stock Bajo ({item.stock})
                            </span>
                          )}
                          {item.status === 'Out of Stock' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fce8e6] text-[#c5221f] font-caption text-[11px] uppercase tracking-wider font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c5221f]"></span> Agotado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-between items-center text-on-surface-variant font-caption text-caption">
                <p>Mostrando {inventory.length} de {inventory.length} productos</p>
              </div>
            </div>
          </>
        ) : activeTab === 'products' ? (
          <ProductManager user={user} />
        ) : activeTab === 'categories' ? (
          <CategoryManager user={user} />
        ) : activeTab === 'store_layout' ? (
          <StoreLayoutManager user={user} />
        ) : activeTab === 'contact_settings' ? (
          <ContactSettingsManager token={user.accessToken} />
        ) : activeTab === 'images' ? (
          <ImageManager token={user.accessToken} />
        ) : null}
      </main>
    </div>
  );
}

export default AdminLayout;
