import { qs, loadHeaderFooter, getLocalStorage, setLocalStorage } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";
import { updateAuthUI } from "./AuthUI.mjs";

// Login page logic
(async () => {
    await loadHeaderFooter();

    const userManager = createUserManager();
    updateAuthUI(userManager);

    // Redirect if user is already logged in
    if (userManager.isLoggedIn()) {
        window.location.href = "/profile/";
        return;
    }

    const form = qs("#login-form");
    const message = qs("#login-message");

    // Merge guest ingredients with the logged-in user's ingredients
    function mergeGuestIngredients() {
        const currentUser = userManager.getCurrentUser();
        if (!currentUser) return;

        const guestKey = "house-recipe-ingredients-guest";
        const guestIngredients = getLocalStorage(guestKey);

        if (!guestIngredients || guestIngredients.length === 0) return;

        const userKey = `house-recipe-ingredients-${currentUser.id}`;
        const userIngredients = getLocalStorage(userKey) || [];

        // Combine guest ingredients with user ingredients, avoiding duplicates
        const combined = [...new Set([...userIngredients, ...guestIngredients])];
        setLocalStorage(userKey, combined);

        // Clear guest ingredients from localStorage after merging
        localStorage.removeItem(guestKey);
    }

    // Function to show a message
    function showMessage(text, type, submitBtn, originalText) {
        message.textContent = text;
        message.classList.remove("hide", "success", "error");
        message.classList.add(type);

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }

    // Handle form submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Disable the submit button to prevent multiple submissions
        const submitBtn = form.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";

        const identifier = qs("#login-identifier").value.trim();
        const password = qs("#password").value;

        // Basic Validation
        if (!identifier || !password) {
            showMessage("Please fill in all fields.", "error", submitBtn, "Login");
            return;
        }

        const result = userManager.login(identifier, password);

        // Handle login result
        if (result.success) {
            // Merge guest ingredients into the newly logged-in user's data
            mergeGuestIngredients();

            showMessage("Login successful! Redirecting...", "success", submitBtn, "Login");
            setTimeout(() => {
                window.location.href = "/profile/";
            }, 1000);
        } else {
            showMessage(result.message, "error", submitBtn, "Login");
        }
    });
})();
