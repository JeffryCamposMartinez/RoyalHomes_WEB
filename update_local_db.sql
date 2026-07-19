SET SQL_SAFE_UPDATES = 0;

UPDATE productos SET imagen_base = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(imagen_base, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE imagen_base IS NOT NULL;
UPDATE productos SET galeria = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(galeria, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE galeria IS NOT NULL;

UPDATE variantes_producto SET imagen_variante = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(imagen_variante, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE imagen_variante IS NOT NULL;
UPDATE variantes_producto SET galeria = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(galeria, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE galeria IS NOT NULL;

UPDATE categorias SET imagen_url = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(imagen_url, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE imagen_url IS NOT NULL;

UPDATE configuracion_portada SET imagen_url = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(imagen_url, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'), '.jfif', '.webp'), '.avif', '.webp') WHERE imagen_url IS NOT NULL;

SET SQL_SAFE_UPDATES = 1;
