// src/js/LastRecipeManager.mjs
import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";

// Create a LastRecipeManager (now manages a full recipe history)
export function createLastRecipeManager() {
    const userManager = createUserManager();
    const user = userManager.getCurrentUser();

    // Dynamic key based on the user
    const key = user ? `house-recipe-history-${user.id}` : "house-recipe-history-guest";

    // Structure: { recipes: [...], currentIndex: 0 }
    let history = getLocalStorage(key) || { recipes: [], currentIndex: 0 };

    // Persist to localStorage
    const persist = () => {
        setLocalStorage(key, history);
    };

    // Extract ingredient names from a full recipe
    function extractIngredients(recipe) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ing = recipe[`strIngredient${i}`];
            if (ing && ing.trim()) {
                ingredients.push(ing.trim().toLowerCase());
            }
        }
        return ingredients;
    }

    return {
        // Save a recipe to history (moves to front if already exists)
        save(recipe) {
            if (!recipe || !recipe.idMeal) return;

            const recipeId = String(recipe.idMeal);

            // Remove if already exists (to avoid duplicates)
            history.recipes = history.recipes.filter((r) => r.recipeId !== recipeId);

            // Add to front
            history.recipes.unshift({
                recipeId,
                recipeName: recipe.strMeal,
                recipeThumb: recipe.strMealThumb,
                ingredients: extractIngredients(recipe),
                savedAt: new Date().toISOString(),
            });

            // Reset index to 0 (current recipe is the newest)
            history.currentIndex = 0;

            persist();
        },

        // Get the currently displayed recipe (or null)
        get() {
            if (history.recipes.length === 0) return null;
            return history.recipes[history.currentIndex] || null;
        },

        // Get all history recipes
        getAll() {
            return [...history.recipes];
        },

        // Get current index
        getCurrentIndex() {
            return history.currentIndex;
        },

        // Get total count
        count() {
            return history.recipes.length;
        },

        // Navigate to the previous recipe (older)
        goPrevious() {
            if (history.currentIndex < history.recipes.length - 1) {
                history.currentIndex += 1;
                persist();
                return true;
            }
            return false;
        },

        // Navigate to the next recipe (newer)
        goNext() {
            if (history.currentIndex > 0) {
                history.currentIndex -= 1;
                persist();
                return true;
            }
            return false;
        },

        // Check if can go previous
        canGoPrevious() {
            return history.currentIndex < history.recipes.length - 1;
        },

        // Check if can go next
        canGoNext() {
            return history.currentIndex > 0;
        },

        // Clear the entire history
        clear() {
            history = { recipes: [], currentIndex: 0 };
            persist();
        },
    };
}
