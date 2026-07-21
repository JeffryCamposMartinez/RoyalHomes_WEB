import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../contexts/AlertContext';
import AddressForm from './AddressForm';

function Checkout({ cart, clearCart }) {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  
  const [processing, setProcessing] = useState(false);
  
  const [metodoEntrega, setMetodoEntrega] = useState('retiro_fisico');
  const [metodoContacto, setMetodoContacto] = useState('chat_nativo');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const getToken = () => {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr).accessToken : null;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) {
        setLoadingProfile(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          if (data.direcciones && data.direcciones.length > 0) {
            setSelectedAddressId(data.direcciones[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveNewAddress = async (formData) => {
    if (!formData.nombre || !formData.region || !formData.ciudad || !formData.direccion) {
      showAlert('Por favor completa todos los campos obligatorios (*)', 'error');
      return;
    }
    setSavingAddress(true);
    try {
      const token = getToken();
      const newAddress = { id: Date.now(), ...formData };
      const newAddresses = [...(profile?.direcciones || []), newAddress];
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/addresses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ direcciones: newAddresses })
      });
      if (res.ok) {
        setProfile({ ...profile, direcciones: newAddresses });
        setSelectedAddressId(newAddress.id);
        setShowAddressModal(false);
        showAlert('Dirección agregada exitosamente', 'success');
      }
    } catch (err) {
      showAlert('Error al guardar dirección', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (metodoEntrega !== 'retiro_fisico' && !selectedAddressId) {
      showAlert('Por favor, selecciona o agrega una dirección de envío.', 'error');
      return;
    }

    if (metodoContacto === 'whatsapp' && !whatsappNumber.trim()) {
      showAlert('Por favor, ingresa tu número de WhatsApp para poder contactarte.', 'error');
      return;
    }
    
    const selectedAddress = profile?.direcciones?.find(d => d.id === selectedAddressId);
    
    setProcessing(true);
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          items: cart,
          shippingInfo: metodoEntrega === 'retiro_fisico' ? null : selectedAddress,
          total,
          metodo_entrega: metodoEntrega,
          metodo_contacto: metodoContacto,
          whatsapp_contacto: metodoContacto === 'whatsapp' ? whatsappNumber : null
        })
      });

      if (res.ok) {
        const data = await res.json();
        showAlert(`¡Solicitud enviada! Orden #${data.orderId}. El vendedor se pondrá en contacto pronto.`, 'success');
        clearCart();
        navigate('/profile'); // Redirect to profile to see the order
      } else {
        showAlert('Hubo un problema al procesar la orden. Asegúrate de haber iniciado sesión.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de red al procesar la orden.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pt-24 min-h-screen text-center flex flex-col items-center">
        <h2 className="font-display-lg-mobile text-primary mb-8">No hay artículos para pagar</h2>
        <button onClick={() => navigate('/')} className="px-8 py-4 bg-primary text-on-primary rounded-full font-label-md uppercase tracking-widest hover:bg-primary/90 transition-colors">
          Volver al Estudio
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-container-margin-mobile md:px-container-margin-desktop max-w-[1440px] mx-auto min-h-screen">
      <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-12">Finalizar Compra</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Selector de Envío */}
        <div className="flex-[2] bg-surface-container-low p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-8 border-b border-outline-variant/30 pb-4">
            <h2 className="font-headline-md text-headline-md text-primary">Dirección de Envío</h2>
            {metodoEntrega !== 'retiro_fisico' && (
              <button type="button" onClick={() => setShowAddressModal(true)} className="bg-primary text-on-primary px-4 py-2 font-label-md uppercase tracking-widest text-xs rounded hover:opacity-90 transition-opacity">
                Añadir Nueva
              </button>
            )}
          </div>
          
          {metodoEntrega === 'retiro_fisico' ? (
            <div className="text-center py-12 bg-surface rounded-xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-primary mb-3">storefront</span>
              <p className="text-on-surface-variant font-medium">Retiro en nuestra tienda física.</p>
              <p className="text-sm text-on-surface-variant mt-2">Av. Vitacura 2345, Santiago. Coordinaremos el horario de retiro luego de confirmar tu solicitud.</p>
            </div>
          ) : loadingProfile ? (
            <div className="text-center py-8 text-on-surface-variant">Cargando direcciones...</div>
          ) : profile?.direcciones && profile.direcciones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.direcciones.map(d => (
                <div 
                  key={d.id} 
                  onClick={() => setSelectedAddressId(d.id)}
                  className={`border p-5 rounded-xl cursor-pointer transition-all ${selectedAddressId === d.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant/50 bg-surface hover:border-primary/50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-primary uppercase tracking-widest text-sm">{d.nombre || 'Dirección'}</h3>
                    {selectedAddressId === d.id && <span className="material-symbols-outlined text-primary text-xl">check_circle</span>}
                  </div>
                  <p className="font-body-md text-on-surface mb-1">{d.direccion}</p>
                  <p className="text-sm text-on-surface-variant font-medium mb-1">{d.ciudad}{d.region ? `, ${d.region}` : ''}</p>
                  {d.infoAdicional && <p className="text-sm text-on-surface-variant mb-1">{d.infoAdicional}</p>}
                  {d.quienRecibe && <p className="text-sm text-on-surface-variant"><span className="font-bold">Recibe:</span> {d.quienRecibe}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface rounded-xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-3">location_on</span>
              <p className="text-on-surface-variant mb-4">No tienes direcciones guardadas.</p>
              <button type="button" onClick={() => setShowAddressModal(true)} className="bg-primary text-on-primary px-6 py-3 font-label-md uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
                Agregar tu primera dirección
              </button>
            </div>
          )}
          
          {/* Modal for Address */}
          {showAddressModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="p-6 border-b border-outline-variant/30 sticky top-0 bg-surface z-10 flex justify-between items-center">
                  <h2 className="font-label-lg text-primary uppercase tracking-widest font-bold">Agregar Nueva Dirección</h2>
                  <button onClick={() => setShowAddressModal(false)} className="text-on-surface-variant hover:text-error transition-colors bg-surface-variant/20 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <div className="p-6 md:p-8">
                  <AddressForm 
                    onSave={handleSaveNewAddress} 
                    onCancel={() => setShowAddressModal(false)} 
                    saving={savingAddress} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resumen de la Orden y Opciones */}
        <div className="flex-1">
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 shadow-[0_10px_20px_rgba(0,0,0,0.02)]">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-6">Opciones de Entrega</h2>
            
            <div className="flex flex-col gap-3 mb-6">
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${metodoEntrega === 'retiro_fisico' ? 'border-primary bg-primary/5' : 'border-outline-variant/50'}`}>
                <input type="radio" name="entrega" value="retiro_fisico" checked={metodoEntrega === 'retiro_fisico'} onChange={(e) => setMetodoEntrega(e.target.value)} className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-bold text-primary text-sm uppercase tracking-widest block">Retiro en Tienda Física</span>
                  <span className="text-sm text-on-surface-variant block mt-1">Av. Vitacura 2345, Santiago</span>
                </div>
              </label>
              
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${metodoEntrega === 'acordar_vendedor' ? 'border-primary bg-primary/5' : 'border-outline-variant/50'}`}>
                <input type="radio" name="entrega" value="acordar_vendedor" checked={metodoEntrega === 'acordar_vendedor'} onChange={(e) => setMetodoEntrega(e.target.value)} className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-bold text-primary text-sm uppercase tracking-widest block">Acordar Envío con Vendedor</span>
                  <span className="text-sm text-on-surface-variant block mt-1">Coordinaremos la entrega y el costo de envío.</span>
                </div>
              </label>
            </div>

            <h2 className="font-headline-sm text-headline-sm text-primary mb-6 mt-8">Método de Coordinación</h2>
            <p className="text-sm text-on-surface-variant mb-4">El pago se habilitará luego de que coordinemos los detalles del pedido.</p>

            <div className="flex flex-col gap-3 mb-6">
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${metodoContacto === 'whatsapp' ? 'border-[#25D366] bg-[#25D366]/5' : 'border-outline-variant/50'}`}>
                <input type="radio" name="contacto" value="whatsapp" checked={metodoContacto === 'whatsapp'} onChange={(e) => setMetodoContacto(e.target.value)} className="w-4 h-4 text-[#25D366]" />
                <div className="flex-1">
                  <span className="font-bold text-[#25D366] text-sm uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">forum</span> WhatsApp</span>
                </div>
              </label>

              {metodoContacto === 'whatsapp' && (
                <div className="ml-4 mb-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Tu número de WhatsApp *</label>
                  <input type="text" placeholder="+56 9 1234 5678" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-sm focus:border-[#25D366] focus:outline-none transition-colors" />
                </div>
              )}

              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${metodoContacto === 'chat_nativo' ? 'border-primary bg-primary/5' : 'border-outline-variant/50'}`}>
                <input type="radio" name="contacto" value="chat_nativo" checked={metodoContacto === 'chat_nativo'} onChange={(e) => setMetodoContacto(e.target.value)} className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-bold text-primary text-sm uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">chat</span> Chat en la Página</span>
                </div>
              </label>
            </div>

            <div className="h-px bg-outline-variant/30 my-8"></div>

            <h2 className="font-headline-sm text-headline-sm text-primary mb-6">Resumen</h2>
            <div className="flex flex-col gap-4 mb-8">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-outline-variant/20 pb-4">
                  <div className="pr-4">
                    <p className="font-body-md text-primary font-medium">{item.name} <span className="text-on-surface-variant text-sm ml-1">x{item.quantity}</span></p>
                    <p className="font-caption text-caption text-on-surface-variant mt-1">{item.variant}</p>
                  </div>
                  <p className="font-body-md text-primary whitespace-nowrap">${Number(item.price * item.quantity).toLocaleString('es-CL')}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mb-8">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Total a Pagar</p>
              <p className="font-display-lg-mobile text-primary">${Math.round(total).toLocaleString('es-CL')}</p>
            </div>
            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={processing}
              className={`w-full py-4 rounded-full font-label-md text-label-md uppercase tracking-widest transition-all ${processing ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary/90 shadow-md hover:scale-[1.02]'}`}
            >
              {processing ? 'Enviando...' : 'Enviar Solicitud de Compra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
