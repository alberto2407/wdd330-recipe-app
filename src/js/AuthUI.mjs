// src/js/AuthUI.mjs
import { qs } from "./utils.mjs";
import { createPreferencesManager } from "./PreferencesManager.mjs";
import { createFavoritesManager } from "./FavoritesManager.mjs";
import { createShoppingListManager } from "./ShoppingListManager.mjs";

// Updates the UI based on the current user
export function updateAuthUI(userManager) {
    const authSection = qs("#auth-section");
    if (!authSection) return;

    const user = userManager.getCurrentUser();
    const preferencesManager = createPreferencesManager();
    const isDarkMode = preferencesManager.isDarkMode();
    const favoritesManager = createFavoritesManager();
    const shoppingListManager = createShoppingListManager();
    const favoritesCount = favoritesManager.count();
    const shoppingListCount = shoppingListManager.recipeCount();

    // Apply dark mode if enabled
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
    }

    // ============================================================
    // USER LOGGED IN
    // ============================================================
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
                        <span id="favorites-badge" class="user-dropdown__badge ${favoritesCount > 0 ? "" : "hide"}">${favoritesCount}</span>
                    </a>
                    <a href="/shopping-list/" class="user-dropdown__item">
                        <span class="dropdown-icon">&#128722;</span> Shopping List
                        <span id="shopping-badge" class="user-dropdown__badge ${shoppingListCount > 0 ? "" : "hide"}">${shoppingListCount}</span>
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

        // Real-time badges
        window.addEventListener("favoritesUpdated", (e) => {
            const badge = qs("#favorites-badge");
            if (!badge) return;
            const count = e.detail.count;
            badge.textContent = count;
            badge.classList.toggle("hide", count === 0);
        });

        window.addEventListener("shoppingListUpdated", (e) => {
            const badge = qs("#shopping-badge");
            if (!badge) return;
            const count = e.detail.count;
            badge.textContent = count;
            badge.classList.toggle("hide", count === 0);
        });

        return;
    }

    // ============================================================
    // USER NOT LOGGED IN (GUEST)
    // ============================================================
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes("/login");
    const isRegisterPage = currentPath.includes("/register");

    // Login or Register button (only one shows, based on current page)
    const loginLinkHtml = isLoginPage
        ? `<a href="/register/" class="user-dropdown__item">
               <span class="dropdown-icon">&#x1F4DD;</span> Register
           </a>`
        : isRegisterPage
          ? `<a href="/login/" class="user-dropdown__item">
                 <span class="dropdown-icon">&#x1F511;</span> Login
             </a>`
          : `<a href="/login/" class="user-dropdown__item">
                 <span class="dropdown-icon">&#x1F511;</span> Login
             </a>`;

    authSection.innerHTML = `
        <div class="user-menu">
            <button id="guest-menu-toggle" class="user-menu-toggle" aria-haspopup="true" aria-expanded="false">
                <span class="dropdown-icon">&#x1F464;</span>
                <span class="user-name">Guest</span>
                <span class="user-menu-caret">▾</span>
            </button>

            <div id="guest-dropdown" class="user-dropdown hide">
                <a href="/favorites/" class="user-dropdown__item">
                    <span class="dropdown-icon">&#10084;</span> Favorites
                    <span id="favorites-badge" class="user-dropdown__badge ${favoritesCount > 0 ? "" : "hide"}">${favoritesCount}</span>
                </a>
                <a href="/shopping-list/" class="user-dropdown__item">
                    <span class="dropdown-icon">&#128722;</span> Shopping List
                    <span id="shopping-badge" class="user-dropdown__badge ${shoppingListCount > 0 ? "" : "hide"}">${shoppingListCount}</span>
                </a>
                <button id="dark-mode-toggle" class="user-dropdown__item">
                    <span class="dropdown-icon">${isDarkMode ? "☀️" : "🌙"}</span>
                    ${isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
                <hr class="user-dropdown__divider" />
                ${loginLinkHtml}
            </div>
        </div>
    `;

    const guestToggle = qs("#guest-menu-toggle");
    const guestDropdown = qs("#guest-dropdown");

    // Open/close the dropdown
    guestToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = !guestDropdown.classList.contains("hide");
        if (isOpen) {
            guestDropdown.classList.add("hide");
            guestToggle.setAttribute("aria-expanded", "false");
        } else {
            guestDropdown.classList.remove("hide");
            guestToggle.setAttribute("aria-expanded", "true");
        }
    });

    // Close on click outside
    document.addEventListener("click", (e) => {
        if (!guestDropdown.classList.contains("hide") && !authSection.contains(e.target)) {
            guestDropdown.classList.add("hide");
            guestToggle.setAttribute("aria-expanded", "false");
        }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !guestDropdown.classList.contains("hide")) {
            guestDropdown.classList.add("hide");
            guestToggle.setAttribute("aria-expanded", "false");
        }
    });

    // Dark mode toggle
    qs("#dark-mode-toggle").addEventListener("click", () => {
        const isDark = preferencesManager.toggleDarkMode();
        document.body.classList.toggle("dark-mode", isDark);
        const btn = qs("#dark-mode-toggle");
        btn.innerHTML = `
        <span class="dropdown-icon">${isDark ? "☀️" : "🌙"}</span>
        ${isDark ? "Light Mode" : "Dark Mode"}
      `;
    });

    // Real-time badges
    window.addEventListener("favoritesUpdated", (e) => {
        const badge = qs("#favorites-badge");
        if (!badge) return;
        const count = e.detail.count;
        badge.textContent = count;
        badge.classList.toggle("hide", count === 0);
    });

    window.addEventListener("shoppingListUpdated", (e) => {
        const badge = qs("#shopping-badge");
        if (!badge) return;
        const count = e.detail.count;
        badge.textContent = count;
        badge.classList.toggle("hide", count === 0);
    });
}
