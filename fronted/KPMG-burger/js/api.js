// js/api.js

// Simulación de la base de datos en memoria
const mockDatabase = {
    users: [
        { id: 1, username: 'admin_nttdata', password_hash: 'hashed_password_admin', email: 'admin@nttdata.burger', role: 'admin', created_at: new Date().toISOString() },
        { id: 2, username: 'cliente_juan', password_hash: 'hashed_password_juan', email: 'juan.perez@email.com', role: 'client', created_at: new Date().toISOString() },
        { id: 3, username: 'cliente_ana', password_hash: 'hashed_password_ana', email: 'ana.gomez@email.com', role: 'client', created_at: new Date().toISOString() }
    ],
    burgers: [
        { id: 1, name: 'NTTDATA Classic', description: 'La auténtica experiencia NTTDATA con carne de vacuno premium, queso cheddar fundido, lechuga fresca y tomate en pan clásico.', price: 10.50, image_url: 'https://via.placeholder.com/300x200/00A0E0/FFFFFF?text=NTTDATA+Classic', type: 'classic', ingredients: ['Carne de Vacuno', 'Queso Cheddar', 'Lechuga', 'Tomate', 'Pan Clásico', 'Salsa Especial NTTDATA'], total_score: 9, rating_count: 2 },
        { id: 2, name: 'Cloud BBQ Beast', description: 'Una bestia de sabor con doble carne, bacon crujiente, cebolla caramelizada y nuestra salsa BBQ secreta en pan brioche.', price: 13.75, image_url: 'https://via.placeholder.com/300x200/3E4B5B/FFFFFF?text=Cloud+BBQ', type: 'bbq', ingredients: ['Carne de Vacuno', 'Bacon', 'Cebolla Caramelizada', 'Salsa BBQ', 'Pan Brioche'], total_score: 14, rating_count: 3 },
        { id: 3, name: 'Veggie Innovator', description: 'Deliciosa hamburguesa vegana a base de champiñones portobello, con aguacate, rúcula y un toque de nuestra salsa especial NTTDATA en pan integral.', price: 11.25, image_url: 'https://via.placeholder.com/300x200/7DBB00/FFFFFF?text=Veggie+Innovator', type: 'veggie', ingredients: ['Hamburguesa Vegana', 'Champiñones Portobello', 'Aguacate', 'Rúcula', 'Pan Integral'], total_score: 4, rating_count: 1 },
        { id: 4, name: 'Gourmet Consultant', description: 'Para paladares exigentes: carne de vacuno madurada, queso de cabra, rúcula y cebolla caramelizada en pan brioche artesanal.', price: 15.00, image_url: 'https://via.placeholder.com/300x200/A4007A/FFFFFF?text=Gourmet+Consultant', type: 'gourmet', ingredients: ['Carne de Vacuno Madurada', 'Queso de Cabra', 'Rúcula', 'Cebolla Caramelizada', 'Pan Brioche Artesanal'], total_score: 8, rating_count: 2 },
        { id: 5, name: 'The Intern Special', description: 'Simple y efectiva. Carne, queso y pan. ¡Directo al grano!', price: 8.00, image_url: 'https://via.placeholder.com/300x200/FF7F00/FFFFFF?text=Intern+Special', type: 'classic', ingredients: ['Carne de Vacuno', 'Queso Americano', 'Pan Clásico'], total_score: 0, rating_count: 0 }
    ],
    ratings: [
        { id: 1, burger_id: 1, user_id: 2, score: 5, created_at: new Date().toISOString() },
        { id: 2, burger_id: 1, user_id: 3, score: 4, created_at: new Date().toISOString() },
        { id: 3, burger_id: 2, user_id: 2, score: 5, created_at: new Date().toISOString() },
        { id: 4, burger_id: 2, user_id: 1, score: 5, created_at: new Date().toISOString() },
        { id: 5, burger_id: 2, user_id: 3, score: 4, created_at: new Date().toISOString() },
        { id: 6, burger_id: 3, user_id: 3, score: 4, created_at: new Date().toISOString() },
        { id: 7, burger_id: 4, user_id: 2, score: 5, created_at: new Date().toISOString() },
        { id: 8, burger_id: 4, user_id: 1, score: 3, created_at: new Date().toISOString() }
    ],
    // Simulación de pedidos (no persistente entre sesiones si no se usa localStorage en api.js)
    orders: [],
    // Simulación de documentos/imágenes para la página de personal
    companyMedia: {
        images: [
            { id: 1, title: "Oficina NTTDATA Madrid", url: "https://via.placeholder.com/400x250/00A0E0/FFFFFF?text=Oficina+Madrid" },
            { id: 2, title: "Equipo de Desarrollo", url: "https://via.placeholder.com/400x250/3E4B5B/FFFFFF?text=Equipo+Desarrollo" }
        ],
        documents: [
            { id: 1, title: "Informe Anual 2023", url: "#", type: "PDF" },
            { id: 2, title: "Guía de Bienvenida", url: "#", type: "DOCX" }
        ]
    }
};

// Simula una demora de red
const simulateNetworkDelay = (data) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(data);
        }, Math.random() * 500 + 200); // Entre 200ms y 700ms
    });
};

// --- Endpoints Simulados ---

// J2EE endpoint: /api/users/register
async function registerUser(username, password, email, role = 'client') {
    console.log("API_MOCK: registerUser called with", { username, password, email, role });
    return simulateNetworkDelay().then(() => {
        if (mockDatabase.users.find(u => u.username === username)) {
            return { success: false, message: "El nombre de usuario ya existe." };
        }
        if (mockDatabase.users.find(u => u.email === email)) {
            return { success: false, message: "El email ya está registrado." };
        }
        const newUser = {
            id: mockDatabase.users.length + 1,
            username,
            password_hash: `hashed_${password}`, // Simulación de hash
            email,
            role,
            created_at: new Date().toISOString()
        };
        mockDatabase.users.push(newUser);
        console.log("API_MOCK: New user added", newUser);
        return { success: true, user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role } };
    });
}

// J2EE endpoint: /api/users/login
async function loginUser(username, password) {
    console.log("API_MOCK: loginUser called with", { username, password });
    return simulateNetworkDelay().then(() => {
        const user = mockDatabase.users.find(u => u.username === username);
        // En una app real, el backend compararía el hash de la contraseña
        if (user && user.password_hash === `hashed_${password}`) {
            console.log("API_MOCK: Login successful for", username);
            return { success: true, user: { id: user.id, username: user.username, email: user.email, role: user.role, token: `mock_jwt_token_for_${user.id}` } };
        }
        console.log("API_MOCK: Login failed for", username);
        return { success: false, message: "Usuario o contraseña incorrectos." };
    });
}

// J2EE endpoint: /api/burgers
async function getBurgers(filterType = null) {
    console.log("API_MOCK: getBurgers called with filter:", filterType);
    return simulateNetworkDelay().then(() => {
        let burgers = mockDatabase.burgers.map(b => ({
            ...b,
            avg_rating: b.rating_count > 0 ? (b.total_score / b.rating_count).toFixed(1) : 0,
            // Aseguramos que ingredients siempre sea un array
            ingredients: Array.isArray(b.ingredients) ? b.ingredients : (b.ingredients ? [b.ingredients] : [])
        }));
        if (filterType && filterType !== "all") {
            burgers = burgers.filter(b => b.type === filterType);
        }
        console.log("API_MOCK: Returning burgers:", burgers.length);
        return { success: true, data: burgers };
    });
}

// J2EE endpoint: /api/burgers/{burgerId}/rate
async function rateBurger(burgerId, userId, score) {
    console.log("API_MOCK: rateBurger called with", { burgerId, userId, score });
    return simulateNetworkDelay().then(() => {
        const burger = mockDatabase.burgers.find(b => b.id === burgerId);
        const user = mockDatabase.users.find(u => u.id === userId);

        if (!burger || !user) {
            return { success: false, message: "Hamburguesa o usuario no encontrado." };
        }

        let existingRating = mockDatabase.ratings.find(r => r.burger_id === burgerId && r.user_id === userId);

        if (existingRating) {
            // Actualizar puntuación existente y total_score/rating_count de la hamburguesa
            burger.total_score = burger.total_score - existingRating.score + score;
            existingRating.score = score;
            existingRating.created_at = new Date().toISOString();
        } else {
            // Nueva puntuación
            mockDatabase.ratings.push({
                id: mockDatabase.ratings.length + 1,
                burger_id: burgerId,
                user_id: userId,
                score,
                created_at: new Date().toISOString()
            });
            burger.total_score += score;
            burger.rating_count += 1;
        }
        console.log("API_MOCK: Burger rated/updated", burger);
        return { success: true, message: "Puntuación registrada.", burger };
    });
}

// J2EE endpoint: /api/users/{userId}/ratings
async function getUserRatings(userId) {
    console.log("API_MOCK: getUserRatings called for user:", userId);
    return simulateNetworkDelay().then(() => {
        const ratings = mockDatabase.ratings.filter(r => r.user_id === userId);
        const ratedBurgers = ratings.map(r => {
            const burger = mockDatabase.burgers.find(b => b.id === r.burger_id);
            return { ...burger, user_score: r.score };
        });
        console.log("API_MOCK: Returning user ratings:", ratedBurgers.length);
        return { success: true, data: ratedBurgers };
    });
}

// J2EE endpoint: /api/orders (POST)
async function placeOrder(userId, items) { // items: [{ burgerId, quantity, price }]
    console.log("API_MOCK: placeOrder called for user:", userId, "with items:", items);
    return simulateNetworkDelay().then(() => {
        if (!mockDatabase.users.find(u => u.id === userId)) {
            return { success: false, message: "Usuario no encontrado." };
        }
        const orderId = `order_${Date.now()}_${userId}`;
        const newOrder = {
            id: orderId,
            userId,
            items,
            total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: "pending",
            createdAt: new Date().toISOString()
        };
        mockDatabase.orders.push(newOrder);
        console.log("API_MOCK: Order placed", newOrder);
        return { success: true, message: "Pedido realizado con éxito.", order: newOrder };
    });
}

// J2EE endpoint: /api/users/{userId}/orders (GET)
async function getUserOrders(userId) {
    console.log("API_MOCK: getUserOrders called for user:", userId);
    return simulateNetworkDelay().then(() => {
        const userOrders = mockDatabase.orders.filter(o => o.userId === userId);
        console.log("API_MOCK: Returning user orders:", userOrders.length);
        return { success: true, data: userOrders };
    });
}

// J2EE endpoint: /api/company/media
async function getCompanyMedia() {
    console.log("API_MOCK: getCompanyMedia called");
    return simulateNetworkDelay().then(() => {
        return { success: true, data: mockDatabase.companyMedia };
    });
}

// Exportar funciones para que app.js pueda usarlas
// En un entorno real, no se exportarían así, app.js haría `fetch`
window.api = {
    registerUser,
    loginUser,
    getBurgers,
    rateBurger,
    getUserRatings,
    placeOrder,
    getUserOrders,
    getCompanyMedia
};