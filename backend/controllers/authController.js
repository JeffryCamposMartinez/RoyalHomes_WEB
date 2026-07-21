const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = users[0];
    const passwordIsValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordIsValid) return res.status(401).json({ message: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id, rol_id: user.rol_id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: 86400 });
    
    let cart = [];
    if (user.carrito) {
      try {
        cart = typeof user.carrito === 'string' ? JSON.parse(user.carrito) : user.carrito;
      } catch (e) {
        console.error('Error parsing cart from DB', e);
      }
    }
    
    res.status(200).json({ id: user.id, nombre: user.nombre, email: user.email, rol_id: user.rol_id, accessToken: token, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const { getAuth } = require('../firebaseAdmin');
    
    // Verify Firebase token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;
    
    // Check if user exists in MySQL
    let [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    let user = users[0];
    
    if (!user) {
      // Create new user (Role 2: Cliente)
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(randomPassword, salt);
      
      const names = name ? name.split(' ') : ['Usuario'];
      const firstName = names[0];
      const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
      
      const [result] = await db.query(
        'INSERT INTO usuarios (rol_id, nombre, apellido, email, password_hash) VALUES (2, ?, ?, ?, ?)',
        [firstName, lastName, email, hash]
      );
      
      [users] = await db.query('SELECT * FROM usuarios WHERE id = ?', [result.insertId]);
      user = users[0];
    }
    
    // Generate JWT
    const token = jwt.sign({ id: user.id, rol_id: user.rol_id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: 86400 });
    
    let cart = [];
    if (user.carrito) {
      try {
        cart = typeof user.carrito === 'string' ? JSON.parse(user.carrito) : user.carrito;
      } catch (e) {
        console.error('Error parsing cart from DB', e);
      }
    }
    
    res.status(200).json({ id: user.id, nombre: user.nombre, email: user.email, rol_id: user.rol_id, accessToken: token, cart });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Error authenticating with Google' });
  }
};

exports.syncCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const userId = req.userId; // From verifyToken middleware
    
    await db.query('UPDATE usuarios SET carrito = ? WHERE id = ?', [JSON.stringify(cart), userId]);
    res.status(200).json({ message: 'Cart synchronized' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await db.query('INSERT INTO usuarios (rol_id, nombre, apellido, email, password_hash) VALUES (2, ?, ?, ?, ?)', [nombre, apellido, email, hash]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const [users] = await db.query('SELECT id, nombre, apellido, email, telefono, rol_id, rut, DATE_FORMAT(fecha_nacimiento, "%Y-%m-%d") as fecha_nacimiento, direcciones FROM usuarios WHERE id = ?', [userId]);
    
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = users[0];
    if (user.direcciones) {
      try {
        user.direcciones = typeof user.direcciones === 'string' ? JSON.parse(user.direcciones) : user.direcciones;
      } catch (e) {
        user.direcciones = [];
      }
    } else {
      user.direcciones = [];
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { nombre, apellido, email, telefono, password, rut, fecha_nacimiento } = req.body;
    
    // Check if email is being changed and if it already exists
    const [existing] = await db.query('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso por otra cuenta.' });
    }
    
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      await db.query(
        'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, rut = ?, fecha_nacimiento = ?, password_hash = ? WHERE id = ?',
        [nombre, apellido, email, telefono, rut || null, fecha_nacimiento || null, hash, userId]
      );
    } else {
      await db.query(
        'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, rut = ?, fecha_nacimiento = ? WHERE id = ?',
        [nombre, apellido, email, telefono, rut || null, fecha_nacimiento || null, userId]
      );
    }
    
    res.status(200).json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const { direcciones } = req.body;
    
    await db.query('UPDATE usuarios SET direcciones = ? WHERE id = ?', [JSON.stringify(direcciones || []), userId]);
    res.status(200).json({ message: 'Direcciones actualizadas' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
