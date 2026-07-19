USE muebles_db;
CREATE TABLE IF NOT EXISTS configuracion_tienda (
    id INT PRIMARY KEY DEFAULT 1,
    hero_text TEXT,
    CHECK (id = 1)
);
INSERT IGNORE INTO configuracion_tienda (id, hero_text) VALUES (1, 'Elevando tus espacios a través de la esencia del diseño Japandi. Combinamos el minimalismo funcional escandinavo con la elegancia atemporal japonesa.');
