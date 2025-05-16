-- Eliminar tablas si existen para permitir la re-ejecución del script
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS burgers;

-- Tabla para las hamburguesas
CREATE TABLE burgers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(5, 2) NOT NULL,       -- Ej: 12.50
    image_url VARCHAR(255),           -- URL de la imagen de la hamburguesa
    type VARCHAR(50) NOT NULL,        -- Ej: 'classic', 'veggie', 'bbq', 'gourmet'
    ingredients TEXT[],               -- Array de ingredientes, ej: '{"Carne de Vacuno", "Queso Cheddar"}'
    total_score INTEGER DEFAULT 0,    -- Suma de todas las puntuaciones
    rating_count INTEGER DEFAULT 0    -- Número total de puntuaciones
);

-- Tabla para las puntuaciones de las hamburguesas
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    burger_id INTEGER NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5), -- Puntuación de 1 a 5 estrellas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (burger_id) REFERENCES burgers(id) -- Sin ON DELETE CASCADE
);

-- Insertar algunas hamburguesas de ejemplo
INSERT INTO burgers (name, description, price, image_url, type, ingredients) VALUES
('KPMG Classic', 'La auténtica experiencia KPMG con carne de vacuno premium, queso cheddar fundido, lechuga fresca y tomate en pan clásico.', 10.50, 'https://via.placeholder.com/300x200/FF5733/FFFFFF?text=KPMG+Classic', 'classic',
    '{"Carne de Vacuno", "Queso Cheddar", "Lechuga", "Tomate", "Pan Clásico", "Salsa Especial KPMG"}'),
('Cloud BBQ Beast', 'Una bestia de sabor con doble carne, bacon crujiente, cebolla caramelizada y nuestra salsa BBQ secreta en pan brioche.', 13.75, 'https://via.placeholder.com/300x200/C70039/FFFFFF?text=Cloud+BBQ', 'bbq',
    '{"Carne de Vacuno", "Bacon", "Cebolla Caramelizada", "Salsa BBQ", "Pan Brioche"}'),
('Veggie Innovator', 'Deliciosa hamburguesa vegana a base de champiñones portobello, con aguacate, rúcula y un toque de nuestra salsa especial KPMG en pan integral.', 11.25, 'https://via.placeholder.com/300x200/900C3F/FFFFFF?text=Veggie+Innovator', 'veggie',
    '{"Hamburguesa Vegana", "Champiñones Portobello", "Aguacate", "Rúcula", "Pan Integral"}'),
('Gourmet Consultant', 'Para paladares exigentes: carne de vacuno madurada, queso de cabra, rúcula y cebolla caramelizada en pan brioche artesanal.', 15.00, 'https://via.placeholder.com/300x200/581845/FFFFFF?text=Gourmet+Consultant', 'gourmet',
    '{"Carne de Vacuno Madurada", "Queso de Cabra", "Rúcula", "Cebolla Caramelizada", "Pan Brioche Artesanal"}'),
('The Data Cruncher', 'Simple pero potente: carne de vacuno, queso cheddar, pepinillos y salsa KPMG en pan clásico.', 9.99, 'https://via.placeholder.com/300x200/FFC300/000000?text=Data+Cruncher', 'classic',
    '{"Carne de Vacuno", "Queso Cheddar", "Pepinillos", "Salsa Especial KPMG", "Pan Clásico"}');

-- Insertar algunas puntuaciones de ejemplo
-- La lógica para actualizar 'total_score' y 'rating_count' en la tabla 'burgers'
-- deberá estar en tu aplicación (DAO) cuando se inserte una nueva puntuación.
-- Aquí actualizamos manualmente para tener datos iniciales.

-- Puntuaciones para KPMG Classic (id=1)
INSERT INTO ratings (burger_id, score) VALUES (1, 5);
INSERT INTO ratings (burger_id, score) VALUES (1, 4);
UPDATE burgers SET total_score = 5+4, rating_count = 2 WHERE id = 1;

-- Puntuaciones para Cloud BBQ Beast (id=2)
INSERT INTO ratings (burger_id, score) VALUES (2, 5);
INSERT INTO ratings (burger_id, score) VALUES (2, 5);
INSERT INTO ratings (burger_id, score) VALUES (2, 4);
UPDATE burgers SET total_score = 5+5+4, rating_count = 3 WHERE id = 2;

-- Puntuaciones para Veggie Innovator (id=3)
INSERT INTO ratings (burger_id, score) VALUES (3, 4);
UPDATE burgers SET total_score = 4, rating_count = 1 WHERE id = 3;

-- Puntuaciones para Gourmet Consultant (id=4)
INSERT INTO ratings (burger_id, score) VALUES (4, 5);
INSERT INTO ratings (burger_id, score) VALUES (4, 5);
INSERT INTO ratings (burger_id, score) VALUES (4, 5);
INSERT INTO ratings (burger_id, score) VALUES (4, 3);
UPDATE burgers SET total_score = 5+5+5+3, rating_count = 4 WHERE id = 4;

-- The Data Cruncher (id=5) no tiene puntuaciones aún.


-- Query de ejemplo para ver las hamburguesas con su puntuación promedio
SELECT
    id,
    name,
    description,
    price,
    image_url,
    type,
    ingredients, -- Se mostrará como un array de texto
    rating_count,
    CASE
        WHEN rating_count > 0 THEN ROUND(total_score::NUMERIC / rating_count, 1)
        ELSE NULL -- o 0.0 si prefieres
    END AS average_rating
FROM
    burgers
ORDER BY
    id;

-- Query de ejemplo para filtrar por un ingrediente (ej: 'Queso Cheddar')
-- Se usa el operador ANY para buscar dentro del array de ingredientes.
SELECT
    id,
    name,
    description,
    price,
    image_url,
    type,
    ingredients,
    CASE
        WHEN rating_count > 0 THEN ROUND(total_score::NUMERIC / rating_count, 1)
        ELSE NULL
    END AS average_rating
FROM
    burgers
WHERE
    'Queso Cheddar' = ANY(ingredients) -- Busca si 'Queso Cheddar' está en el array
ORDER BY
    id;

-- Query para obtener todos los ingredientes únicos para los filtros del frontend
SELECT DISTINCT UNNEST(ingredients) AS ingredient
FROM burgers
ORDER BY ingredient;