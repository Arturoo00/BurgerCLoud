-- Eliminar tablas si existen para permitir la re-ejecución del script (en orden de dependencia)
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS burgers;
DROP TABLE IF EXISTS users; -- Nueva tabla

-- Tabla para los usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- En una app real, aquí se guarda el hash de la contraseña
    email VARCHAR(100) UNIQUE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'client')), -- Roles definidos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para las hamburguesas (sin cambios respecto a la versión anterior simplificada)
CREATE TABLE burgers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(5, 2) NOT NULL,
    image_url VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    ingredients TEXT[], -- Array de ingredientes
    total_score INTEGER DEFAULT 0,
    rating_count INTEGER DEFAULT 0
);

-- Tabla para las puntuaciones de las hamburguesas
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    burger_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, -- Quién hizo la puntuación
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (burger_id) REFERENCES burgers(id), -- Sin ON DELETE CASCADE
    FOREIGN KEY (user_id) REFERENCES users(id),     -- Sin ON DELETE CASCADE
    CONSTRAINT unique_user_burger_rating UNIQUE (user_id, burger_id) -- Un usuario solo puede puntuar una hamburguesa una vez
);

-- Insertar algunos usuarios de ejemplo
-- ¡IMPORTANTE! En una aplicación real, NUNCA guardes contraseñas en texto plano.
-- Estas contraseñas son solo para el ejemplo y deberían ser hashes generados por tu backend.
INSERT INTO users (username, password_hash, email, role) VALUES
('admin_kpmg', 'hashed_password_admin', 'admin@kpmg.burger', 'admin'),
('cliente_juan', 'hashed_password_juan', 'juan.perez@email.com', 'client'),
('cliente_ana', 'hashed_password_ana', 'ana.gomez@email.com', 'client');

-- Insertar algunas hamburguesas de ejemplo (igual que antes)
INSERT INTO burgers (name, description, price, image_url, type, ingredients) VALUES
('KPMG Classic', 'La auténtica experiencia KPMG con carne de vacuno premium, queso cheddar fundido, lechuga fresca y tomate en pan clásico.', 10.50, 'https://via.placeholder.com/300x200/FF5733/FFFFFF?text=KPMG+Classic', 'classic',
    '{"Carne de Vacuno", "Queso Cheddar", "Lechuga", "Tomate", "Pan Clásico", "Salsa Especial KPMG"}'),
('Cloud BBQ Beast', 'Una bestia de sabor con doble carne, bacon crujiente, cebolla caramelizada y nuestra salsa BBQ secreta en pan brioche.', 13.75, 'https://via.placeholder.com/300x200/C70039/FFFFFF?text=Cloud+BBQ', 'bbq',
    '{"Carne de Vacuno", "Bacon", "Cebolla Caramelizada", "Salsa BBQ", "Pan Brioche"}'),
('Veggie Innovator', 'Deliciosa hamburguesa vegana a base de champiñones portobello, con aguacate, rúcula y un toque de nuestra salsa especial KPMG en pan integral.', 11.25, 'https://via.placeholder.com/300x200/900C3F/FFFFFF?text=Veggie+Innovator', 'veggie',
    '{"Hamburguesa Vegana", "Champiñones Portobello", "Aguacate", "Rúcula", "Pan Integral"}'),
('Gourmet Consultant', 'Para paladares exigentes: carne de vacuno madurada, queso de cabra, rúcula y cebolla caramelizada en pan brioche artesanal.', 15.00, 'https://via.placeholder.com/300x200/581845/FFFFFF?text=Gourmet+Consultant', 'gourmet',
    '{"Carne de Vacuno Madurada", "Queso de Cabra", "Rúcula", "Cebolla Caramelizada", "Pan Brioche Artesanal"}');
    -- Agregamos una más para que no todas tengan ratings
INSERT INTO burgers (name, description, price, image_url, type, ingredients) VALUES
('The Intern Special', 'Simple y efectiva. Carne, queso y pan. ¡Directo al grano!', 8.00, 'https://via.placeholder.com/300x200/008000/FFFFFF?text=Intern+Special', 'classic',
    '{"Carne de Vacuno", "Queso Americano", "Pan Clásico"}');


-- Insertar algunas puntuaciones de ejemplo, ahora asociadas a usuarios
-- Asumimos que los IDs de usuario son 1 (admin_kpmg), 2 (cliente_juan), 3 (cliente_ana)
-- Asumimos que los IDs de hamburguesas son 1 (KPMG Classic), 2 (Cloud BBQ), 3 (Veggie), 4 (Gourmet)

-- Puntuaciones para KPMG Classic (burger_id=1)
INSERT INTO ratings (burger_id, user_id, score) VALUES (1, 2, 5); -- cliente_juan puntúa KPMG Classic
INSERT INTO ratings (burger_id, user_id, score) VALUES (1, 3, 4); -- cliente_ana puntúa KPMG Classic
UPDATE burgers SET total_score = 5+4, rating_count = 2 WHERE id = 1;

-- Puntuaciones para Cloud BBQ Beast (burger_id=2)
INSERT INTO ratings (burger_id, user_id, score) VALUES (2, 2, 5); -- cliente_juan puntúa Cloud BBQ
INSERT INTO ratings (burger_id, user_id, score) VALUES (2, 1, 5); -- admin_kpmg puntúa Cloud BBQ (quizás para probar)
INSERT INTO ratings (burger_id, user_id, score) VALUES (2, 3, 4); -- cliente_ana puntúa Cloud BBQ
UPDATE burgers SET total_score = 5+5+4, rating_count = 3 WHERE id = 2;

-- Puntuaciones para Veggie Innovator (burger_id=3)
INSERT INTO ratings (burger_id, user_id, score) VALUES (3, 3, 4); -- cliente_ana puntúa Veggie
UPDATE burgers SET total_score = 4, rating_count = 1 WHERE id = 3;

-- Puntuaciones para Gourmet Consultant (burger_id=4)
INSERT INTO ratings (burger_id, user_id, score) VALUES (4, 2, 5); -- cliente_juan puntúa Gourmet
INSERT INTO ratings (burger_id, user_id, score) VALUES (4, 1, 3); -- admin_kpmg puntúa Gourmet
UPDATE burgers SET total_score = 5+3, rating_count = 2 WHERE id = 4;


-- Query de ejemplo para ver las hamburguesas con su puntuación promedio
SELECT
    b.id,
    b.name,
    b.description,
    b.price,
    b.image_url,
    b.type,
    b.ingredients,
    b.rating_count,
    CASE
        WHEN b.rating_count > 0 THEN ROUND(b.total_score::NUMERIC / b.rating_count, 1)
        ELSE NULL
    END AS average_rating
FROM
    burgers b
ORDER BY
    b.id;

-- Query de ejemplo para ver las puntuaciones junto con el nombre del usuario y la hamburguesa
SELECT
    r.id AS rating_id,
    u.username AS user_who_rated,
    b.name AS burger_name,
    r.score,
    r.created_at
FROM
    ratings r
JOIN
    users u ON r.user_id = u.id
JOIN
    burgers b ON r.burger_id = b.id
ORDER BY
    r.created_at DESC;

-- Query para obtener todos los ingredientes únicos para los filtros del frontend
SELECT DISTINCT UNNEST(ingredients) AS ingredient
FROM burgers
WHERE ingredients IS NOT NULL -- Evitar error si alguna hamburguesa no tiene ingredientes
ORDER BY ingredient;