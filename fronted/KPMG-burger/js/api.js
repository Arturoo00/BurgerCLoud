// js/api.js

// const API_BASE_URL = '/BurgerCloudApp/Controller'; // Example: Replace BurgerCloudApp with your app's context path
// We'll get this from app.js or define it more globally if needed.

// Helper function for making API calls
async function fetchFromBackend(action, params = {}, method = 'GET', body = null) {
    // This should be configured to your actual backend URL
    // It's often better to set this in app.js or a config file
    const J2EE_CONTROLLER_URL = 'http://localhost:8080/TestControllerPostgre/Controller'; // <<<< IMPORTANT: SET THIS TO YOUR ACTUAL URL

    let url = `${J2EE_CONTROLLER_URL}?ACTION=${encodeURIComponent(action)}`;

    const options = {
        method: method,
        headers: {
            // 'Content-Type': 'application/json' // For JSON body
            // For form data (default for GET, or when using FormData for POST)
        },
    };

    if (method === 'GET') {
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                 url += `&${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
            }
        });
    } else if (method === 'POST') {
        // For POST, parameters are typically sent in the body
        // We'll use URL-encoded form data as the J2EE servlet expects request.getParameter()
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        const bodyParams = new URLSearchParams();
        bodyParams.append('ACTION', action); // Action also in body for POST consistency or if preferred
        for (const key in params) {
            if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
                bodyParams.append(key, params[key]);
            }
        }
        if (body) { // If a specific body object is provided (e.g. JSON string for complex data)
            if (typeof body === 'object') {
                 // If we want to send JSON, uncomment the Content-Type above and use this
                 // options.body = JSON.stringify(body);
                 // For now, sticking to form-urlencoded, so we'd add body's props to bodyParams
                 console.warn("Raw 'body' object passed to POST with form-urlencoded, ensure params handle it or adjust Content-Type");
            } else {
                // This case is less common if `params` are already handling form data
                // options.body = body;
            }
        }
        options.body = bodyParams.toString();
        // For POST, the ACTION is part of the body, so remove it from query string.
        url = J2EE_CONTROLLER_URL;
    }

    console.log(`API CALL: ${method} ${url}`, params, body ? `Body: ${options.body}` : '');

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            // Try to get error message from backend if available
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // Not JSON or empty response
                errorData = { message: `Error ${response.status}: ${response.statusText}` };
            }
            console.error('API Error Response:', errorData);
            return { success: false, message: errorData.message || `Server error: ${response.status}` };
        }
        // The J2EE servlet for HAMBURGUESA.LIST returns an array directly.
        // Other actions should return an object like { success: true, data: ... } or { success: false, message: ... }
        // We need to standardize this here.
        const responseData = await response.json();
        console.log('API Success Response Data:', responseData);

        // If backend returns data directly (like HAMBURGUESA.LIST), wrap it
        if (Array.isArray(responseData) && action === 'HAMBURGUESA.LIST') {
            return { success: true, data: responseData };
        }
        // If backend already returns {success: ..., data: ...} or {success: ..., message: ...}
        if (typeof responseData.success === 'boolean') {
            return responseData;
        }
        // Fallback if the structure is unknown but request was ok (status 2xx)
        return { success: true, data: responseData };

    } catch (error) {
        console.error('Network or other API error:', error);
        return { success: false, message: `Network error: ${error.message}` };
    }
}


// --- Endpoints Mapped to J2EE Actions ---

async function registerUser(username, password, email, role = 'client') {
    // J2EE ACTION: USER.REGISTER (Needs to be implemented in ControllerServlet)
    // Assuming POST request with username, password, email
    return await fetchFromBackend('USER.REGISTER', { username, password, email, role }, 'POST');
}

async function loginUser(username, password) {
    // J2EE ACTION: USER.LOGIN (Needs to be implemented in ControllerServlet)
    // Assuming POST request with username, password
    return await fetchFromBackend('USER.LOGIN', { username, password }, 'POST');
}

async function getBurgers(filterType = null) {
    // J2EE ACTION: HAMBURGUESA.LIST
    // The current J2EE servlet returns all burgers. Filtering is client-side in app.js.
    // To keep app.js simple, we fetch all and then filter here, or let app.js continue to filter.
    // For now, let's fetch all and let app.js filter.
    // If server-side filtering is added, the `filterType` param would be sent.
    const response = await fetchFromBackend('HAMBURGUESA.LIST');
    if (response.success && Array.isArray(response.data)) {
        // The J2EE servlet returns "name", "description", "price", "imageUrl", "type", "ingredients", "totalScore", "ratingCount", "averageRating"
        // Ensure ingredients is always an array
        const burgers = response.data.map(b => ({
            ...b,
            ingredients: Array.isArray(b.ingredients) ? b.ingredients : (b.ingredients ? [b.ingredients.toString()] : []),
            // J2EE servlet now calculates and returns averageRating
            avg_rating: b.averageRating !== undefined ? parseFloat(b.averageRating).toFixed(1) : (b.ratingCount > 0 ? (b.totalScore / b.ratingCount).toFixed(1) : "0.0")
        }));

        if (filterType && filterType !== "all") {
            return { success: true, data: burgers.filter(b => b.type === filterType) };
        }
        return { success: true, data: burgers };
    }
    return response; // Return original error response if not successful
}


async function rateBurger(burgerId, userId, score) {
    // J2EE ACTION: BURGER.RATE (Needs to be implemented in ControllerServlet)
    // Assuming POST request with burgerId, userId, score
    return await fetchFromBackend('BURGER.RATE', { burgerId, userId, score }, 'POST');
}

async function getUserRatings(userId) {
    // J2EE ACTION: USER.RATINGS (Needs to be implemented in ControllerServlet)
    // Assuming GET request with userId
    return await fetchFromBackend('USER.RATINGS', { userId }, 'GET');
}

async function placeOrder(userId, items) { // items: [{ burgerId, name, quantity, price }]
    // J2EE ACTION: ORDER.PLACE (Needs to be implemented in ControllerServlet)
    // Assuming POST request with userId and items (e.g., as JSON string)
    // The J2EE servlet will need to parse this JSON string from a parameter.
    return await fetchFromBackend('ORDER.PLACE', { userId, itemsJson: JSON.stringify(items) }, 'POST');
}

async function getUserOrders(userId) {
    // J2EE ACTION: USER.ORDERS (Needs to be implemented in ControllerServlet)
    // Assuming GET request with userId
    return await fetchFromBackend('USER.ORDERS', { userId }, 'GET');
}

async function getCompanyMedia() {
    // J2EE ACTION: COMPANY.MEDIA (Needs to be implemented in ControllerServlet)
    // Assuming GET request, no params
    // Backend should return: { images: [...], documents: [...] }
    const response = await fetchFromBackend('COMPANY.MEDIA');
    if (response.success && response.data && response.data.images && response.data.documents) {
        return response; // Already in the expected format
    } else if(response.success) { // Data structure mismatch
        console.warn("COMPANY.MEDIA response from backend has unexpected structure:", response.data);
        return { success: false, message: "Formato de datos de media incorrecto desde el servidor."}
    }
    return response; // Return original error
}

// Expose functions to app.js
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