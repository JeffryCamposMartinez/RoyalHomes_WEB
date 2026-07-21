import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAlert } from '../contexts/AlertContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

function Register() {
  const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        sessionStorage.setItem('user', JSON.stringify(data));
        if (data.rol_id === 1) navigate('/admin');
        else navigate('/');
      } else {
        showAlert(data.message || 'Error con Google Sign-In', 'error');
        setError(data.message || 'Error con Google Sign-In');
      }
    } catch (err) {
      console.error(err);
      showAlert('Autenticación con Google cancelada o fallida.', 'error');
      setError('Autenticación con Google cancelada o fallida.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim() || !formData.password.trim()) {
      showAlert('Por favor completa todos los campos.', 'error');
      setError('Por favor completa todos los campos.');
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        showAlert('Registro exitoso. Ahora inicia sesión.', 'success');
        navigate('/login');
      } else {
        showAlert(data.message || 'Error al registrar', 'error');
        setError(data.message || 'Error al registrar');
      }
    } catch (err) {
      showAlert('Error de conexión', 'error');
      setError('Error de conexión');
    }
  };

  const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-16 pb-16 px-container-margin-mobile relative">
      
      <div className="absolute top-0 left-0 w-full p-6 px-container-margin-mobile md:px-container-margin-desktop flex justify-between items-center">
        <div></div>
        <Link to="/" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">storefront</span>
          <span className="font-label-md text-sm hidden sm:inline">Volver a la Tienda</span>
        </Link>
      </div>

      <div className="bg-surface-container-low p-10 rounded-2xl w-full max-w-md shadow-[0_20px_40px_rgba(0,0,0,0.04)] mt-8">
        <div className="flex justify-center mb-10 mt-4">
          <img src="/images/logo/logo_completo_negro.png" alt="Royal Home" className="h-32 object-contain scale-[2]" />
        </div>
        <h1 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-8 text-center">Crear cuenta</h1>
        {error && <div className="text-error bg-error-container p-4 rounded-lg mb-6 font-body-md text-center">{error}</div>}
        
        <form onSubmit={handleRegister} className="flex flex-col gap-6" noValidate>
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Nombre</label>
            <input type="text" name="nombre" required onChange={handleChange} className="bg-surface p-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none transition-colors font-body-md" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Apellido</label>
            <input type="text" name="apellido" required onChange={handleChange} className="bg-surface p-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none transition-colors font-body-md" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Correo Electrónico</label>
            <input type="email" name="email" required onChange={handleChange} className="bg-surface p-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none transition-colors font-body-md" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Contraseña</label>
            <input type="password" name="password" required onChange={handleChange} className="bg-surface p-4 rounded-lg border border-outline-variant focus:border-primary focus:ring-0 outline-none transition-colors font-body-md" />
          </div>

          <button type="submit" className="mt-4 w-full py-4 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest hover:bg-primary/90 transition-colors">
            Registrarse
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center">
          <div className="w-full flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-outline-variant"></div>
            <span className="font-label-md text-on-surface-variant uppercase tracking-widest text-xs">O continuar con</span>
            <div className="flex-1 h-px bg-outline-variant"></div>
          </div>
          
          <button 
            onClick={handleGoogleLogin} 
            type="button" 
            className="w-full py-4 bg-surface flex items-center justify-center gap-3 border border-outline-variant hover:bg-surface-variant/50 transition-colors rounded-lg font-label-md text-label-md text-on-surface uppercase tracking-widest"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google
          </button>
        </div>

        <p className="mt-8 text-center font-body-md text-on-surface-variant">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary font-medium hover:opacity-70 transition-opacity">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
