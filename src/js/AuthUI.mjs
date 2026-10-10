// src/js/AuthUI.mjs
import { qs } from "./utils.mjs";
import { createPreferencesManager } from "./PreferencesManager.mjs";

// Updates the UI based on the current user
export function updateAuthUI(userManager) {
    const authSection = qs("#auth-section");
    if (!authSection) return;

    const user = userManager.getCurrentUser();
    const preferencesManager = createPreferencesManager();
    const isDarkMode = preferencesManager.isDarkMode();

    // Apply dark mode if enabled
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
    }

    // User logged in
    if (user) {
        const avatarUrl =
            user.avatar ||
            `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}`;

        const displayName = user.username || user.name.split(" ")[0];

        authSection.innerHTML = `
            <div class="user-menu">
                <button id="user-menu-toggle" class="user-menu-toggle" aria-haspopup="true" aria-expanded="false">
                    <img src="${avatarUrl}" alt="${displayName}" class="user-avatar" />
                    <span class="user-name">${displayName}</span>
                    <span class="user-menu-caret">▾</span>
                </button>

                <div id="user-dropdown" class="user-dropdown hide">
                <a href="/profile/" class="user-dropdown__item">
                    <span class="dropdown-icon">&#x1F464;</span> My Profile
                </a>
                <a href="/favorites/" class="user-dropdown__item">
                    <span class="dropdown-icon">&#10084;</span> Favorites
                </a>
                <button id="dark-mode-toggle" class="user-dropdown__item">
                    <span class="dropdown-icon">${isDarkMode ? "☀️" : "🌙"}</span>
                    ${isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
                <hr class="user-dropdown__divider" />
                <button id="logout-btn" class="user-dropdown__item user-dropdown__item--danger">
                    <span class="dropdown-icon">&#x1F6AA;</span> Logout
                </button>
                </div>
            </div>
        `;

        const toggleBtn = qs("#user-menu-toggle");
        const dropdown = qs("#user-dropdown");

        // Open/close the dropdown
        toggleBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = !dropdown.classList.contains("hide");
            if (isOpen) {
                dropdown.classList.add("hide");
                toggleBtn.setAttribute("aria-expanded", "false");
            } else {
                dropdown.classList.remove("hide");
                toggleBtn.setAttribute("aria-expanded", "true");
            }
        });

        // Close the dropdown if clicking outside
        document.addEventListener("click", (e) => {
            if (!dropdown.classList.contains("hide") && !authSection.contains(e.target)) {
                dropdown.classList.add("hide");
                toggleBtn.setAttribute("aria-expanded", "false");
            }
        });

        // Close the dropdown on Escape key press
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !dropdown.classList.contains("hide")) {
                dropdown.classList.add("hide");
                toggleBtn.setAttribute("aria-expanded", "false");
            }
        });

        // Toggle Dark Mode
        qs("#dark-mode-toggle").addEventListener("click", () => {
            const isDark = preferencesManager.toggleDarkMode();
            document.body.classList.toggle("dark-mode", isDark);
            const btn = qs("#dark-mode-toggle");
            btn.innerHTML = `
        <span class="dropdown-icon">${isDark ? "☀️" : "🌙"}</span>
        ${isDark ? "Light Mode" : "Dark Mode"}
      `;
        });

        // Logout
        qs("#logout-btn").addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
                userManager.logout();
                window.location.reload();
            }
        });

        return;
    }

    // User not logged in
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes("/login");
    const isRegisterPage = currentPath.includes("/register");

    let authLinksHTML = "";
    if (isLoginPage) {
        authLinksHTML = `<a href="/register/" class="auth-link">Register</a>`;
    } else if (isRegisterPage) {
        authLinksHTML = `<a href="/login/" class="auth-link">Login</a>`;
    } else {
        authLinksHTML = `<a href="/login/" class="auth-link">Login</a>`;
    }

    authSection.innerHTML = `
        <button id="dark-mode-toggle-guest" class="dark-mode-btn" aria-label="Toggle dark mode">
            ${isDarkMode ? "☀️" : "🌙"}
        </button>
        ${authLinksHTML}
    `;

    qs("#dark-mode-toggle-guest").addEventListener("click", () => {
        const isDark = preferencesManager.toggleDarkMode();
        document.body.classList.toggle("dark-mode", isDark);
        const btn = qs("#dark-mode-toggle-guest");
        btn.textContent = isDark ? "☀️" : "🌙";
    });
}
