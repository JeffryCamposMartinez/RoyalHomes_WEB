import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token: user.accessToken }
    });

    newSocket.on(`nueva_notificacion_${user.id}`, () => {
      fetchNotifications();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    // Close dropdown on click outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);
    
    // Marcar como leída
    if (!notif.leida) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications/${notif.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${user.accessToken}` }
        });
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, leida: 1 } : n));
      } catch (error) {
        console.error('Error marking as read', error);
      }
    }

    // Redirigir según el tipo
    if (user.rol_id === 1) { // Admin
      navigate(`/admin?tab=orders&order_id=${notif.referencia_id}`);
    } else { // Cliente
      navigate(`/profile?tab=compras&order_id=${notif.referencia_id}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, leida: 1 })));
    } catch (error) {
      console.error('Error marking all as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.leida).length;

  if (!user) return null;

  return (
    <div className="relative flex items-center justify-center mr-1 sm:mr-2" ref={dropdownRef}>
      <button 
        className="relative text-on-surface-variant hover:text-primary transition-colors p-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
          {unreadCount > 0 ? 'notifications_active' : 'notifications'}
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-error text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed sm:absolute top-[70px] sm:top-full left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0 sm:right-0 mt-0 sm:mt-4 w-[95vw] sm:w-80 bg-surface border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 max-h-[80vh] sm:max-h-[80vh]">
          <div className="p-3 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
            <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">done_all</span>
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 border-b border-outline-variant/10 cursor-pointer transition-colors hover:bg-surface-container-low flex items-start gap-3 ${!notif.leida ? 'bg-primary/5' : ''}`}
                >
                  <div className={`mt-1 shrink-0 ${!notif.leida ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {notif.tipo === 'mensaje' ? 'chat' : 
                       notif.tipo === 'pedido_actualizado' ? 'local_shipping' : 
                       notif.tipo === 'trato_cerrado' ? 'handshake' :
                       notif.tipo === 'nuevo_pedido' ? 'add_shopping_cart' : 'info'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.leida ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>
                      {notif.mensaje}
                    </p>
                    <span className="text-[10px] text-on-surface-variant/70 mt-1 block">
                      {new Date(notif.creado_en).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  {!notif.leida && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
