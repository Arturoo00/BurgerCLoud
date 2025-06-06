// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Estado de la Aplicación ---
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- Selectores de Elementos Comunes ---
    // Es mejor obtenerlos aquí, y luego los event listeners verificarán si existen.
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navProfile = document.getElementById('nav-profile');
    const navPersonal = document.getElementById('nav-personal');
    const navLogout = document.getElementById('nav-logout'); // Obtener aquí
    const messagePlaceholder = document.getElementById('message-placeholder');
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

    function displayMessage(message, type = 'success', placeholder = messagePlaceholder /* Usar el global como default */) {
        const targetPlaceholder = placeholder || document.getElementById('message-placeholder'); // Fallback
        if (!targetPlaceholder) {
            console.warn("Message placeholder not found for message:", message);
            return;
        }
        targetPlaceholder.innerHTML = `<div class="${type}-message">${message}</div>`;
        setTimeout(() => { targetPlaceholder.innerHTML = ''; }, 5000);
    }

    function updateNav() {
        // Los selectores (navLogin, etc.) ya están definidos globalmente dentro de DOMContentLoaded
        if (currentUser) {
            if (navLogin) navLogin.classList.add('hidden');
            if (navRegister) navRegister.classList.add('hidden');
            if (navProfile) navProfile.classList.remove('hidden');
            if (navLogout) navLogout.classList.remove('hidden'); // navLogout se usa aquí
            
            if (currentUser.role === 'admin') {
                if (navPersonal) navPersonal.classList.remove('hidden');
            } else {
                if (navPersonal) navPersonal.classList.add('hidden');
            }
        } else {
            if (navLogin) navLogin.classList.remove('hidden');
            if (navRegister) navRegister.classList.remove('hidden');
            if (navProfile) navProfile.classList.add('hidden');
            if (navPersonal) navPersonal.classList.add('hidden');
            if (navLogout) navLogout.classList.add('hidden'); // y aquí
        }
    }

    function logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('cart');
        currentUser = null;
        cart = [];
        updateNav();
        updateCartSummary();
        if (window.location.pathname.includes('perfil.html') || window.location.pathname.includes('personal.html')) {
            window.location.href = 'login.html';
        } else {
            if(burgerGrid) loadBurgers();
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartSummary();
    }

    function addToCart(burger, quantity = 1) {
        const orderMessagePlaceholder = document.getElementById('order-message-placeholder');
        if (!currentUser) {
            displayMessage("Debes iniciar sesión para añadir productos al carrito.", "error", orderMessagePlaceholder || messagePlaceholder);
            return;
        }
        const existingItem = cart.find(item => item.id === burger.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...burger, quantity });
        }
        saveCart();
        displayMessage(`${burger.name} añadido al carrito.`, "success", orderMessagePlaceholder || messagePlaceholder);
    }

    function updateCartSummary() {
        const cartSummaryDiv = document.getElementById('cart-summary');
        const cartItemsList = document.getElementById('cart-items-list');
        const cartTotalSpan = document.getElementById('cart-total');
        const checkoutButton = document.getElementById('checkout-button');
        const orderMessagePlaceholder = document.getElementById('order-message-placeholder');

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
                    displayMessage("Debes iniciar sesión para realizar un pedido.", "error", orderMessagePlaceholder);
                    return;
                }
                if (cart.length === 0) {
                    displayMessage("Tu carrito está vacío.", "error", orderMessagePlaceholder);
                    return;
                }

                const orderItems = cart.map(item => ({
                    burgerId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }));

                try {
                    const response = await window.api.placeOrder(currentUser.id, orderItems);
                    if (response.success) {
                        displayMessage(`Pedido realizado con éxito. ID: ${response.order.id}`, "success", orderMessagePlaceholder);
                        cart = [];
                        saveCart();
                    } else {
                        displayMessage(`Error al realizar el pedido: ${response.message}`, "error", orderMessagePlaceholder);
                    }
                } catch (error) {
                    console.error("Error placing order:", error);
                    displayMessage("Error de conexión al realizar el pedido.", "error", orderMessagePlaceholder);
                }
            };
        }
    }
    
    // --- Funciones de renderizado (renderBurgerCard, loadBurgers) ---
    // (Sin cambios significativos aquí, asumiendo que están correctas)
    function renderBurgerCard(burger) {
        const card = document.createElement('div');
        card.className = 'burger-card';
        const orderMessagePlaceholder = document.getElementById('order-message-placeholder');

        card.innerHTML = `
            <img src="${burger.imageUrl || burger.image_url || 'images/burger_placeholder.png'}" alt="${burger.name}" onerror="this.src='images/burger_placeholder.png'">
            <h3>${burger.name}</h3>
            <p>${burger.description || ''}</p>
            <p class="ingredients">Ingredientes: ${(Array.isArray(burger.ingredients) ? burger.ingredients.join(', ') : 'No especificados')}</p>
            <p class="price">${typeof burger.price === 'number' ? burger.price.toFixed(2) : 'N/A'} €</p>
            <div class="rating">
                Puntuación: ${parseFloat(burger.avg_rating) > 0 ? burger.avg_rating + ' / 5 (' + burger.ratingCount + ' votos)' : 'Sin puntuar'}
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
            const starElements = card.querySelectorAll('.stars span');
            starElements.forEach(star => {
                star.addEventListener('click', async (e) => {
                    const score = parseInt(e.target.dataset.score);
                    const burgerId = parseInt(e.target.closest('.stars').dataset.burgerId);
                    try {
                        const response = await window.api.rateBurger(burgerId, currentUser.id, score);
                        if (response.success) {
                            displayMessage("Puntuación enviada.", "success", orderMessagePlaceholder || messagePlaceholder);
                            loadBurgers(typeFilter ? typeFilter.value : 'all');
                        } else {
                            displayMessage(response.message || "Error al puntuar.", "error", orderMessagePlaceholder || messagePlaceholder);
                        }
                    } catch (error) {
                        console.error("Error rating burger:", error);
                        displayMessage("Error de conexión al puntuar.", "error", orderMessagePlaceholder || messagePlaceholder);
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
                burgerGrid.innerHTML = `<p>Error al cargar las hamburguesas: ${response.message || 'Error desconocido'}</p>`;
            }
        } catch (error) {
            hideLoader(burgerGridLoader);
            console.error("Error fetching burgers:", error);
            burgerGrid.innerHTML = "<p>Error de conexión al cargar las hamburguesas.</p>";
        }
        updateCartSummary();
    }


    // --- Lógica Específica de Páginas ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;
            try {
                const response = await window.api.loginUser(username, password);
                if (response.success && response.user) { 
                    currentUser = response.user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    displayMessage("Login exitoso. Redirigiendo...", "success", messagePlaceholder);
                    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
                } else {
                    displayMessage(response.message || "Error de login desconocido.", "error", messagePlaceholder);
                }
            } catch (error) {
                console.error("Login error:", error);
                displayMessage("Error de conexión durante el login.", "error", messagePlaceholder);
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm['confirm-password'].value;

            if (password !== confirmPassword) {
                displayMessage("Las contraseñas no coinciden.", "error", messagePlaceholder);
                return;
            }
            try {
                const response = await window.api.registerUser(username, password, email);
                if (response.success) {
                    displayMessage("Registro exitoso. Ahora puedes iniciar sesión.", "success", messagePlaceholder);
                    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                } else {
                    displayMessage(response.message || "Error de registro desconocido", "error", messagePlaceholder);
                }
            } catch (error) {
                console.error("Registration error:", error);
                displayMessage("Error de conexión durante el registro.", "error", messagePlaceholder);
            }
        });
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
                    // Ensure order.items is an array and items have a name property
                    let itemsSummary = Array.isArray(order.items) ? order.items.map(item => `${item.name || 'Artículo'} (x${item.quantity})`).join(', ') : 'No hay detalles';
                    li.innerHTML = `
                        <strong>Pedido ID:</strong> ${order.id}<br>
                        <strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
                        <strong>Total:</strong> ${typeof order.total === 'number' ? order.total.toFixed(2) : 'N/A'} €<br>
                        <strong>Artículos:</strong> ${itemsSummary}<br>
                        <strong>Estado:</strong> ${order.status || 'Desconocido'}
                    `;
                    ul.appendChild(li);
                });
                ordersListDiv.appendChild(ul);
            } else if (response.success) {
                ordersListDiv.innerHTML = "<p>No has realizado ningún pedido todavía.</p>";
            } else {
                ordersListDiv.innerHTML = `<p>Error al cargar tus pedidos: ${response.message || 'Error desconocido'}</p>`;
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
                response.data.forEach(burger => { // Assuming data is an array of burger objects with user_score
                    const li = document.createElement('li');
                    li.className = 'rated-burger-item';
                    li.innerHTML = `
                        <strong>${burger.name || 'Hamburguesa desconocida'}</strong> - Tu puntuación: ${burger.user_score || 'N/A'} / 5 estrellas
                    `;
                    ul.appendChild(li);
                });
                ratingsListDiv.appendChild(ul);
            } else if (response.success) {
                ratingsListDiv.innerHTML = "<p>No has puntuado ninguna hamburguesa todavía.</p>";
            } else {
                ratingsListDiv.innerHTML = `<p>Error al cargar tus puntuaciones: ${response.message || 'Error desconocido'}</p>`;
            }
        } catch (error) {
            hideLoader(ratingsLoader);
            console.error("Error fetching user ratings:", error);
            ratingsListDiv.innerHTML = "<p>Error de conexión al cargar tus puntuaciones.</p>";
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
            if (response.success && response.data) {
                if (response.data.images && response.data.images.length > 0) {
                    response.data.images.forEach(img => {
                        const item = document.createElement('div');
                        item.className = 'media-item';
                        item.innerHTML = `
                            <img src="${img.url}" alt="${img.title}">
                            <p>${img.title}</p>
                        `;
                        imagesGrid.appendChild(item);
                    });
                } else {
                    imagesGrid.innerHTML = "<p>No hay imágenes disponibles.</p>";
                }

                if (response.data.documents && response.data.documents.length > 0) {
                    response.data.documents.forEach(doc => {
                        const item = document.createElement('li');
                        item.innerHTML = `<a href="${doc.url}" target="_blank">${doc.title} (${doc.type})</a>`;
                        documentsList.appendChild(item);
                    });
                } else {
                    documentsList.innerHTML = "<li>No hay documentos disponibles.</li>";
                }

            } else {
                imagesGrid.innerHTML = `<p>Error al cargar imágenes: ${response.message || ''}</p>`;
                documentsList.innerHTML = `<li>Error al cargar documentos: ${response.message || ''}</li>`;
            }
        } catch (error) {
            console.error("Error fetching company media:", error);
            imagesGrid.innerHTML = "<p>Error de conexión al cargar imágenes.</p>";
            documentsList.innerHTML = "<li>Error de conexión al cargar documentos.</li>";
        }
    }


    // --- Event Listeners Globales ---
    // navLogout se obtiene al principio del DOMContentLoaded.
    // El error "navLogout is not defined" no debería ocurrir si el script se carga correctamente.
    if (navLogout) { // Esta comprobación es crucial.
        navLogout.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    } else {
        // Esto solo es para depurar si el elemento REALMENTE no está NUNCA en la página
        // donde se espera. Si index.html siempre tiene nav-logout, esto no debería pasar.
        // console.warn("El elemento nav-logout no se encontró en esta página al configurar el event listener.");
    }


    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            loadBurgers(e.target.value);
        });
    }

    // --- Inicialización ---
    updateNav(); // Llama a esto primero para configurar la visibilidad de los elementos del nav
    
    // Lógica específica de la página actual
    const currentPage = window.location.pathname;

    if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/BurgerCloudApp/')) { // Ajusta la última condición a tu context path si es necesario
        if (burgerGrid) loadBurgers(); // burgerGrid ya se obtuvo arriba
        if (document.getElementById('cart-summary')) updateCartSummary();
    } else if (currentPage.includes('perfil.html')) {
        const profileContent = document.getElementById('profile-content');
        const profileInfoLoader = document.getElementById('profile-info-loader');
        const profileAuthMessage = document.getElementById('profile-auth-message');

        if (!currentUser) {
            if(profileInfoLoader) hideLoader(profileInfoLoader);
            if(profileAuthMessage) profileAuthMessage.classList.remove('hidden');
            if(profileContent) profileContent.classList.add('hidden');
        } else {
            if(profileInfoLoader) hideLoader(profileInfoLoader);
            if(profileContent) profileContent.classList.remove('hidden');
            if(profileAuthMessage) profileAuthMessage.classList.add('hidden');

            const profileUsernameEl = document.getElementById('profile-username');
            const profileEmailEl = document.getElementById('profile-email');
            const profileRoleEl = document.getElementById('profile-role');

            if(profileUsernameEl) profileUsernameEl.textContent = currentUser.username;
            if(profileEmailEl) profileEmailEl.textContent = currentUser.email;
            if(profileRoleEl) profileRoleEl.textContent = currentUser.role;

            loadUserOrders();
            loadUserRatings();
        }
    } else if (currentPage.includes('personal.html')) {
        const personalContent = document.getElementById('personal-content');
        const personalContentLoader = document.getElementById('personal-content-loader');
        const personalAuthMessage = document.getElementById('personal-auth-message');

        if (!currentUser || currentUser.role !== 'admin') {
            if(personalContentLoader) hideLoader(personalContentLoader);
            if(personalAuthMessage) personalAuthMessage.classList.remove('hidden');
            if(personalContent) personalContent.classList.add('hidden');
        } else {
            if(personalContentLoader) hideLoader(personalContentLoader);
            if(personalContent) personalContent.classList.remove('hidden');
            if(personalAuthMessage) personalAuthMessage.classList.add('hidden');
            loadCompanyMedia();
        }
    }
    // No es necesario llamar a loadBurgers o updateCartSummary aquí de nuevo si ya se hizo en la lógica de index.html
});