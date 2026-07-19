import React, { useState, useEffect } from 'react';

function AddressForm({ initialData, onSave, onCancel, saving, buttonText = 'Guardar' }) {
  const [form, setForm] = useState(initialData || { nombre: '', region: '', ciudad: '', direccion: '', infoAdicional: '', quienRecibe: '' });
  
  // API Data State (Regions)
  const [apiData, setApiData] = useState([]);
  const [loadingApi, setLoadingApi] = useState(false);

  // Autocomplete state (Nominatim)
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch Regions
  useEffect(() => {
    if (apiData.length === 0) {
      setLoadingApi(true);
      fetch('https://gist.githubusercontent.com/juanbrujo/0fd2f4d126b3ce5a95a7dd1f28b3d8dd/raw/b8575eb82dce974fd2647f46819a7568278396bd/comunas-regiones.json')
        .then(res => res.json())
        .then(data => {
          setApiData(data.regiones);
        })
        .catch(err => {
          console.error("Error fetching regions:", err);
        })
        .finally(() => setLoadingApi(false));
    }
  }, [apiData.length]);

  // Derive available comunas based on selected region
  const availableComunas = form.region 
    ? apiData.find(r => r.region === form.region)?.comunas || [] 
    : [];

  // Debounced fetch for OpenStreetMap Nominatim
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (form.direccion.length < 3 || !showSuggestions) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const querySuffix = form.ciudad ? `, ${form.ciudad}, Chile` : '';
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.direccion + querySuffix)}&countrycodes=cl&limit=5`);
        const data = await res.json();
        const uniqueData = data.filter((v, i, a) => a.findIndex(t => (t.display_name === v.display_name)) === i);
        setSuggestions(uniqueData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [form.direccion, form.ciudad, showSuggestions]);

  const selectAddress = (addrName) => {
    const cleanAddr = addrName.split(',')[0].trim();
    setForm({ ...form, direccion: cleanAddr });
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 mx-auto w-full">
      <div className="relative pt-2">
        <label className="flex flex-col gap-1 relative">
          <span className="text-xs text-on-surface-variant uppercase tracking-widest absolute -top-2 left-3 bg-surface px-1 z-10">Nombre de la dirección *</span>
          <input 
            type="text" 
            required 
            value={form.nombre} 
            onChange={e => setForm({...form, nombre: e.target.value})} 
            placeholder="Ej: Mi casa, Oficina, Casa de mamá"
            className="w-full bg-surface p-3 pt-4 rounded-lg border border-outline-variant focus:border-primary outline-none font-body-md relative z-0" 
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <label className="flex flex-col gap-1 relative">
          <span className="text-xs text-on-surface-variant uppercase tracking-widest absolute -top-2 left-3 bg-surface px-1 z-10">Región *</span>
          <div className="relative">
            <select 
              required 
              disabled={loadingApi}
              value={form.region} 
              onChange={e => setForm({...form, region: e.target.value, ciudad: ''})} 
              className="w-full bg-surface p-3 pt-4 rounded-lg border border-outline-variant focus:border-primary outline-none font-body-md appearance-none relative z-0"
            >
              <option value="">{loadingApi ? 'Cargando...' : 'Selecciona una región'}</option>
              {apiData.map((r, idx) => (
                <option key={idx} value={r.region}>{r.region}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-0">expand_more</span>
          </div>
        </label>

        <label className="flex flex-col gap-1 relative">
          <span className="text-xs text-on-surface-variant uppercase tracking-widest absolute -top-2 left-3 bg-surface px-1 z-10">Ciudad / Comuna *</span>
          <div className="relative">
            <select 
              required 
              disabled={!form.region || loadingApi}
              value={form.ciudad} 
              onChange={e => setForm({...form, ciudad: e.target.value})} 
              className="w-full bg-surface p-3 pt-4 rounded-lg border border-outline-variant focus:border-primary outline-none font-body-md appearance-none relative z-0"
            >
              <option value="">Selecciona una ciudad</option>
              {availableComunas.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-0">expand_more</span>
          </div>
        </label>
      </div>

      <div className="relative pt-2">
        <label className="flex flex-col gap-1 relative">
          <span className="text-xs text-on-surface-variant uppercase tracking-widest absolute -top-2 left-3 bg-surface px-1 z-10">Dirección (Calle y Número) *</span>
          <input 
            type="text" 
            name="fake-address-field-to-disable-autofill"
            required 
            autoComplete="new-password"
            value={form.direccion} 
            onChange={e => {
              setForm({...form, direccion: e.target.value});
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ej: Av. Providencia 1234"
            className="w-full bg-surface p-3 pt-4 rounded-lg border border-outline-variant focus:border-primary outline-none font-body-md relative z-0" 
          />
        </label>
        
        {showSuggestions && (form.direccion.length >= 3) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-outline-variant/50 rounded-lg shadow-lg z-20 overflow-hidden">
            {loadingSuggestions ? (
              <div className="p-3 text-sm text-on-surface-variant">Buscando...</div>
            ) : suggestions.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <li 
                    key={idx} 
                    onClick={() => selectAddress(s.display_name)}
                    className="p-3 hover:bg-surface-variant/30 cursor-pointer text-sm border-b border-outline-variant/10 last:border-0"
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-sm text-on-surface-variant">No se encontraron sugerencias</div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <label className="flex flex-col gap-1 relative">
          <span className="text-xs text-on-surface-variant uppercase tracking-widest absolute -top-2 left-3 bg-surface px-1 z-10">Información adicional (ej: dpto. 201)</span>
          <input type="text" placeholder="Ingrese un valor" value={form.infoAdicional} onChange={e => setForm({...form, infoAdicional: e.target.value})} className="w-full bg-surface p-3 pt-4 rounded-lg border border-outline-variant focus:border-primary outline-none font-body-md relative z-0" />
        </label>
        
        <label className="flex flex-col gap-1 relative">
          <span className="text-xs text-on-surface-variant uppercase tracking-widest absolute -top-2 left-3 bg-surface px-1 z-10">¿Quién recibe?</span>
          <input type="text" placeholder="Ingrese un nombre" value={form.quienRecibe} onChange={e => setForm({...form, quienRecibe: e.target.value})} className="w-full bg-surface p-3 pt-4 rounded-lg border border-outline-variant focus:border-primary outline-none font-body-md relative z-0" />
        </label>
      </div>

      <div className="flex gap-4 mt-4">
        <button type="button" onClick={onCancel} className="bg-surface text-on-surface border border-outline-variant py-2 px-6 rounded font-label-md uppercase tracking-widest hover:bg-surface-variant/20 transition-colors">Cancelar</button>
        <button type="submit" disabled={saving} className="bg-[#B91C1C] text-white py-2 px-6 rounded font-label-md uppercase tracking-widest hover:bg-[#991B1B] transition-colors">{saving ? 'Guardando...' : buttonText}</button>
      </div>
    </form>
  );
}

export default AddressForm;
