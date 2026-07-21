const db = require('./config/db');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado al chat:', socket.id);

    // Unirse a una sala específica de un pedido
    socket.on('join_order_room', (pedidoId) => {
      socket.join(`order_${pedidoId}`);
      console.log(`Usuario unido a la sala order_${pedidoId}`);
    });

    // Enviar un mensaje
    socket.on('send_message', async (data) => {
      const { pedidoId, remitenteId, mensaje } = data;
      
      try {
        // Guardar mensaje en la BD
        const [result] = await db.query(
          'INSERT INTO mensajes_pedido (pedido_id, remitente_id, mensaje) VALUES (?, ?, ?)',
          [pedidoId, remitenteId, mensaje]
        );

        const nuevoMensaje = {
          id: result.insertId,
          pedido_id: pedidoId,
          remitente_id: remitenteId,
          mensaje,
          creado_en: new Date().toISOString()
        };

        // Emitir mensaje a todos en la sala
        io.to(`order_${pedidoId}`).emit('receive_message', nuevoMensaje);
      } catch (error) {
        console.error('Error al guardar el mensaje:', error);
      }
    });

    // Eventos de confirmación de trato (🤝)
    socket.on('cerrar_trato', async (data) => {
      const { pedidoId, rolId } = data;
      try {
        // rolId == 1 -> Admin, rolId == 2 -> Cliente
        let column = rolId === 1 ? 'admin_acepto_trato' : 'cliente_acepto_trato';
        await db.query(`UPDATE pedidos SET ${column} = TRUE WHERE id = ?`, [pedidoId]);
        
        // Verificar si ambos aceptaron
        const [pedidos] = await db.query('SELECT cliente_acepto_trato, admin_acepto_trato FROM pedidos WHERE id = ?', [pedidoId]);
        const pedido = pedidos[0];
        
        if (pedido.cliente_acepto_trato && pedido.admin_acepto_trato) {
          // Cambiar estado a Pago Habilitado (8)
          await db.query('UPDATE pedidos SET estado_id = 8 WHERE id = ?', [pedidoId]);
          io.to(`order_${pedidoId}`).emit('trato_cerrado_completado');
        } else {
          io.to(`order_${pedidoId}`).emit('trato_actualizado', pedido);
        }
      } catch (error) {
        console.error('Error al cerrar trato:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });
  });
};
