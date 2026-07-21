import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAlert } from '../../contexts/AlertContext';

function OrderManager({ user }) {
  const { showAlert } = useAlert();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchOrders();
    
    // Setup Socket.io
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token: user.accessToken }
    });

    newSocket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('trato_actualizado', (pedido) => {
      fetchOrders();
      if (selectedOrder && selectedOrder.id === pedido.id) {
        setSelectedOrder(prev => ({ ...prev, ...pedido }));
      }
      showAlert('El estado del trato ha sido actualizado', 'info');
    });

    newSocket.on('trato_cerrado_completado', () => {
      fetchOrders();
      showAlert('¡El trato se ha cerrado y el pago está habilitado!', 'success');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user.accessToken, showAlert]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
      showAlert('Error al obtener pedidos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    if (socket) {
      socket.emit('join_order_room', order.id);
    }
    // Fetch messages for this order
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

  const handleUpdateStatus = async (orderId, newStatusId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ estado_id: newStatusId })
      });
      if (res.ok) {
        showAlert('Estado actualizado', 'success');
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, estado_id: newStatusId }));
        }
      } else {
        showAlert('Error al actualizar', 'error');
      }
    } catch (err) {
      showAlert('Error de red', 'error');
    }
  };

  const handleCerrarTrato = async () => {
    if (!socket || !selectedOrder) return;
    socket.emit('cerrar_trato', { pedidoId: selectedOrder.id, rolId: user.rol_id });
  };

  const getStatusColor = (statusName) => {
    if (!statusName) return 'bg-surface-variant text-on-surface-variant';
    const s = statusName.toLowerCase();
    if (s.includes('pendiente')) return 'bg-[#fef7e0] text-[#b06000]';
    if (s.includes('aprobado') || s.includes('completado') || s.includes('curso')) return 'bg-[#e6f4ea] text-[#137333]';
    if (s.includes('rechazado') || s.includes('cancelado')) return 'bg-[#fce8e6] text-[#c5221f]';
    return 'bg-surface-variant text-on-surface-variant';
  };

  if (loading && orders.length === 0) {
    return <div className="p-8 text-center">Cargando pedidos...</div>;
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Sidebar - Lista de Pedidos */}
      <div className="w-full md:w-1/3 max-w-[400px] border-r border-outline-variant/30 flex flex-col bg-surface h-[calc(100vh-64px)] md:h-screen">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest shrink-0">
          <h1 className="text-xl font-bold text-primary uppercase tracking-widest">Pedidos y Solicitudes</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => handleSelectOrder(order)}
              className={`p-4 border-b border-outline-variant/10 cursor-pointer transition-colors hover:bg-surface-container-low ${selectedOrder?.id === order.id ? 'bg-surface-container-low border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-primary">Pedido #{order.id}</h3>
                  <p className="text-sm font-medium text-on-surface">{order.cliente}</p>
                </div>
                <span className="text-xs text-on-surface-variant">
                  {new Date(order.creado_en).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getStatusColor(order.estado)}`}>
                  {order.estado}
                </span>
                <span className="text-sm font-bold text-primary">${Number(order.total).toLocaleString('es-CL')}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant text-sm">
              No hay pedidos ni solicitudes.
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Vista de Chat y Detalles */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest h-[calc(100vh-64px)] md:h-screen">
        {selectedOrder ? (
          <>
            {/* Header del Chat */}
            <div className="p-4 border-b border-outline-variant/30 bg-surface flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-bold text-primary text-lg">Chat del Pedido #{selectedOrder.id}</h2>
                <p className="text-sm text-on-surface-variant">Cliente: {selectedOrder.cliente} ({selectedOrder.cliente_email})</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Actions based on state */}
                {selectedOrder.estado_id === 1 && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 5)} 
                      className="px-4 py-2 bg-[#137333] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      Aprobar
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 4)} 
                      className="px-4 py-2 bg-[#c5221f] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                {selectedOrder.estado_id === 5 && selectedOrder.metodo_contacto === 'chat_nativo' && (
                  <button 
                    onClick={handleCerrarTrato}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${selectedOrder.admin_acepto_trato ? 'bg-[#137333] text-white' : 'bg-primary text-on-primary hover:opacity-90'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">handshake</span>
                    {selectedOrder.admin_acepto_trato ? 'Trato Aceptado' : 'Aceptar Trato'}
                  </button>
                )}
                {selectedOrder.metodo_contacto === 'whatsapp' && selectedOrder.whatsapp_contacto && (
                  <a 
                    href={`https://wa.me/${selectedOrder.whatsapp_contacto.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[18px]">forum</span>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
            
            {/* Aviso de seguridad (como Carpetazo) */}
            <div className="bg-[#fff9c4] text-[#b06000] p-2 text-center text-xs font-medium border-b border-[#ffe082] shrink-0">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">security</span>
              Para su seguridad, acuerde bien los detalles antes de aceptar el trato. Este chat es oficial de Royal Homes.
            </div>

            {/* Mensajes del Chat */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, idx) => {
                const isMe = msg.remitente_id === user.id;
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${isMe ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface text-on-surface rounded-tl-sm border border-outline-variant/20'}`}>
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

            {/* Input de Mensaje */}
            <div className="p-4 bg-surface border-t border-outline-variant/30 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={selectedOrder.metodo_contacto === 'chat_nativo' ? "Escribe un mensaje..." : "El usuario prefirió usar WhatsApp."}
                  disabled={selectedOrder.metodo_contacto !== 'chat_nativo'}
                  className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-full px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || selectedOrder.metodo_contacto !== 'chat_nativo'}
                  className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-sm"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant opacity-50 p-8 text-center">
            <span className="material-symbols-outlined text-[64px] mb-4 font-light">forum</span>
            <p className="font-label-lg uppercase tracking-widest">Selecciona un pedido para ver el chat</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderManager;
