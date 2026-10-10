// src/js/IngredientManager.mjs
import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";

// Create an IngredientManager
export function createIngredientManager() {
    const userManager = createUserManager();
    const user = userManager.getCurrentUser();

    // Dynamic key based on the user
    const key = user ? `house-recipe-ingredients-${user.id}` : "house-recipe-ingredients-guest";

    let ingredients = getLocalStorage(key) || [];

    // Save ingredients to localStorage
    const persist = () => {
        setLocalStorage(key, ingredients);
    };

    return {
        // Add an ingredient
        add(ingredient) {
            const normalized = ingredient.trim().toLowerCase();
            if (!normalized || ingredients.includes(normalized)) {
                return false;
            }
            ingredients.push(normalized);
            persist();
            return true;
        },

        // Remove an ingredient
        remove(ingredient) {
            const normalized = ingredient.trim().toLowerCase();
            const index = ingredients.indexOf(normalized);
            if (index === -1) return false;
            ingredients.splice(index, 1);
            persist();
            return true;
        },

        // Clear all ingredients
        clear() {
            ingredients = [];
            persist();
        },

        // Get all ingredients
        getAll() {
            return [...ingredients]; // Return a copy to prevent external mutation
        },

        // Check if an ingredient exists
        has(ingredient) {
            return ingredients.includes(ingredient.trim().toLowerCase());
        },

        // Get the number of ingredients
        count() {
            return ingredients.length;
        },
    };
}
