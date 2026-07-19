import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from '../Icons';

function ContactSettingsManager({ token }) {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    instagram_url: '',
    facebook_url: '',
    whatsapp: '',
    email_contacto: '',
    telefono: '',
    direccion_fisica: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/admin/contact', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setFormData({
            instagram_url: data.instagram_url ? data.instagram_url.replace('https://instagram.com/', '') : '',
            facebook_url: data.facebook_url ? data.facebook_url.replace('https://facebook.com/', '') : '',
            whatsapp: data.whatsapp || '',
            email_contacto: data.email_contacto || '',
            telefono: data.telefono || '',
            direccion_fisica: data.direccion_fisica || ''
          });
        }
      } else {
        showAlert('Error al cargar la configuración de contacto', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de red al cargar configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Prepare data for saving
    let submitData = { ...formData };
    
    // Prepend prefixes if they exist and aren't already full URLs
    if (submitData.instagram_url && !submitData.instagram_url.startsWith('http')) {
      submitData.instagram_url = `https://instagram.com/${submitData.instagram_url.replace('@', '')}`;
    }
    if (submitData.facebook_url && !submitData.facebook_url.startsWith('http')) {
      submitData.facebook_url = `https://facebook.com/${submitData.facebook_url}`;
    }

    try {
      const res = await fetch('http://localhost:3001/api/admin/contact', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(submitData)
      });
      if (res.ok) {
        showAlert('Configuración de contacto guardada', 'success');
      } else {
        showAlert('Error al guardar configuración', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error de red al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-on-surface-variant flex justify-center"><span className="material-symbols-outlined animate-spin mr-2">refresh</span> Cargando...</div>;
  }

  return (
    <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30">
      <div className="mb-8 border-b border-outline-variant/30 pb-4">
        <h2 className="font-headline-sm text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">contact_page</span>
          Redes Sociales y Contacto
        </h2>
        <p className="text-on-surface-variant font-body-md mt-2">Configura los enlaces a tus redes sociales y tu información de contacto principal.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Redes Sociales */}
        <div className="md:col-span-2 mb-2">
          <h3 className="font-label-lg text-primary uppercase tracking-widest border-b border-outline-variant/30 pb-2">Redes Sociales</h3>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-md text-on-surface-variant uppercase tracking-widest">URL de Instagram</label>
          <div className="flex items-center bg-surface-container-lowest rounded-lg border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors overflow-hidden pl-4 pr-3 py-3">
            <InstagramIcon className="w-5 h-5 text-on-surface-variant mr-3" />
            <span className="text-on-surface-variant whitespace-nowrap text-sm font-medium">https://instagram.com/</span>
            <input 
              type="text" 
              name="instagram_url" 
              value={formData.instagram_url} 
              onChange={handleChange} 
              placeholder="tu_tienda"
              className="w-full bg-transparent outline-none text-on-surface"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-md text-on-surface-variant uppercase tracking-widest">URL de Facebook</label>
          <div className="flex items-center bg-surface-container-lowest rounded-lg border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors overflow-hidden pl-4 pr-3 py-3">
            <FacebookIcon className="w-5 h-5 text-on-surface-variant mr-3" />
            <span className="text-on-surface-variant whitespace-nowrap text-sm font-medium">https://facebook.com/</span>
            <input 
              type="text" 
              name="facebook_url" 
              value={formData.facebook_url} 
              onChange={handleChange} 
              placeholder="tu_tienda"
              className="w-full bg-transparent outline-none text-on-surface"
            />
          </div>
        </div>

        {/* Contacto Directo */}
        <div className="md:col-span-2 mt-6 mb-2">
          <h3 className="font-label-lg text-primary uppercase tracking-widest border-b border-outline-variant/30 pb-2">Contacto Directo</h3>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-md text-on-surface-variant uppercase tracking-widest">WhatsApp</label>
          <div className="relative">
            <WhatsAppIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input 
              type="text" 
              name="whatsapp" 
              value={formData.whatsapp} 
              onChange={handleChange} 
              placeholder="+56912345678"
              className="w-full bg-surface-container-lowest p-3 pl-12 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-md text-on-surface-variant uppercase tracking-widest">Email de Contacto</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-[20px]">mail</span>
            <input 
              type="email" 
              name="email_contacto" 
              value={formData.email_contacto} 
              onChange={handleChange} 
              placeholder="contacto@tutienda.com"
              className="w-full bg-surface-container-lowest p-3 pl-12 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label-md text-on-surface-variant uppercase tracking-widest">Teléfono Fijo / Comercial</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-[20px]">call</span>
            <input 
              type="text" 
              name="telefono" 
              value={formData.telefono} 
              onChange={handleChange} 
              placeholder="+5622345678"
              className="w-full bg-surface-container-lowest p-3 pl-12 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-label-md text-on-surface-variant uppercase tracking-widest">Dirección Física</label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-on-surface-variant material-symbols-outlined text-[20px]">location_on</span>
            <textarea 
              name="direccion_fisica" 
              value={formData.direccion_fisica} 
              onChange={handleChange} 
              placeholder="Av. Providencia 1234, Santiago, Chile"
              rows="3"
              className="w-full bg-surface-container-lowest p-3 pl-12 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
            ></textarea>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end mt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors font-label-lg tracking-widest uppercase disabled:opacity-50"
          >
            {saving ? <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span> : <span className="material-symbols-outlined text-[20px]">save</span>}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ContactSettingsManager;
