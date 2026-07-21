import React, { useState, useEffect, useRef } from 'react';
import { useAlert } from '../contexts/AlertContext';
import AdSenseBlock from '../components/AdSenseBlock';
import { io } from 'socket.io-client';

function Profile({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('datos'); // 'datos', 'direcciones', 'compras'
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/profile`, { headers: { 'Authorization': `Bearer ${user.accessToken}` } }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders/my-orders`, { headers: { 'Authorization': `Bearer ${user.accessToken}` } })
        ]);
        
        if (profileRes.ok) setProfileData(await profileRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        showAlert('Error al cargar la información', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.accessToken, showAlert]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading || !profileData) {
    return (
      <div className="pt-24 min-h-screen bg-background flex items-center justify-center">
        <p className="font-label-lg uppercase tracking-widest text-on-surface-variant">Cargando tu espacio...</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-container-margin-mobile md:px-container-margin-desktop min-h-[calc(100vh-100px)] bg-background">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('datos')}
              className={`flex items-center gap-3 w-full text-left p-4 rounded-xl font-label-md uppercase tracking-widest transition-colors ${activeTab === 'datos' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              Mis datos
            </button>
            <button 
              onClick={() => setActiveTab('direcciones')}
              className={`flex items-center gap-3 w-full text-left p-4 rounded-xl font-label-md uppercase tracking-widest transition-colors ${activeTab === 'direcciones' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
            >
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              Mis direcciones
            </button>
            <button 
              onClick={() => setActiveTab('compras')}
              className={`flex items-center gap-3 w-full text-left p-4 rounded-xl font-label-md uppercase tracking-widest transition-colors ${activeTab === 'compras' ? 'bg-primary/5 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              Mis compras
            </button>
            <div className="h-px bg-outline-variant/30 my-2"></div>
            <a 
              href="/"
              className="flex items-center gap-3 w-full text-left p-4 rounded-xl font-label-md uppercase tracking-widest text-on-surface-variant hover:bg-surface-variant/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              Volver a la tienda
            </a>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full text-left p-4 rounded-xl font-label-md uppercase tracking-widest text-error hover:bg-error/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Cerrar Sesión
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'datos' && <MisDatos profile={profileData} setProfile={setProfileData} user={user} onUpdateUser={onUpdateUser} showAlert={showAlert} />}
          {activeTab === 'direcciones' && <MisDirecciones profile={profileData} setProfile={setProfileData} user={user} showAlert={showAlert} />}
          {activeTab === 'compras' && <MisCompras orders={orders} user={user} />}
        </main>

      </div>

        {/* Ad Placeholder */}
        <div className="hidden md:flex w-full justify-center mb-8">
          <div className="w-full max-w-[970px] min-h-[90px] md:min-h-[250px] bg-surface rounded flex items-center justify-center overflow-hidden">
            <AdSenseBlock slot="8250857236" />
          </div>
        </div>
    </div>
  );
}

// ================= UTILS =================
const formatRUT = (rut) => {
  if (!rut) return '';
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  let body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${dv}`;
};

const validateRUT = (rut) => {
  if (!rut) return true; // Optional field
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDv = 11 - (sum % 11);
  const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();
  
  return dv === calculatedDv;
};

const formatPhone = (phone) => {
  if (!phone) return '';
  const clean = phone.replace(/[^\d+]/g, '');
  // Simple Chilean formatting if starts with +569 or 9
  if (clean.startsWith('+569') && clean.length > 4) {
    const rest = clean.slice(4);
    return `+56 9 ${rest.slice(0,4)} ${rest.slice(4,8)}`.trim();
  } else if (clean.startsWith('9') && clean.length > 1) {
    const rest = clean.slice(1);
    return `+56 9 ${rest.slice(0,4)} ${rest.slice(4,8)}`.trim();
  }
  return clean;
};

// ================= MIS DATOS =================
function MisDatos({ profile, setProfile, user, onUpdateUser, showAlert }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: profile.nombre || '',
    apellido: profile.apellido || '',
    email: profile.email || '',
    rut: formatRUT(profile.rut) || '',
    fecha_nacimiento: profile.fecha_nacimiento || '',
    telefono: formatPhone(profile.telefono) || '',
    password: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'rut') value = formatRUT(value);
    if (name === 'telefono') value = formatPhone(value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rut && !validateRUT(formData.rut)) {
      showAlert('El RUT ingresado no es válido.', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        showAlert('Datos actualizados exitosamente', 'success');
        setProfile({ ...profile, ...formData, password: '' });
        
        // Update App state
        const updatedUser = { ...user, nombre: `${formData.nombre} ${formData.apellido}`.trim(), email: formData.email };
        onUpdateUser(updatedUser);
        
        // Update Storage
        const stored = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : JSON.parse(sessionStorage.getItem('user'));
        if (stored) {
          stored.nombre = updatedUser.nombre;
          stored.email = updatedUser.email;
          localStorage.getItem('user') ? localStorage.setItem('user', JSON.stringify(stored)) : sessionStorage.setItem('user', JSON.stringify(stored));
        }
        
        setFormData(prev => ({ ...prev, password: '' }));
        setIsEditing(false);
      } else {
        showAlert(data.message || 'Error al actualizar', 'error');
      }
    } catch (err) {
      showAlert('Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-outline-variant/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display-sm text-primary">Editar Perfil</h2>
          <button onClick={() => setIsEditing(false)} className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col gap-2">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Nombre</span>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="bg-surface p-3 rounded-lg border border-outline-variant focus:border-primary outline-none" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Apellido</span>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required className="bg-surface p-3 rounded-lg border border-outline-variant focus:border-primary outline-none" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Email</span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="bg-surface p-3 rounded-lg border border-outline-variant focus:border-primary outline-none" />
            </label>
            <label className="flex flex-col gap-2 relative">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">RUT</span>
              <input type="text" name="rut" value={formData.rut} onChange={handleChange} className={`bg-surface p-3 rounded-lg border ${formData.rut && !validateRUT(formData.rut) ? 'border-error/50 focus:border-error' : 'border-outline-variant focus:border-primary'} outline-none font-body-md transition-colors`} placeholder="Ej: 12.345.678-9" maxLength="12" />
              {formData.rut && !validateRUT(formData.rut) && (
                <span className="text-error text-xs absolute -bottom-5 left-0">RUT inválido</span>
              )}
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Fecha de nacimiento</span>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="bg-surface p-3 rounded-lg border border-outline-variant focus:border-primary outline-none font-body-md" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Teléfono</span>
              <div className="relative">
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full bg-surface p-3 rounded-lg border border-outline-variant focus:border-primary outline-none font-body-md" placeholder="+56 9 1234 5678" maxLength="15" />
              </div>
            </label>
          </div>
          <div className="pt-6 border-t border-outline-variant/30 mt-2">
            <label className="flex flex-col gap-2 max-w-md">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Nueva Contraseña (Opcional)</span>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Dejar en blanco para no cambiar" className="bg-surface p-3 rounded-lg border border-outline-variant focus:border-primary outline-none" />
            </label>
          </div>
          <div className="flex gap-4 mt-4">
            <button type="submit" disabled={saving} className="bg-primary text-on-primary py-3 px-6 font-label-md uppercase tracking-widest hover:opacity-90 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-surface-variant text-on-surface px-6 font-label-md uppercase tracking-widest hover:bg-outline-variant/30">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Display Mode
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 bg-surface-container-lowest">
        <h2 className="font-label-lg text-primary uppercase tracking-widest font-bold">Perfil</h2>
        <button 
          onClick={() => setIsEditing(true)}
          className="bg-primary text-on-primary px-5 py-2 font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Editar datos
        </button>
      </div>
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div>
            <p className="font-label-md text-on-surface-variant uppercase tracking-widest mb-1">Nombre</p>
            <p className="font-body-lg text-primary">{profile.nombre || <span className="text-outline-variant text-sm">Sin dato</span>}</p>
          </div>
          <div>
            <p className="font-label-md text-on-surface-variant uppercase tracking-widest mb-1">Apellido</p>
            <p className="font-body-lg text-primary">{profile.apellido || <span className="text-outline-variant text-sm">Sin dato</span>}</p>
          </div>
          <div>
            <p className="font-label-md text-on-surface-variant uppercase tracking-widest mb-1">Email</p>
            <p className="font-body-lg text-primary">{profile.email || <span className="text-outline-variant text-sm">Sin dato</span>}</p>
          </div>
          <div>
            <p className="font-label-md text-on-surface-variant uppercase tracking-widest mb-1">RUT</p>
            <p className="font-body-lg text-primary">{profile.rut || <span className="text-outline-variant text-sm">Sin dato</span>}</p>
          </div>
          <div>
            <p className="font-label-md text-on-surface-variant uppercase tracking-widest mb-1">Fecha de nacimiento</p>
            <p className="font-body-lg text-primary">{profile.fecha_nacimiento || <span className="text-outline-variant text-sm">Sin dato</span>}</p>
          </div>
          <div>
            <p className="font-label-md text-on-surface-variant uppercase tracking-widest mb-1">Teléfono</p>
            <p className="font-body-lg text-primary">{profile.telefono || <span className="text-outline-variant text-sm">Sin dato</span>}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= MIS DIRECCIONES =================
import AddressForm from '../components/AddressForm';

function MisDirecciones({ profile, setProfile, user, showAlert }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [direcciones, setDirecciones] = useState(profile.direcciones || []);
  const [saving, setSaving] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const saveAddresses = async (newAddresses) => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/addresses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.accessToken}` },
        body: JSON.stringify({ direcciones: newAddresses })
      });
      if (res.ok) {
        setDirecciones(newAddresses);
        setProfile({ ...profile, direcciones: newAddresses });
        setIsAdding(false);
        setEditingId(null);
        setDeleteConfirmId(null);
        setEditingData(null);
        showAlert('Direcciones actualizadas', 'success');
      }
    } catch (err) {
      showAlert('Error guardando dirección', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveForm = (formData) => {
    if (!formData.nombre || !formData.region || !formData.ciudad || !formData.direccion) {
      showAlert('Por favor completa todos los campos obligatorios (*)', 'error');
      return;
    }
    
    let newAddresses;
    if (editingId) {
      newAddresses = direcciones.map(d => d.id === editingId ? { ...formData, id: editingId } : d);
    } else {
      const newAddress = { id: Date.now(), ...formData };
      newAddresses = [...direcciones, newAddress];
    }
    saveAddresses(newAddresses);
  };

  const handleEdit = (addr) => {
    setEditingData({
      nombre: addr.nombre || '',
      region: addr.region || '',
      ciudad: addr.ciudad || '',
      direccion: addr.direccion || '',
      infoAdicional: addr.infoAdicional || '',
      quienRecibe: addr.quienRecibe || ''
    });
    setEditingId(addr.id);
    setDeleteConfirmId(null);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    saveAddresses(direcciones.filter(d => d.id !== id));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditingData(null);
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 min-h-[400px]">
      <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 bg-surface-container-lowest rounded-t-2xl">
        <h2 className="font-label-lg text-primary uppercase tracking-widest font-bold">Mis Direcciones</h2>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="bg-primary text-on-primary px-4 py-2 font-label-md uppercase tracking-widest text-xs hover:opacity-90">
            Añadir Nueva
          </button>
        )}
      </div>
      
      <div className="p-6 md:p-8 flex flex-col h-full">
        {isAdding ? (
          <div className="mt-4">
            <AddressForm 
              initialData={editingData} 
              onSave={handleSaveForm} 
              onCancel={handleCancel} 
              saving={saving}
              buttonText={editingId ? 'Actualizar' : 'Guardar'}
            />
          </div>
        ) : direcciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
            <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4 font-light">map</span>
            <p className="font-body-md text-on-surface-variant mb-6">Agrega tus direcciones para agilizar tu proceso de compra</p>
            <button onClick={() => setIsAdding(true)} className="bg-primary text-on-primary px-6 py-3 font-label-md uppercase tracking-widest hover:opacity-90">
              Agregar dirección
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {direcciones.map(d => (
              <div key={d.id} className="border border-outline-variant/50 p-5 rounded-xl bg-surface-container-low flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-primary mb-1 uppercase tracking-widest text-sm">{d.nombre || 'Dirección'}</h3>
                  <p className="font-body-md text-on-surface mb-1">{d.direccion}</p>
                  <p className="text-sm text-on-surface-variant font-medium mb-1">{d.ciudad}{d.region ? `, ${d.region}` : ''}</p>
                  {d.infoAdicional && <p className="text-sm text-on-surface-variant mb-1">{d.infoAdicional}</p>}
                  {d.quienRecibe && <p className="text-sm text-on-surface-variant"><span className="font-bold">Recibe:</span> {d.quienRecibe}</p>}
                </div>
                <div className="flex gap-3 items-start">
                  {deleteConfirmId === d.id ? (
                    <div className="flex gap-2 items-center bg-error-container/20 px-3 py-1 rounded-full border border-error/30">
                      <span className="text-xs font-bold text-error uppercase">¿Eliminar?</span>
                      <button onClick={() => handleDelete(d.id)} className="text-error font-bold hover:underline text-sm">Sí</button>
                      <span className="text-outline-variant">|</span>
                      <button onClick={() => setDeleteConfirmId(null)} className="text-on-surface-variant font-bold hover:underline text-sm">No</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(d)} className="text-on-surface-variant hover:text-primary transition-colors" title="Editar">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button onClick={() => setDeleteConfirmId(d.id)} className="text-error opacity-70 hover:opacity-100 transition-opacity" title="Eliminar">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MisCompras({ orders, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { showAlert } = useAlert();

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchTerm)
  );

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token: user.accessToken }
    });

    newSocket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('trato_actualizado', (pedido) => {
      if (selectedOrder && selectedOrder.id === pedido.id) {
        setSelectedOrder(prev => ({ ...prev, ...pedido }));
      }
      showAlert('El estado del trato ha sido actualizado', 'info');
    });

    newSocket.on('trato_cerrado_completado', () => {
      showAlert('¡El trato se ha cerrado y el pago está habilitado!', 'success');
      setTimeout(() => window.location.reload(), 2000);
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [user.accessToken, showAlert, selectedOrder]);

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    if (socket) {
      socket.emit('join_order_room', order.id);
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders/${order.id}/chat`, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedOrder) return;
    socket.emit('send_message', {
      pedidoId: selectedOrder.id,
      mensaje: newMessage,
      remitenteId: user.id
    });
    setNewMessage('');
  };

  const handleCerrarTrato = async () => {
    if (!socket || !selectedOrder) return;
    socket.emit('cerrar_trato', { pedidoId: selectedOrder.id, rolId: user.rol_id });
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden flex flex-col md:flex-row h-[600px] shadow-sm">
      {/* Sidebar - Orders List */}
      <div className="w-full md:w-1/3 border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest">
        <div className="p-4 border-b border-outline-variant/30 bg-surface">
          <h2 className="font-bold text-primary mb-2">Mis Compras</h2>
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar # orden..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded border border-outline-variant text-sm focus:border-primary outline-none bg-surface"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-sm">No hay compras.</div>
          ) : (
            filteredOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => handleSelectOrder(order)}
                className={`p-4 border-b border-outline-variant/10 cursor-pointer transition-colors hover:bg-surface-container-low ${selectedOrder?.id === order.id ? 'bg-surface-container-low border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-primary text-sm">Orden #{order.id}</h3>
                    <span className="text-xs text-on-surface-variant">{new Date(order.creado_en).toLocaleDateString()}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">${Number(order.total).toLocaleString('es-CL')}</span>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-variant text-on-surface-variant">
                    {order.estado}
                  </span>
                  {order.metodo_contacto === 'chat_nativo' && (
                    <span className="material-symbols-outlined text-[16px] text-primary">chat</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Chat & Details */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest">
        {selectedOrder ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-outline-variant/30 bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="font-bold text-primary text-lg">Orden #{selectedOrder.id}</h2>
                <span className="text-sm text-on-surface-variant font-medium">Estado: {selectedOrder.estado}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedOrder.estado_id === 5 && selectedOrder.metodo_contacto === 'chat_nativo' && (
                  <button 
                    onClick={handleCerrarTrato}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-bold transition-colors ${selectedOrder.cliente_acepto_trato ? 'bg-[#137333] text-white' : 'bg-primary text-on-primary hover:opacity-90'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">handshake</span>
                    {selectedOrder.cliente_acepto_trato ? 'Trato Aceptado' : 'Aceptar Trato'}
                  </button>
                )}
                {selectedOrder.metodo_contacto === 'whatsapp' && (
                  <span className="text-sm font-bold text-[#25D366] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">forum</span>
                    Acordando por WhatsApp
                  </span>
                )}
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-[#fff9c4] text-[#b06000] p-2 text-center text-xs font-medium border-b border-[#ffe082] shrink-0">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">security</span>
              Chat oficial de Royal Homes. Recuerda que no solicitaremos contraseñas ni datos de tarjetas por este medio.
            </div>

            {/* Resumen Productos (Collapsible or small list) */}
            <div className="bg-surface p-3 border-b border-outline-variant/30 flex gap-2 overflow-x-auto items-center shrink-0">
              <span className="text-xs font-bold text-on-surface-variant mr-2">Productos:</span>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-surface-container-lowest rounded p-1 border border-outline-variant/20 shrink-0">
                  <div className="w-8 h-8 rounded overflow-hidden">
                     {item.imagen_principal && <img src={item.imagen_principal.startsWith('http') ? item.imagen_principal : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${item.imagen_principal}`} alt="prod" className="w-full h-full object-cover" />}
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-primary truncate max-w-[100px]">{item.nombre}</p>
                    <p className="text-on-surface-variant">x{item.cantidad}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, idx) => {
                const isMe = msg.remitente_id === user.id;
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${isMe ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface text-on-surface rounded-tl-sm border border-outline-variant/20'}`}>
                      <p className="text-sm font-body-md whitespace-pre-wrap">{msg.mensaje}</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant mt-1 font-caption">
                      {new Date(msg.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            {selectedOrder.metodo_contacto === 'chat_nativo' && (
              <div className="p-3 bg-surface border-t border-outline-variant/30 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-full px-4 py-2 text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-sm"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant opacity-50 p-8 text-center">
            <span className="material-symbols-outlined text-[64px] mb-4 font-light">forum</span>
            <p className="font-label-lg uppercase tracking-widest">Selecciona una orden para ver detalles</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
