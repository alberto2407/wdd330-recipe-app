// Retrieve data from localStorage
export function getLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return null;
    }
}

// Save data to localStorage
export function setLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
    }
}

// Shorthand for querySelector
export function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

// Shorthand for querySelectorAll
export function qsa(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}

// Escape HTML to prevent XSS
export function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Load HTML template
export async function loadTemplate(path) {
    const res = await fetch(path);
    if (!res.ok) {
        throw new Error(`Failed to load template: ${path} (${res.status})`);
    }
    return await res.text();
}

// Render HTML with a template
export function renderWithTemplate(template, parentElement, data, callback) {
    parentElement.innerHTML = template;
    if (callback) {
        callback(data);
    }
}

// Load header and footer
export async function loadHeaderFooter() {
    try {
        const headerTemplate = await loadTemplate("/partials/header.html");
        const footerTemplate = await loadTemplate("/partials/footer.html");

        const headerElement = document.querySelector("#main-header");
        const footerElement = document.querySelector("#main-footer");

        renderWithTemplate(headerTemplate, headerElement);
        renderWithTemplate(footerTemplate, footerElement);
    } catch (error) {
        console.error("Error loading header/footer:", error);
    }
}

// Validate password
export function validatePassword(password) {
    if (!password) {
        return { valid: false, message: "Password is required." };
    }

    if (password.length < 8) {
        return { valid: false, message: "Password must be at least 8 characters long." };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one uppercase letter." };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one lowercase letter." };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, message: "Password must contain at least one number." };
    }

    return { valid: true, message: "Password is valid." };
}
