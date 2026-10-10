import { qs, loadHeaderFooter, escapeHtml, validatePassword } from "./utils.mjs";
import { createPreferencesManager } from "./PreferencesManager.mjs";
import { createUserManager } from "./UserManager.mjs";
import { updateAuthUI } from "./AuthUI.mjs";

// Profile page logic
(async () => {
    await loadHeaderFooter();

    const userManager = createUserManager();
    const preferencesManager = createPreferencesManager();
    updateAuthUI(userManager);

    const user = userManager.getCurrentUser();

    // Redirect if user is not logged in
    if (!user) {
        window.location.href = "/login/";
        return;
    }

    const profileView = qs("#profile-view");
    const profileForm = qs("#profile-form");
    const message = qs("#profile-message");

    // Render the user's profile
    renderProfile();
    renderDietToggles();

    // Render diet toggles
    function renderDietToggles() {
        const container = qs("#diet-toggles");
        if (!container) return;

        // Diet options
        const DIETS = [
            { id: "vegetarian", label: "&#x1F956; Vegetarian" },
            { id: "vegan", label: "&#127793; Vegan" },
            { id: "gluten-free", label: "&#x1F33D; Gluten-Free" },
            { id: "dairy-free", label: "&#129371; Dairy-Free" },
            { id: "keto", label: "&#129361; Keto" },
            { id: "paleo", label: "&#127829; Paleo" },
            { id: "low-carb", label: "&#129384; Low-Carb" },
            { id: "pescatarian", label: "&#128031; Pescatarian" },
        ];

        const activeDiets = preferencesManager.getDiets();

        // Render the diet toggles
        container.innerHTML = DIETS.map((diet) => {
            const isActive = activeDiets.includes(diet.id);
            return `
                <button type="button" class="diet-toggle ${isActive ? "active" : ""}" data-diet="${diet.id}">
                ${diet.label}
                </button>
            `;
        }).join("");

        // Add event listeners to diet toggles
        container.querySelectorAll(".diet-toggle").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const diet = e.currentTarget.dataset.diet;
                const isActive = preferencesManager.toggleDiet(diet);
                e.currentTarget.classList.toggle("active", isActive);
                showMessage(
                    isActive
                        ? `"${diet}" added to your dietary preferences.`
                        : `"${diet}" removed.`,
                    "success"
                );
            });
        });
    }

    // Render the user's profile
    function renderProfile() {
        const current = userManager.getCurrentUser();
        const avatarUrl =
            current.avatar ||
            `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(current.name)}`;

        profileView.innerHTML = `
            <div class="profile-card">
                <img src="${avatarUrl}" alt="${escapeHtml(current.name)}" class="profile-card__avatar-img">
                <h2 class="profile-card__name">${escapeHtml(current.name)}</h2>
                <p class="profile-card__username">@${escapeHtml(current.username || "")}</p>
                <p class="profile-card__email">${escapeHtml(current.email)}</p>
                <p class="profile-card__meta">
                    Member since: ${new Date(current.createdAt).toLocaleDateString()}
                </p>
                <button id="edit-profile-btn" class="auth-submit"> Edit Profile</button>
            </div>
        `;

        qs("#edit-profile-btn").addEventListener("click", enterEditMode);
    }

    // Enter edit mode
    function enterEditMode() {
        const current = userManager.getCurrentUser();

        qs("#edit-name").value = current.name;
        qs("#edit-username").value = current.username || "";
        qs("#edit-email").value = current.email;
        qs("#edit-password").value = "";

        profileView.classList.add("hide");
        profileForm.classList.remove("hide");
        message.classList.add("hide");
    }

    // Exit edit mode
    function exitEditMode() {
        profileView.classList.remove("hide");
        profileForm.classList.add("hide");
        message.classList.add("hide");
    }

    qs("#cancel-edit").addEventListener("click", exitEditMode);

    // Event listener for profile form
    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Disable the submit button to prevent multiple submissions
        const submitBtn = profileForm.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";

        const updates = {
            name: qs("#edit-name").value.trim(),
            username: qs("#edit-username").value.trim().toLowerCase(),
            email: qs("#edit-email").value.trim(),
        };

        // Name Validation
        if (updates.name.length < 2) {
            showMessage(
                "Name must be at least 2 characters long.",
                "error",
                submitBtn,
                "Save Changes"
            );
            return;
        }

        // Username Validation
        if (updates.username.length < 3 || updates.username.length > 20) {
            showMessage(
                "Username must be between 3 and 20 characters long.",
                "error",
                submitBtn,
                "Save Changes"
            );
            return;
        }

        // If a new password is provided and it's valid
        const newPassword = qs("#edit-password").value;
        if (newPassword) {
            const passwordValidation = validatePassword(newPassword);
            // If the password is not valid
            if (!passwordValidation.valid) {
                showMessage(passwordValidation.message, "error", submitBtn, "Save Changes");
                return;
            }
            updates.password = newPassword;
        }

        const result = userManager.updateProfile(updates);

        // Handle the result
        if (result.success) {
            showMessage("Profile updated successfully!", "success", submitBtn, "Save Changes");
            setTimeout(() => {
                exitEditMode();
                renderProfile();
            }, 1000);
        } else {
            showMessage(result.message, "error", submitBtn, "Save Changes");
        }
    });

    // Function to show a message
    function showMessage(text, type, submitBtn = null, originalText = "Save Changes") {
        message.textContent = text;
        message.classList.remove("hide", "success", "error");
        message.classList.add(type);

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        } else {
            // Auto-hide feedback temporal para toggles
            clearTimeout(showMessage._timer);
            showMessage._timer = setTimeout(() => message.classList.add("hide"), 2000);
        }
    }
})();
