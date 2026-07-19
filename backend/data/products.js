const products = [
  {
    id: 1,
    name: "Sofá Modular 'Nube'",
    price: 1299.99,
    category: "Sofás",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    description: "Sofá modular expansible con tapizado premium antimanchas. Su diseño contemporáneo y cojines de espuma viscoelástica garantizan el máximo confort.",
    dimensions: "Ancho: 280cm | Profundidad: 95cm | Alto: 85cm",
    materials: ["Tela antimanchas", "Espuma viscoelástica", "Estructura de madera maciza"],
    inStock: true
  },
  {
    id: 2,
    name: "Mesa de Comedor 'Roble Eterno'",
    price: 849.50,
    category: "Mesas",
    image: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=800&q=80",
    description: "Mesa de comedor rústica pero elegante, construida con roble macizo sostenible. Perfecta para reunir hasta 8 personas.",
    dimensions: "Largo: 220cm | Ancho: 100cm | Alto: 76cm",
    materials: ["Roble macizo", "Acabado en barniz mate"],
    inStock: true
  },
  {
    id: 3,
    name: "Silla de Acento 'Línea'",
    price: 299.00,
    category: "Sillas",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
    description: "Silla minimalista con marco de acero negro y asiento de cuero vegano. Una pieza declarativa para cualquier rincón de lectura o sala de estar.",
    dimensions: "Ancho: 65cm | Profundidad: 70cm | Alto: 82cm",
    materials: ["Acero con recubrimiento en polvo", "Cuero vegano premium"],
    inStock: true
  },
  {
    id: 4,
    name: "Cama Queen Size 'Zenith'",
    price: 950.00,
    category: "Dormitorio",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    description: "Cama de plataforma baja inspirada en el diseño japonés, con cabecero tapizado y mesas de noche integradas flotantes.",
    dimensions: "Ancho total: 240cm | Largo: 215cm | Alto cabecero: 90cm",
    materials: ["Madera de nogal", "Lino natural"],
    inStock: false
  },
  {
    id: 5,
    name: "Estantería Industrial 'Loft'",
    price: 450.00,
    category: "Almacenamiento",
    image: "https://images.unsplash.com/photo-1594620302200-9a7622f3004a?auto=format&fit=crop&w=800&q=80",
    description: "Estantería abierta que combina madera reciclada cálida con una estructura metálica oscura. Ideal para exhibir libros y decoración.",
    dimensions: "Ancho: 120cm | Profundidad: 35cm | Alto: 180cm",
    materials: ["Madera de pino reciclada", "Hierro forjado"],
    inStock: true
  },
  {
    id: 6,
    name: "Lámpara de Pie 'Arco'",
    price: 185.00,
    category: "Iluminación",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    description: "Lámpara moderna con un arco elegante de latón que proporciona iluminación ambiental perfecta sobre sofás o sillones.",
    dimensions: "Alto: 200cm | Extensión: 110cm",
    materials: ["Latón cepillado", "Base de mármol"],
    inStock: true
  }
];

module.exports = products;
