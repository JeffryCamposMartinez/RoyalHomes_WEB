import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';

export default function BillingManager({ user }) {
  const { showAlert } = useAlert();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  const fetchBillingData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/billing`, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` }
      });
      const data = await res.json();
      setBillingData(data);
    } catch (err) {
      showAlert('Error al cargar datos de facturación', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleReportTransfer = async (e) => {
    e.preventDefault();
    if (!transactionId) return showAlert('Ingresa el número de transferencia', 'error');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/billing/transfer`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}` 
        },
        body: JSON.stringify({ invoiceId: selectedInvoice.id, transactionId })
      });
      const data = await res.json();
      if (data.success) {
        showAlert('Pago reportado con éxito, pendiente de aprobación.', 'success');
        setShowTransferModal(false);
        setTransactionId('');
        fetchBillingData();
      } else {
        showAlert(data.error || 'Error al reportar pago', 'error');
      }
    } catch (err) {
      showAlert('Error de conexión', 'error');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  if (!billingData?.client) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 text-center">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">error</span>
        <h3 className="font-headline-sm text-primary mb-2">No se encontró suscripción</h3>
        <p className="text-on-surface-variant">El desarrollador aún no ha activado tu plan de mantenimiento en este panel.</p>
      </div>
    );
  }

  const { client, subscription, invoices, payments } = billingData;
  // Buscamos la factura impaga más antigua (para que pague las deudas primero)
  const currentInvoice = [...invoices].reverse().find(i => i.status === 'pending' || i.status === 'overdue');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-primary">Mi Suscripción</h2>
          <p className="text-on-surface-variant">Administra el pago de tu plan de mantenimiento web.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen del Plan */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm col-span-1">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-label-lg text-primary uppercase tracking-widest">Plan Actual</h3>
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${subscription?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {subscription?.status === 'active' ? 'ACTIVO' : subscription?.status === 'suspended' ? 'SUSPENDIDO' : subscription?.status === 'cancelled' ? 'CANCELADO' : 'INACTIVO'}
            </span>
          </div>
          <p className="font-headline-sm text-on-surface mb-1">{subscription?.plan_name || 'Sin Plan'}</p>
          <p className="font-display-sm text-primary font-bold mb-4">
            ${Number(subscription?.monthly_fee || 0).toLocaleString('es-CL')} <span className="font-label-md text-on-surface-variant">/ mes</span>
          </p>
          <div className="space-y-2 mt-6 pt-6 border-t border-outline-variant/20">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Dominio</span>
              <span className="font-bold text-on-surface">{client.store_domain}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Fecha de inicio</span>
              <span className="font-bold text-on-surface">{new Date(subscription?.start_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Estado de Cuenta */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-label-lg text-primary uppercase tracking-widest mb-6">
              {currentInvoice?.status === 'overdue' ? 'Pago Atrasado' : currentInvoice ? 'Próximo Pago' : 'Estado de Cuenta'}
            </h3>
            {currentInvoice ? (
              <div className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-center gap-4 ${currentInvoice.status === 'overdue' ? 'bg-yellow-50 border-yellow-300' : 'bg-secondary/5 border-secondary/30'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    {currentInvoice.status === 'overdue' && <span className="material-symbols-outlined text-yellow-600">warning</span>}
                    <p className={`font-bold ${currentInvoice.status === 'overdue' ? 'text-yellow-700' : 'text-on-surface'}`}>
                      Mensualidad {currentInvoice.month_year}
                    </p>
                  </div>
                  <p className={`text-sm mt-1 ${currentInvoice.status === 'overdue' ? 'text-yellow-700 max-w-lg' : 'text-on-surface-variant'}`}>
                    {currentInvoice.status === 'overdue' ? 
                      'Tienes un atraso en tu pago. El límite máximo de atraso es de 30 días después de la fecha de vencimiento; pasado este plazo el servicio web será suspendido.' :
                      `Vence el ${new Date(currentInvoice.due_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-headline-sm ${currentInvoice.status === 'overdue' ? 'text-yellow-700' : 'text-primary'}`}>
                    ${Number(currentInvoice.amount).toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-success/10 border border-success/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-success">check_circle</span>
                <p className="text-success font-bold">¡Estás al día con tus pagos!</p>
              </div>
            )}
          </div>

          {currentInvoice && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button 
                onClick={() => showAlert('La integración con MercadoPago estará disponible pronto.', 'info')}
                className="flex-1 flex items-center justify-center gap-2 bg-[#009EE3] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#008CC9] transition-colors"
              >
                <span className="material-symbols-outlined">payments</span>
                Pagar con Mercado Pago
              </button>
              <button 
                onClick={() => { setSelectedInvoice(currentInvoice); setShowTransferModal(true); }}
                className="flex-1 flex items-center justify-center gap-2 border border-outline-variant text-primary py-3 px-6 rounded-lg font-bold hover:bg-surface-container-lowest transition-colors"
              >
                <span className="material-symbols-outlined">account_balance</span>
                Reportar Transferencia
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Pagos y Facturas */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-outline-variant/30">
          <h3 className="font-label-lg text-primary uppercase tracking-widest">Historial de Pagos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-sm uppercase tracking-widest">
                <th className="p-4 border-b border-outline-variant/30">Mes</th>
                <th className="p-4 border-b border-outline-variant/30">Vencimiento</th>
                <th className="p-4 border-b border-outline-variant/30">Monto</th>
                <th className="p-4 border-b border-outline-variant/30">Estado</th>
                <th className="p-4 border-b border-outline-variant/30">Método</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-on-surface-variant">No hay historial disponible.</td></tr>
              ) : (
                invoices.map(invoice => {
                  const payment = payments.find(p => p.invoice_id === invoice.id);
                  return (
                    <tr key={invoice.id} className="border-b border-outline-variant/20 hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="p-4 font-bold text-on-surface">{invoice.month_year}</td>
                      <td className="p-4 text-on-surface-variant">{new Date(invoice.due_date).toLocaleDateString()}</td>
                      <td className="p-4 text-on-surface font-mono">${Number(invoice.amount).toLocaleString('es-CL')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest 
                          ${invoice.status === 'paid' ? 'bg-success/20 text-success' : 
                            invoice.status === 'overdue' ? 'bg-error/20 text-error' : 
                            'bg-secondary/20 text-secondary'}`}>
                          {invoice.status === 'paid' ? 'Pagado' : invoice.status === 'overdue' ? 'Atrasado' : 'Próximo Pago'}
                        </span>
                      </td>
                      <td className="p-4 text-on-surface-variant capitalize text-sm">
                        {payment ? payment.payment_method.replace('_', ' ') : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Reportar Transferencia */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowTransferModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-sm text-primary mb-2">Reportar Transferencia</h3>
            <p className="text-on-surface-variant text-sm mb-6">Ingresa el número de transacción o comprobante de tu transferencia bancaria para validarla.</p>
            
            <form onSubmit={handleReportTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Monto a transferir</label>
                <div className="font-headline-sm text-on-surface">${Number(selectedInvoice?.amount || 0).toLocaleString('es-CL')}</div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Nº de Comprobante / Transacción</label>
                <input 
                  type="text" 
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 outline-none focus:border-primary text-on-surface"
                  placeholder="Ej: 987654321"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowTransferModal(false)} className="flex-1 py-3 border border-outline-variant text-on-surface rounded-lg font-bold hover:bg-surface-container-low">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90">
                  Enviar Comprobante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
