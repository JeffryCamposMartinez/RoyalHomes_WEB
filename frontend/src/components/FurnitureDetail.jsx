import React from 'react';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import './FurnitureDetail.css';

function FurnitureDetail({ product, onBack, onAddToCart }) {
  if (!product) return null;

  return (
    <div className="detail-view container fade-in">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Volver al catálogo
      </button>

      <div className="detail-layout">
        <div className="detail-image-section">
          <img src={product.image} alt={product.name} className="detail-image" />
        </div>
        
        <div className="detail-info-section">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-price">${Number(product.price).toLocaleString('es-CL')}</p>
          
          <div className="detail-description">
            <p>{product.description}</p>
          </div>

          <div className="detail-specs">
            <div className="spec-item">
              <span className="spec-label">Dimensiones</span>
              <p>{product.dimensions}</p>
            </div>
            <div className="spec-item">
              <span className="spec-label">Materiales</span>
              <ul className="materials-list">
                {product.materials.map((mat, idx) => (
                  <li key={idx}>{mat}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="detail-actions">
            <div className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? <><Check size={18}/> En stock</> : <><AlertCircle size={18}/> Agotado temporalmente</>}
            </div>
            
            <button 
              className="btn-primary add-to-cart-btn" 
              disabled={!product.inStock}
              onClick={onAddToCart}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FurnitureDetail;
