import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";

// Create a PreferencesManager
export function createPreferencesManager() {
    const userManager = createUserManager();
    const user = userManager.getCurrentUser();

    // Dynamic key based on the user
    const key = user ? `house-recipe-preferences-${user.id}` : "house-recipe-preferences-guest";

    // Preferences defaults
    const defaultPrefs = {
        diets: [],
        frequentIngredients: [],
        darkMode: false,
    };

    let preferences = getLocalStorage(key) || { ...defaultPrefs };

    // Persist preferences
    const persist = () => {
        setLocalStorage(key, preferences);
    };

    return {
        // Returns all preferences
        getAll() {
            return { ...preferences };
        },

        // Add or remove a diet
        toggleDiet(diet) {
            const index = preferences.diets.indexOf(diet);
            if (index === -1) {
                preferences.diets.push(diet);
            } else {
                preferences.diets.splice(index, 1);
            }
            persist();
            return preferences.diets.includes(diet);
        },

        // Add a frequent ingredient
        addFrequentIngredient(ingredient) {
            const normalized = ingredient.trim().toLowerCase();
            if (!normalized) return;
            if (!preferences.frequentIngredients.includes(normalized)) {
                preferences.frequentIngredients.push(normalized);
                // Hold only 10 frequent ingredients
                if (preferences.frequentIngredients.length > 10) {
                    preferences.frequentIngredients.shift();
                }
                persist();
            }
        },

        // Get frequent ingredients
        getFrequentIngredients() {
            return [...preferences.frequentIngredients];
        },

        // Get diets
        getDiets() {
            return [...preferences.diets];
        },

        // Dark mode
        toggleDarkMode() {
            preferences.darkMode = !preferences.darkMode;
            persist();
            return preferences.darkMode;
        },

        // Check dark mode
        isDarkMode() {
            return preferences.darkMode;
        },
    };
}
