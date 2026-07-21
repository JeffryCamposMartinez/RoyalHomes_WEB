import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAlert } from '../contexts/AlertContext';

function OrderChatModal({ order, user, onClose, onTratoCerrado }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const { showAlert } = useAlert();

  const isAdmin = user.rol_id === 1;

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
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
    fetchMessages();

    // Setup Socket.io
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token: user.accessToken }
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_order_room', order.id);
    });

    newSocket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('trato_actualizado', (pedido) => {
      // Refresh orders in parent
      if (onTratoCerrado) onTratoCerrado();
      showAlert('El estado del trato ha sido actualizado', 'info');
    });

    newSocket.on('trato_cerrado_completado', () => {
      if (onTratoCerrado) onTratoCerrado();
      showAlert('¡El trato se ha cerrado y el pago está habilitado!', 'success');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [order.id, user.accessToken, onTratoCerrado, showAlert]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      pedidoId: order.id,
      mensaje: newMessage,
      remitenteId: user.id
    });

    setNewMessage('');
  };

  const handleCerrarTrato = async () => {
    if (!socket) return;
    socket.emit('cerrar_trato', { pedidoId: order.id, rolId: user.rol_id });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/30 bg-surface z-10 flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-label-lg text-primary uppercase tracking-widest font-bold">
              Chat del Pedido #{order.id}
            </h2>
            <p className="text-sm text-on-surface-variant">
              {isAdmin ? `Cliente: ${order.cliente}` : 'Vendedor'}
            </p>
          </div>
          <div className="flex gap-2">
            {(order.estado_id === 5) && ( // Assuming 5 is "En Curso" (Trato no cerrado)
              <button 
                onClick={handleCerrarTrato}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isAdmin ? (order.admin_acepto_trato ? 'bg-[#137333] text-white' : 'bg-surface-variant text-on-surface hover:bg-[#137333]/20') : (order.cliente_acepto_trato ? 'bg-[#137333] text-white' : 'bg-surface-variant text-on-surface hover:bg-[#137333]/20')}`}
                title="Cerrar Trato"
              >
                <span className="material-symbols-outlined">handshake</span>
                {isAdmin ? (order.admin_acepto_trato ? 'Trato Aceptado' : 'Aceptar Trato') : (order.cliente_acepto_trato ? 'Trato Aceptado' : 'Aceptar Trato')}
              </button>
            )}
            
            <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors bg-surface-variant/20 rounded-full w-10 h-10 flex items-center justify-center">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-surface-container-lowest">
          {messages.map((msg, idx) => {
            const isMe = msg.remitente_id === user.id;
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[70%] rounded-2xl p-3 ${isMe ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface-container-high text-on-surface rounded-tl-sm'}`}>
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

        {/* Input */}
        <div className="p-4 bg-surface border-t border-outline-variant/30 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-surface-container border border-outline-variant/50 rounded-full px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderChatModal;
