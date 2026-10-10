import { qs, loadHeaderFooter, validatePassword } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";
import { updateAuthUI } from "./AuthUI.mjs";

// Avatar URLs
const AVATARS = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Max",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Bear",
];

let selectedAvatar = AVATARS[0]; // Por defecto, el primero

// Register page logic
(async () => {
    await loadHeaderFooter();

    const userManager = createUserManager();
    updateAuthUI(userManager);

    // Redirect if user is already logged in
    if (userManager.isLoggedIn()) {
        window.location.href = "/profile/";
        return;
    }

    const form = qs("#register-form");
    const message = qs("#register-message");
    const avatarPicker = qs("#avatar-picker");

    // Render avatar picker
    avatarPicker.innerHTML = AVATARS.map((url, index) => {
        const isSelected = index === 0 ? "selected" : "";
        return `
            <button type="button" class="avatar-option ${isSelected}" data-avatar-url="${url}" aria-label="Select avatar ${index + 1}">
                <img src="${url}" alt="Avatar ${index + 1}" />
            </button>
        `;
    }).join("");

    // Manage avatar selection
    const avatarButtons = avatarPicker.querySelectorAll(".avatar-option");
    avatarButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            selectedAvatar = e.currentTarget.dataset.avatarUrl;
            avatarButtons.forEach((btn) => btn.classList.remove("selected"));
            e.currentTarget.classList.add("selected");
        });
    });

    // Form logic
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";

        const name = qs("#name").value.trim();
        const username = qs("#username").value.trim().toLowerCase();
        const email = qs("#email").value.trim();
        const password = qs("#password").value;
        const confirmPassword = qs("#confirm-password").value;

        // Basic Validation
        if (username.length < 3) {
            showMessage("Username must be at least 3 characters long.", "error", submitBtn);
            return;
        }

        // Username Validation
        if (!/^[a-z0-9_]+$/.test(username)) {
            showMessage(
                "Username can only contain letters, numbers, and underscores.",
                "error",
                submitBtn
            );
            return;
        }

        // Email Validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            showMessage(passwordValidation.message, "error", submitBtn);
            return;
        }

        // Password Validation
        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", "error", submitBtn);
            return;
        }

        // Register with the avatar selected
        const result = userManager.register({
            name,
            username,
            email,
            password,
            avatar: selectedAvatar, // Save the selected avatar
        });

        // Handle the result
        if (result.success) {
            showMessage("Account created! Redirecting to login...", "success", submitBtn);
            setTimeout(() => {
                window.location.href = "/login/";
            }, 1500);
        } else {
            showMessage(result.message, "error", submitBtn);
        }
    });

    // Function to show a message
    function showMessage(text, type, submitBtn) {
        message.textContent = text;
        message.classList.remove("hide", "success", "error");
        message.classList.add(type);
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";
    }
})();
