import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalog from './components/Catalog';
import ProductDetail from './components/ProductDetail';
import ShoppingCart from './components/ShoppingCart';
import Checkout from './components/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminLayout from './layouts/AdminLayout';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.cart || [];
      }
    } catch (e) { console.error("Error parsing cart", e); }
    return [];
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) { console.error("Error parsing user", e); return null; }
  });

  useEffect(() => {
    // Sync cart to backend when it changes, if user is logged in
    if (user && user.accessToken) {
      // Update local/session storage so it doesn't get stale
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
         const storedUser = JSON.parse(storedUserStr);
         storedUser.cart = cart;
         localStorage.setItem('user', JSON.stringify(storedUser));
      } else {
         const sessionUserStr = sessionStorage.getItem('user');
         if (sessionUserStr) {
            const sessionUser = JSON.parse(sessionUserStr);
            sessionUser.cart = cart;
            sessionStorage.setItem('user', JSON.stringify(sessionUser));
         }
      }

      fetch('http://localhost:3001/api/auth/sync-cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ cart })
      }).catch(err => console.error('Error syncing cart:', err));
    }
  }, [cart, user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    
    // Si el usuario tiene un carrito en la DB, lo combinamos con lo que tenga actualmente (invitado)
    if (userData.cart && userData.cart.length > 0) {
      setCart(prev => {
        const merged = [...prev];
        for (const item of userData.cart) {
          const existing = merged.find(i => i.id === item.id && i.variantId === item.variantId);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            merged.push(item);
          }
        }
        return merged;
      });
    }
  };

  useEffect(() => {
    // Fetch categories
    fetch('http://localhost:3001/api/products/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = 'http://localhost:3001/api/products';
    if (selectedCategory) {
      url += `?category=${selectedCategory}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, [selectedCategory, location.pathname]);

  const addToCart = (product, variant) => {
    setCart(prev => {
      // Check if product with same variant is already in cart
      const existingItemIndex = prev.findIndex(item => item.id === product.id && item.variantId === variant.id);
      
      if (existingItemIndex >= 0) {
        // Increment quantity
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      }
      
      // Add new item
      return [...prev, {
        id: product.id,
        variantId: variant.id,
        name: product.name,
        image: product.image,
        variant: `${variant.material} - ${variant.acabado_color}`,
        price: variant.precio_especifico,
        quantity: 1
      }];
    });
  };

  const updateCartQuantity = (index, delta) => {
    setCart(prev => {
      const newCart = [...prev];
      const newQuantity = newCart[index].quantity + delta;
      
      if (newQuantity <= 0) {
        return prev;
      }
      
      newCart[index] = { ...newCart[index], quantity: newQuantity };
      return newCart;
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
    setCart([]); // Clear cart on logout
    navigate('/login');
  };

  const cartItemCount = cart.length;
  
  // Do not show Navbar on admin or auth pages
  const hideNavbar = location.pathname.startsWith('/admin') || 
                     location.pathname === '/login' || 
                     location.pathname === '/register';

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container flex flex-col">
      <ScrollToTop />
      {!hideNavbar && <Navbar cartCount={cartItemCount} user={user} onLogout={handleLogout} />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={
            <Catalog 
              products={products} 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              loading={loading}
              onProductClick={(id) => navigate(`/product/${id}`)} 
            />
          } />
          
          <Route path="/product/:id" element={
            <ProductDetailWrapper products={products} addToCart={addToCart} navigate={navigate} />
          } />

          <Route path="/cart" element={
            <ShoppingCart 
              cart={cart} 
              products={products}
              removeFromCart={removeFromCart}
              updateCartQuantity={updateCartQuantity}
            />
          } />

          <Route path="/checkout" element={
            user ? <Checkout cart={cart} clearCart={clearCart} /> : <Navigate to="/login" />
          } />

          {/* Protected Profile */}
          <Route path="/profile" element={
            user ? <Profile user={user} onUpdateUser={setUser} /> : <Navigate to="/login" />
          } />

          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            user && user.rol_id === 1 ? <AdminLayout user={user} /> : <Navigate to="/" />
          } />
        </Routes>
      </div>
      {!hideNavbar && <Footer />}
    </div>
  );
}

// Wrapper para pasar el producto correcto
function ProductDetailWrapper({ products, addToCart, navigate }) {
  const id = window.location.pathname.split('/').pop();
  const product = products.find(p => p.id.toString() === id);
  if (!product) return <div className="pt-32 text-center">Producto no encontrado</div>;
  
  return <ProductDetail 
    product={product} 
    onBack={() => navigate('/')} 
    onAddToCart={(p, v) => { addToCart(p, v); navigate('/cart'); }} 
  />;
}

export default App;
