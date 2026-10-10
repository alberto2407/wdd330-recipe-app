// src/js/FavoritesManager.mjs
import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";

// Create a FavoritesManager
export function createFavoritesManager() {
    const userManager = createUserManager();
    const user = userManager.getCurrentUser();

    // Dynamic key based on the user
    const key = user ? `house-recipe-favorites-${user.id}` : "house-recipe-favorites-guest";

    let favorites = getLocalStorage(key) || [];

    const persist = () => {
        setLocalStorage(key, favorites);
    };

    return {
        // Add or remove a recipe from favorites
        toggle(recipeId) {
            const id = String(recipeId);
            const index = favorites.indexOf(id);
            if (index === -1) {
                favorites.push(id);
                persist();
                return true; // Added
            } else {
                favorites.splice(index, 1);
                persist();
                return false; // Removed
            }
        },

        // Check if a recipe is favorited
        isFavorite(recipeId) {
            return favorites.includes(String(recipeId));
        },

        // Get all favorite recipe IDs
        getAll() {
            return [...favorites];
        },

        // Get the number of favorite recipes
        count() {
            return favorites.length;
        },

        // Clear all favorite recipes
        clear() {
            favorites = [];
            persist();
        },
    };
}
