const db = require('../config/db');

// Obtener notificaciones del usuario
const getNotifications = async (req, res) => {
  try {
    const [notificaciones] = await db.query(
      'SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT 50',
      [req.userId]
    );
    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      'UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    );
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Marcar todas las notificaciones como leídas
const markAllAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ? AND leida = FALSE',
      [req.userId]
    );
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
