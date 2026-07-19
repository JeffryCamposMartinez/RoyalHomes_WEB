import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ cartCount, user, onLogout }) {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  return (
    <>
      {/* TopAppBar (Web & Mobile) */}
      <header className="fixed top-0 w-full z-50 bg-surface dark:bg-surface-dim border-b border-outline-variant/30 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center px-container-margin-mobile md:px-container-margin-desktop h-16 w-full max-w-[1440px] mx-auto">
          
          <nav className="hidden md:flex gap-8 items-center flex-1">

            {user && user.rol_id === 1 && (
              <Link to="/admin" className="font-label-md text-label-md text-on-surface-variant hover:opacity-80 transition-opacity uppercase tracking-widest">
                Panel Admin
              </Link>
            )}
          </nav>
          
          <Link to="/" className="flex-1 flex justify-start md:justify-center items-center">
            <img src="/images/logo/logo_solo_texto.png" alt="Royal Home" className="hidden md:block h-12 lg:h-16 object-contain scale-[4] lg:scale-[6] translate-y-1 lg:translate-y-2" />
            <img src="/images/logo/logo_solo_diseño.png" alt="Royal Home" className="md:hidden h-10 object-contain scale-[1.5] origin-left" />
          </Link>
          
          <div className="flex-1 flex justify-end items-center gap-1 sm:gap-4 relative">
            {user ? (
              <div 
                className="relative flex items-center gap-1 sm:gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer" 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                tabIndex={0}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">account_circle</span>
                <span className="font-label-md text-[10px] sm:text-sm whitespace-nowrap hidden min-[380px]:inline">Hola, {user.nombre.split(' ')[0]}</span>
                <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-4 w-48 bg-surface border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
                    <Link 
                      to="/profile"
                      className="w-full px-4 py-3 text-left font-label-md text-sm text-on-surface hover:bg-surface-variant/50 flex items-center gap-2 transition-colors uppercase tracking-widest border-b border-outline-variant/20"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      Mi Perfil
                    </Link>
                    <button 
                      onClick={onLogout}
                      className="w-full px-4 py-3 text-left font-label-md text-sm text-error hover:bg-error/10 flex items-center gap-2 transition-colors uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Salir
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 sm:gap-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">account_circle</span>
                <span className="font-label-md text-[10px] sm:text-sm whitespace-nowrap hidden min-[380px]:inline">Hola, Inicia Sesión</span>
              </Link>
            )}

            <button className="text-primary hover:opacity-80 transition-opacity active:scale-95 duration-200 p-2 relative" onClick={() => navigate('/cart')}>
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-tertiary-container text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface dark:bg-surface-dim border-t border-outline-variant/30 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:hidden">
        <Link to="/" className="flex flex-col items-center justify-center text-primary font-bold hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          <span className="font-label-md text-[10px] uppercase tracking-widest mt-1">Tienda</span>
        </Link>
        {user && user.rol_id === 1 && (
          <Link to="/admin" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-[24px]">dashboard</span>
            <span className="font-label-md text-[10px] uppercase tracking-widest mt-1">Admin</span>
          </Link>
        )}
        {user && (
          <Link to="/profile" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-[24px]">person</span>
            <span className="font-label-md text-[10px] uppercase tracking-widest mt-1">Perfil</span>
          </Link>
        )}

        
        <Link to="/cart" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity relative">
          <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
          <span className="font-label-md text-[10px] uppercase tracking-widest mt-1">Carrito</span>
          {cartCount > 0 && <span className="absolute top-0 right-2 bg-tertiary-container w-2 h-2 rounded-full"></span>}
        </Link>
      </nav>
    </>
  );
}

export default Navbar;
