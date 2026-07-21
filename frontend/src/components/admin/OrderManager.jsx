import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import OrderChatModal from '../OrderChatModal';

function OrderManager({ user }) {
  const { showAlert } = useAlert();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

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
      } else {
        showAlert('Error al actualizar', 'error');
      }
    } catch (err) {
      showAlert('Error de red', 'error');
    }
  };

  const getStatusColor = (statusName) => {
    if (!statusName) return 'bg-surface-variant text-on-surface-variant';
    const s = statusName.toLowerCase();
    if (s.includes('pendiente')) return 'bg-[#fef7e0] text-[#b06000]';
    if (s.includes('aprobado') || s.includes('completado') || s.includes('curso')) return 'bg-[#e6f4ea] text-[#137333]';
    if (s.includes('rechazado') || s.includes('cancelado')) return 'bg-[#fce8e6] text-[#c5221f]';
    return 'bg-surface-variant text-on-surface-variant';
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando pedidos...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Gestión de Pedidos y Solicitudes</h1>
      
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-lowest">
              <tr className="border-b border-outline-variant/30 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
                <th className="py-4 px-4 font-medium">ID / Fecha</th>
                <th className="py-4 px-4 font-medium">Cliente</th>
                <th className="py-4 px-4 font-medium">Detalles</th>
                <th className="py-4 px-4 font-medium">Estado</th>
                <th className="py-4 px-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md">
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-bold block text-primary">#{order.id}</span>
                    <span className="text-sm text-on-surface-variant">{new Date(order.creado_en).toLocaleDateString()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="block font-medium">{order.cliente}</span>
                    <span className="block text-sm text-on-surface-variant">{order.cliente_email}</span>
                    <span className="block text-sm text-on-surface-variant">{order.cliente_telefono || order.whatsapp_contacto || ''}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="block font-bold text-primary">${Number(order.total).toLocaleString('es-CL')}</span>
                    <span className="block text-sm">Método Entrega: {order.metodo_entrega === 'retiro_fisico' ? 'Retiro' : 'Acordar'}</span>
                    <span className="block text-sm">Método Contacto: {order.metodo_contacto}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-caption text-xs uppercase tracking-wider font-bold ${getStatusColor(order.estado)}`}>
                      {order.estado}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {order.metodo_contacto === 'chat_nativo' && (
                        <button 
                          onClick={() => setSelectedOrderForChat(order)}
                          className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors tooltip-trigger relative"
                          title="Abrir Chat Nativo"
                        >
                          <span className="material-symbols-outlined">chat</span>
                        </button>
                      )}
                      {order.metodo_contacto === 'whatsapp' && order.whatsapp_contacto && (
                        <a 
                          href={`https://wa.me/${order.whatsapp_contacto.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-lg hover:bg-[#25D366]/20 transition-colors tooltip-trigger relative"
                          title="Abrir WhatsApp"
                        >
                          <span className="material-symbols-outlined">forum</span>
                        </a>
                      )}
                      
                      {/* TODO: Add logic to approve / reject */}
                      {order.estado_id === 1 && ( // assuming 1 is Pendiente de Aprobación
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 5)} // Assuming 5 is En Curso
                            className="p-2 bg-[#137333]/10 text-[#137333] rounded-lg hover:bg-[#137333]/20 transition-colors tooltip-trigger relative"
                            title="Aprobar Solicitud"
                          >
                            <span className="material-symbols-outlined">check_circle</span>
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 4)} // Assuming 4 is Cancelado / Rechazado
                            className="p-2 bg-[#c5221f]/10 text-[#c5221f] rounded-lg hover:bg-[#c5221f]/20 transition-colors tooltip-trigger relative"
                            title="Rechazar Solicitud"
                          >
                            <span className="material-symbols-outlined">cancel</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                    No hay pedidos ni solicitudes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrderForChat && (
        <OrderChatModal 
          order={selectedOrderForChat} 
          user={user} 
          onClose={() => setSelectedOrderForChat(null)} 
          onTratoCerrado={() => fetchOrders()}
        />
      )}
    </div>
  );
}

export default OrderManager;
