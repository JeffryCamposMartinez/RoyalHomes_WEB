import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';

export default function BillingManager({ user }) {
  const { showAlert } = useAlert();
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
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

  const unpaidInvoices = billingData?.invoices 
    ? [...billingData.invoices].reverse().filter(i => i.status === 'pending' || i.status === 'overdue')
    : [];

  useEffect(() => {
    if (unpaidInvoices.length > 0 && selectedInvoiceIds.length === 0) {
      setSelectedInvoiceIds([unpaidInvoices[0].id]);
    }
  }, [billingData]);

  const handleToggleInvoice = (index) => {
    // Garantizar que se seleccionen en orden: desde 0 hasta el índice clickeado
    const newSelected = unpaidInvoices.slice(0, index + 1).map(i => i.id);
    setSelectedInvoiceIds(newSelected);
  };

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
        body: JSON.stringify({ invoiceIds: selectedInvoiceIds, transactionId })
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

  const handleDownloadReceipt = (invoice, payment) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recibo - ${invoice.month_year}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          body { font-family: 'Outfit', sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px; color: #1a1c1a; }
          .invoice-box { max-width: 800px; margin: auto; background: #ffffff; padding: 0; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); overflow: hidden; position: relative; }
          .header { background: linear-gradient(135deg, #1a1c1a 0%, #333 100%); color: #fff; padding: 40px; display: flex; justify-content: space-between; align-items: center; }
          .header-logo { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
          .header-logo span { color: #cca730; }
          .header-title { text-align: right; }
          .header-title h1 { margin: 0; font-size: 36px; text-transform: uppercase; letter-spacing: 4px; color: #fff; opacity: 0.9; }
          .header-title p { margin: 5px 0 0; font-size: 14px; opacity: 0.7; font-weight: 300; }
          .content { padding: 50px 40px; position: relative; z-index: 1; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 120px; font-weight: 800; color: rgba(16, 185, 129, 0.03); z-index: 0; pointer-events: none; text-transform: uppercase; letter-spacing: 10px; white-space: nowrap; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; position: relative; z-index: 1; }
          .info-block { width: 45%; }
          .info-block h3 { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #858383; }
          .info-block p { margin: 4px 0; font-size: 15px; font-weight: 400; color: #1a1c1a; }
          .info-block p strong { font-weight: 600; }
          .stamp { position: absolute; right: 40px; top: 120px; border: 4px solid #10b981; color: #10b981; font-size: 24px; font-weight: 800; padding: 10px 20px; text-transform: uppercase; border-radius: 8px; transform: rotate(15deg); opacity: 0.8; letter-spacing: 4px; pointer-events: none; }
          .table-container { margin-bottom: 40px; position: relative; z-index: 1; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f9fafb; padding: 15px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #444748; border-bottom: 2px solid #e3e2e0; }
          td { padding: 20px 15px; border-bottom: 1px solid #f3f1eb; font-size: 15px; color: #1a1c1a; }
          .amount-col { text-align: right; }
          .totals { width: 350px; margin-left: auto; position: relative; z-index: 1; }
          .totals-row { display: flex; justify-content: space-between; padding: 12px 20px; font-size: 15px; }
          .totals-row.grand-total { background: #1a1c1a; color: #ffffff; border-radius: 12px; font-size: 20px; font-weight: 700; margin-top: 10px; padding: 20px; align-items: center; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
          .totals-row.grand-total span:last-child { color: #cca730; }
          .footer { background: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e3e2e0; }
          .footer p { margin: 5px 0; font-size: 13px; color: #747878; }
          .footer strong { color: #1a1c1a; }
          @media print {
            body { background-color: #fff; padding: 0; }
            .invoice-box { box-shadow: none; border-radius: 0; max-width: 100%; }
            .header { border-radius: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="header-logo">ROYAL<span>HOMES</span></div>
            <div class="header-title">
              <h1>RECIBO</h1>
              <p>Comprobante Oficial de Pago</p>
            </div>
          </div>
          
          <div class="content">
            <div class="watermark">PAGADO</div>
            <div class="stamp">PAGADO</div>

            <div class="info-section">
              <div class="info-block">
                <h3>Facturado a:</h3>
                <p><strong>${client.name || 'Cliente'}</strong></p>
                <p>${client.store_domain}</p>
                <p>${client.email || ''}</p>
              </div>
              <div class="info-block" style="text-align: right;">
                <h3>Detalles del Recibo:</h3>
                <p><strong>Recibo Nº:</strong> #INV-${invoice.id.toString().padStart(6, '0')}</p>
                <p><strong>Fecha de Pago:</strong> ${new Date(payment.payment_date).toLocaleDateString()}</p>
                <p><strong>Método:</strong> ${payment.payment_method.toUpperCase()}</p>
                <p><strong>Transacción:</strong> ${payment.transaction_id || 'N/A'}</p>
              </div>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Descripción del Servicio</th>
                    <th>Periodo</th>
                    <th class="amount-col">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Mantenimiento y Hosting Web</strong><br><span style="font-size:13px; color:#747878;">Plan: ${subscription.plan_name}</span></td>
                    <td>Mensualidad ${invoice.month_year}</td>
                    <td class="amount-col">$${Number(invoice.amount).toLocaleString('es-CL')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="totals">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>$${Number(invoice.amount).toLocaleString('es-CL')}</span>
              </div>
              <div class="totals-row grand-total">
                <span>TOTAL PAGADO</span>
                <span>$${Number(invoice.amount).toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>¡Gracias por confiar en nosotros!</strong></p>
            <p>Este documento es un comprobante válido del pago de tu suscripción de servicios web.</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 40px;">
          <button onclick="window.print()" style="background: #cca730; color: #fff; border: none; padding: 15px 30px; font-size: 16px; font-family: 'Outfit', sans-serif; font-weight: 600; border-radius: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(204, 167, 48, 0.3); transition: all 0.2s;">
            <svg style="width:18px; height:18px; vertical-align:middle; margin-right:8px; fill:currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
            Imprimir o Guardar PDF
          </button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
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
  const selectedInvoicesData = unpaidInvoices.filter(i => selectedInvoiceIds.includes(i.id));
  const totalToPay = selectedInvoicesData.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const hasOverdueSelected = selectedInvoicesData.some(i => i.status === 'overdue');

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
              {hasOverdueSelected ? 'Pago Atrasado' : unpaidInvoices.length > 0 ? 'Próximo Pago' : 'Estado de Cuenta'}
            </h3>
            
            {unpaidInvoices.length > 0 ? (
              <div className={`p-4 rounded-lg border flex flex-col gap-4 ${hasOverdueSelected ? 'bg-yellow-50 border-yellow-300' : 'bg-secondary/5 border-secondary/30'}`}>
                {unpaidInvoices.map((invoice, index) => (
                  <label key={invoice.id} className="flex items-center gap-3 cursor-pointer group hover:bg-surface-container-lowest/50 p-2 rounded transition-colors -m-2">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedInvoiceIds.includes(invoice.id)}
                        onChange={() => handleToggleInvoice(index)}
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {invoice.status === 'overdue' && <span className="material-symbols-outlined text-yellow-600 text-sm">warning</span>}
                        <p className={`font-bold ${invoice.status === 'overdue' ? 'text-yellow-700' : 'text-on-surface'}`}>
                          Mensualidad {invoice.month_year}
                        </p>
                      </div>
                      <p className={`text-sm mt-1 ${invoice.status === 'overdue' ? 'text-yellow-700' : 'text-on-surface-variant'}`}>
                        Vence el {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-headline-sm ${invoice.status === 'overdue' ? 'text-yellow-700' : 'text-primary'}`}>
                        ${Number(invoice.amount).toLocaleString('es-CL')}
                      </p>
                    </div>
                  </label>
                ))}
                
                {hasOverdueSelected && (
                  <div className="flex gap-2 text-sm text-yellow-700 mt-4 bg-yellow-100/50 p-3 rounded border border-yellow-200">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <p>Tienes atrasos. El límite máximo de atraso es de 30 días después de la fecha de vencimiento; pasado este plazo el servicio web será suspendido.</p>
                  </div>
                )}

                <div className="border-t border-outline-variant/20 pt-4 mt-2 flex justify-between items-center">
                  <span className="font-bold text-on-surface uppercase tracking-widest text-sm">Total a Pagar:</span>
                  <span className="font-headline-sm text-primary">${totalToPay.toLocaleString('es-CL')}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-success/10 border border-success/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-success">check_circle</span>
                <p className="text-success font-bold">¡Estás al día con tus pagos!</p>
              </div>
            )}
          </div>

          {unpaidInvoices.length > 0 && selectedInvoiceIds.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button 
                onClick={() => showAlert('La integración con MercadoPago estará disponible pronto.', 'info')}
                className="flex-1 flex items-center justify-center gap-2 bg-[#009EE3] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#008CC9] transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined">payments</span>
                Pagar ${totalToPay.toLocaleString('es-CL')}
              </button>
              <button 
                onClick={() => setShowTransferModal(true)}
                className="flex-1 flex items-center justify-center gap-2 border border-outline-variant text-primary py-3 px-6 rounded-lg font-bold hover:bg-surface-container-lowest transition-colors shadow-sm"
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
                <th className="p-4 border-b border-outline-variant/30 text-right">Acciones</th>
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
                      <td className="p-4 text-right">
                        {invoice.status === 'paid' && payment && (
                          <button 
                            onClick={() => handleDownloadReceipt(invoice, payment)}
                            className="inline-flex items-center justify-center gap-1 bg-surface-container-high hover:bg-outline-variant/30 text-on-surface px-3 py-1.5 rounded-md text-sm font-bold transition-colors"
                            title="Descargar Comprobante"
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Recibo
                          </button>
                        )}
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
                <div className="font-headline-sm text-on-surface">${totalToPay.toLocaleString('es-CL')}</div>
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
