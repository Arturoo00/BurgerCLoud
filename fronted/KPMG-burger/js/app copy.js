// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = '/api'; // En una app real, sería la URL de tu backend J2EE

    // --- Estado de la Aplicación ---
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- Selectores de Elementos Comunes ---
    const mainNav = document.getElementById('main-nav');
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navProfile = document.getElementById('nav-profile');
    const navPersonal = document.getElementById('nav-personal');
    const navLogout = document.getElementById('nav-logout');
    const messagePlaceholder = document.getElementById('message-placeholder'); // Para login/register
    const burgerGrid = document.getElementById('burger-grid');
    const burgerGridLoader = document.getElementById('burger-grid-loader');
    const typeFilter = document.getElementById('type-filter');

    // --- Funciones Auxiliares ---
    function showLoader(loaderElement) {
        if(loaderElement) loaderElement.classList.remove('hidden');
    }
    function hideLoader(loaderElement) {
        if(loaderElement) loaderElement.classList.add('hidden');
    }

    function displayMessage(message, type = 'success', placeholder = messagePlaceholder) {
        if (!placeholder) return;
        placeholder.innerHTML = `<div class="${type}-message">${message}</div>`;
        setTimeout(() => { placeholder.innerHTML = ''; }, 5000);
    }

    function updateNav() {
        if (currentUser) {
            navLogin?.classList.add('hidden');
            navRegister?.classList.add('hidden');
            navProfile?.classList.remove('hidden');
            navLogout?.classList.remove('hidden');
            if (currentUser.role === 'admin') {
                navPersonal?.classList.remove('hidden');
            } else {
                navPersonal?.classList.add('hidden');
            }
        } else {
            navLogin?.classList.remove('hidden');
            navRegister?.classList.remove('hidden');
            navProfile?.classList.add('hidden');
            navPersonal?.classList.add('hidden');
            navLogout?.classList.add('hidden');
        }
    }

    function logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cart'); // Opcional: limpiar carrito al desloguear
        currentUser = null;
        cart = [];
        updateNav();
        updateCartSummary(); // Actualiza el resumen del carrito en la página principal
        // Redirigir a la página de inicio o login
        if (window.location.pathname.includes('perfil.html') || window.location.pathname.includes('personal.html')) {
            window.location.href = 'login.html';
        } else {
            // Si está en index, simplemente actualiza la UI
            // Si está en login/register, no hace falta redirigir
            if(burgerGrid) loadBurgers(); // Recargar hamburguesas para quitar opciones de usuario
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartSummary();
    }

    function addToCart(burger, quantity = 1) {
        if (!currentUser) {
            displayMessage("Debes iniciar sesión para añadir productos al carrito.", "error", document.getElementById('order-message-placeholder') || messagePlaceholder);
            return;
        }
        const existingItem = cart.find(item => item.id === burger.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...burger, quantity });
        }
        saveCart();
        displayMessage(`${burger.name} añadido al carrito.`, "success", document.getElementById('order-message-placeholder') || messagePlaceholder);
    }

    function updateCartSummary() {
        const cartSummaryDiv = document.getElementById('cart-summary');
        const cartItemsList = document.getElementById('cart-items-list');
        const cartTotalSpan = document.getElementById('cart-total');
        const checkoutButton = document.getElementById('checkout-button');

        if (!cartSummaryDiv || !cartItemsList || !cartTotalSpan) return;

        if (cart.length === 0 || !currentUser) {
            cartSummaryDiv.classList.add('hidden');
            return;
        }

        cartSummaryDiv.classList.remove('hidden');
        cartItemsList.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)} €`;
            cartItemsList.appendChild(li);
            total += item.price * item.quantity;
        });
        cartTotalSpan.textContent = total.toFixed(2);
        
        if (checkoutButton) {
            checkoutButton.onclick = async () => {
                if (!currentUser) {
                    displayMessage("Debes iniciar sesión para realizar un pedido.", "error", document.getElementById('order-message-placeholder'));
                    return;
                }
                if (cart.length === 0) {
                    displayMessage("Tu carrito está vacío.", "error", document.getElementById('order-message-placeholder'));
                    return;
                }

                const orderItems = cart.map(item => ({
                    burgerId: item.id,
                    name: item.name, // Para mostrar en el perfil
                    quantity: item.quantity,
                    price: item.price
                }));

                try {
                    const response = await window.api.placeOrder(currentUser.id, orderItems);
                    if (response.success) {
                        displayMessage(`Pedido realizado con éxito. ID: ${response.order.id}`, "success", document.getElementById('order-message-placeholder'));
                        cart = [];
                        saveCart(); // Esto limpiará el carrito y ocultará el resumen
                    } else {
                        displayMessage(`Error al realizar el pedido: ${response.message}`, "error", document.getElementById('order-message-placeholder'));
                    }
                } catch (error) {
                    console.error("Error placing order:", error);
                    displayMessage("Error de conexión al realizar el pedido.", "error", document.getElementById('order-message-placeholder'));
                }
            };
        }
    }


    // --- Funciones de renderizado ---
    function renderBurgerCard(burger) {
        const card = document.createElement('div');
        card.className = 'burger-card';
        card.innerHTML = `
            <img src="${burger.image_url}" alt="${burger.name}" onerror="this.src='images/burger_placeholder.png'">
            <h3>${burger.name}</h3>
            <p>${burger.description}</p>
            <p class="ingredients">Ingredientes: ${burger.ingredients.join(', ')}</p>
            <p class="price">${burger.price.toFixed(2)} €</p>
            <div class="rating">
                Puntuación: ${burger.avg_rating > 0 ? burger.avg_rating + ' / 5 (' + burger.rating_count + ' votos)' : 'Sin puntuar'}
                ${currentUser ? `
                <div class="stars" data-burger-id="${burger.id}">
                    ${[1,2,3,4,5].map(star => `<span data-score="${star}">☆</span>`).join('')}
                </div>` : ''}
            </div>
            ${currentUser ? `
            <div class="burger-actions">
                <div class="quantity-selector">
                    <label for="qty-${burger.id}" class="hidden">Cantidad:</label>
                    <input type="number" id="qty-${burger.id}" value="1" min="1" max="10">
                </div>
                <button class="btn btn-primary add-to-cart-btn" data-burger-id="${burger.id}">Añadir</button>
            </div>
            ` : '<p><a href="login.html">Inicia sesión</a> para pedir o puntuar.</p>'}
        `;

        if (currentUser) {
            // Marcar estrellas si el usuario ya ha puntuado esta hamburguesa
            // Esto requiere una llamada adicional o incluir las puntuaciones del usuario en getBurgers
            // Por simplicidad, no se incluye aquí, pero se podría añadir.

            const starElements = card.querySelectorAll('.stars span');
            starElements.forEach(star => {
                star.addEventListener('click', async (e) => {
                    const score = parseInt(e.target.dataset.score);
                    const burgerId = parseInt(e.target.closest('.stars').dataset.burgerId);
                    try {
                        const response = await window.api.rateBurger(burgerId, currentUser.id, score);
                        if (response.success) {
                            displayMessage("Puntuación enviada.", "success", document.getElementById('order-message-placeholder') || messagePlaceholder);
                            loadBurgers(typeFilter ? typeFilter.value : 'all'); // Recargar para ver la nueva puntuación
                        } else {
                            displayMessage(response.message, "error", document.getElementById('order-message-placeholder') || messagePlaceholder);
                        }
                    } catch (error) {
                        console.error("Error rating burger:", error);
                        displayMessage("Error al puntuar.", "error", document.getElementById('order-message-placeholder') || messagePlaceholder);
                    }
                });
            });

            const addToCartBtn = card.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => {
                    const quantityInput = card.querySelector(`#qty-${burger.id}`);
                    const quantity = parseInt(quantityInput.value);
                    if (quantity > 0) {
                        addToCart(burger, quantity);
                    }
                });
            }
        }
        return card;
    }

    async function loadBurgers(filter = 'all') {
        if (!burgerGrid) return;
        showLoader(burgerGridLoader);
        burgerGrid.innerHTML = '';
        try {
            const response = await window.api.getBurgers(filter);
            hideLoader(burgerGridLoader);
            if (response.success) {
                if (response.data.length === 0) {
                    burgerGrid.innerHTML = "<p>No hay hamburguesas que coincidan con este filtro.</p>";
                } else {
                    response.data.forEach(burger => {
                        burgerGrid.appendChild(renderBurgerCard(burger));
                    });
                }
            } else {
                burgerGrid.innerHTML = "<p>Error al cargar las hamburguesas.</p>";
            }
        } catch (error) {
            hideLoader(burgerGridLoader);
            console.error("Error fetching burgers:", error);
            burgerGrid.innerHTML = "<p>Error de conexión al cargar las hamburguesas.</p>";
        }
        updateCartSummary(); // Asegurarse que el carro se muestra si hay items y usuario logueado
    }


    // --- Lógica Específica de Páginas ---

    // Página de Login (login.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;
            try {
                const response = await window.api.loginUser(username, password);
                if (response.success) {
                    currentUser = response.user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    displayMessage("Login exitoso. Redirigiendo...", "success");
                    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
                } else {
                    displayMessage(response.message, "error");
                }
            } catch (error) {
                console.error("Login error:", error);
                displayMessage("Error de conexión durante el login.", "error");
            }
        });
    }

    // Página de Registro (register.html)
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm['confirm-password'].value;

            if (password !== confirmPassword) {
                displayMessage("Las contraseñas no coinciden.", "error");
                return;
            }
            try {
                // El rol por defecto es 'client' en la API simulada
                const response = await window.api.registerUser(username, password, email);
                if (response.success) {
                    displayMessage("Registro exitoso. Ahora puedes iniciar sesión.", "success");
                    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                } else {
                    displayMessage(response.message, "error");
                }
            } catch (error) {
                console.error("Registration error:", error);
                displayMessage("Error de conexión durante el registro.", "error");
            }
        });
    }

    // Página de Perfil (perfil.html)
    if (window.location.pathname.includes('perfil.html')) {
        const profileContent = document.getElementById('profile-content');
        const profileInfoLoader = document.getElementById('profile-info-loader');
        const profileAuthMessage = document.getElementById('profile-auth-message');

        if (!currentUser) {
            hideLoader(profileInfoLoader);
            profileAuthMessage.classList.remove('hidden');
            profileContent.classList.add('hidden');
        } else {
            hideLoader(profileInfoLoader);
            profileContent.classList.remove('hidden');
            profileAuthMessage.classList.add('hidden');

            document.getElementById('profile-username').textContent = currentUser.username;
            document.getElementById('profile-email').textContent = currentUser.email;
            document.getElementById('profile-role').textContent = currentUser.role;

            loadUserOrders();
            loadUserRatings();
        }
    }

    async function loadUserOrders() {
        const ordersListDiv = document.getElementById('user-orders-list');
        const ordersLoader = document.getElementById('orders-loader');
        if (!ordersListDiv || !currentUser) return;

        showLoader(ordersLoader);
        ordersListDiv.innerHTML = '';
        try {
            const response = await window.api.getUserOrders(currentUser.id);
            hideLoader(ordersLoader);
            if (response.success && response.data.length > 0) {
                const ul = document.createElement('ul');
                response.data.forEach(order => {
                    const li = document.createElement('li');
                    li.className = 'order-item';
                    let itemsSummary = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
                    li.innerHTML = `
                        <strong>Pedido ID:</strong> ${order.id}<br>
                        <strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
                        <strong>Total:</strong> ${order.total.toFixed(2)} €<br>
                        <strong>Artículos:</strong> ${itemsSummary}<br>
                        <strong>Estado:</strong> ${order.status}
                    `;
                    ul.appendChild(li);
                });
                ordersListDiv.appendChild(ul);
            } else if (response.success) {
                ordersListDiv.innerHTML = "<p>No has realizado ningún pedido todavía.</p>";
            } else {
                ordersListDiv.innerHTML = "<p>Error al cargar tus pedidos.</p>";
            }
        } catch (error) {
            hideLoader(ordersLoader);
            console.error("Error fetching user orders:", error);
            ordersListDiv.innerHTML = "<p>Error de conexión al cargar tus pedidos.</p>";
        }
    }

    async function loadUserRatings() {
        const ratingsListDiv = document.getElementById('user-ratings-list');
        const ratingsLoader = document.getElementById('ratings-loader');
        if (!ratingsListDiv || !currentUser) return;
        
        showLoader(ratingsLoader);
        ratingsListDiv.innerHTML = '';
        try {
            const response = await window.api.getUserRatings(currentUser.id);
            hideLoader(ratingsLoader);
            if (response.success && response.data.length > 0) {
                const ul = document.createElement('ul');
                response.data.forEach(burger => {
                    const li = document.createElement('li');
                    li.className = 'rated-burger-item';
                    li.innerHTML = `
                        <strong>${burger.name}</strong> - Tu puntuación: ${burger.user_score} / 5 estrellas
                    `;
                    ul.appendChild(li);
                });
                ratingsListDiv.appendChild(ul);
            } else if (response.success) {
                ratingsListDiv.innerHTML = "<p>No has puntuado ninguna hamburguesa todavía.</p>";
            } else {
                ratingsListDiv.innerHTML = "<p>Error al cargar tus puntuaciones.</p>";
            }
        } catch (error) {
            hideLoader(ratingsLoader);
            console.error("Error fetching user ratings:", error);
            ratingsListDiv.innerHTML = "<p>Error de conexión al cargar tus puntuaciones.</p>";
        }
    }

    // Página de Personal (personal.html)
    if (window.location.pathname.includes('personal.html')) {
        const personalContent = document.getElementById('personal-content');
        const personalContentLoader = document.getElementById('personal-content-loader');
        const personalAuthMessage = document.getElementById('personal-auth-message');

        if (!currentUser || currentUser.role !== 'admin') {
            hideLoader(personalContentLoader);
            personalAuthMessage.classList.remove('hidden');
            personalContent.classList.add('hidden');
        } else {
            hideLoader(personalContentLoader);
            personalContent.classList.remove('hidden');
            personalAuthMessage.classList.add('hidden');
            loadCompanyMedia();
        }
    }

    async function loadCompanyMedia() {
        const imagesGrid = document.getElementById('company-images-grid');
        const documentsList = document.getElementById('company-documents-list');
        if (!imagesGrid || !documentsList) return;

        imagesGrid.innerHTML = '';
        documentsList.innerHTML = '';

        try {
            const response = await window.api.getCompanyMedia();
            if (response.success) {
                // Renderizar imágenes
                response.data.images.forEach(img => {
                    const item = document.createElement('div');
                    item.className = 'media-item';
                    item.innerHTML = `
                        <img src="${img.url}" alt="${img.title}">
                        <p>${img.title}</p>
                    `;
                    imagesGrid.appendChild(item);
                });
                if (response.data.images.length === 0) {
                    imagesGrid.innerHTML = "<p>No hay imágenes disponibles.</p>";
                }

                // Renderizar documentos
                response.data.documents.forEach(doc => {
                    const item = document.createElement('li');
                    item.innerHTML = `<a href="${doc.url}" target="_blank">${doc.title} (${doc.type})</a>`;
                    documentsList.appendChild(item);
                });
                if (response.data.documents.length === 0) {
                    documentsList.innerHTML = "<li>No hay documentos disponibles.</li>";
                }

            } else {
                imagesGrid.innerHTML = "<p>Error al cargar imágenes.</p>";
                documentsList.innerHTML = "<li>Error al cargar documentos.</li>";
            }
        } catch (error) {
            console.error("Error fetching company media:", error);
            imagesGrid.innerHTML = "<p>Error de conexión al cargar imágenes.</p>";
            documentsList.innerHTML = "<li>Error de conexión al cargar documentos.</li>";
        }
    }

    // --- Event Listeners Globales ---
    if (navLogout) {
        navLogout.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            loadBurgers(e.target.value);
        });
    }

    // --- Inicialización ---
    updateNav();
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadBurgers();
        updateCartSummary();
    }
});