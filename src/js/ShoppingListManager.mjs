// src/js/ShoppingListManager.mjs
import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";

// Dispatch a custom event so the header can update its badge in real time
function notifyShoppingListUpdated(count) {
    window.dispatchEvent(new CustomEvent("shoppingListUpdated", { detail: { count } }));
}

// Create a ShoppingListManager
export function createShoppingListManager() {
    const userManager = createUserManager();
    const user = userManager.getCurrentUser();

    // Dynamic key based on the user
    const key = user ? `house-recipe-shopping-list-${user.id}` : "house-recipe-shopping-list-guest";

    let list = getLocalStorage(key) || { recipes: [] };

    // Save to localStorage
    const persist = () => {
        setLocalStorage(key, list);
    };

    // Notify + persist
    const persistAndNotify = () => {
        persist();
        notifyShoppingListUpdated(list.recipes.length);
    };

    // Extract ingredients from a full recipe object
    function extractIngredients(recipe) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ing = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ing && ing.trim()) {
                ingredients.push({
                    name: ing.trim(),
                    measure: measure ? measure.trim() : "",
                    checked: false,
                });
            }
        }
        return ingredients;
    }

    return {
        // Add a recipe (with all its ingredients) to the shopping list
        addRecipe(recipe) {
            if (!recipe || !recipe.idMeal) return false;

            // Check if recipe already exists
            const exists = list.recipes.some((r) => r.recipeId === recipe.idMeal);
            if (exists) return false;

            list.recipes.push({
                recipeId: recipe.idMeal,
                recipeName: recipe.strMeal,
                recipeThumb: recipe.strMealThumb,
                addedAt: new Date().toISOString(),
                ingredients: extractIngredients(recipe),
            });

            persistAndNotify();
            return true;
        },

        // Remove a recipe (and all its ingredients) from the list
        removeRecipe(recipeId) {
            const initialLength = list.recipes.length;
            list.recipes = list.recipes.filter((r) => r.recipeId !== String(recipeId));
            if (list.recipes.length !== initialLength) {
                persistAndNotify();
                return true;
            }
            return false;
        },

        // Check if a recipe is already in the shopping list
        hasRecipe(recipeId) {
            return list.recipes.some((r) => r.recipeId === String(recipeId));
        },

        // Toggle an ingredient's checked state
        toggleIngredient(recipeId, ingredientName) {
            const recipe = list.recipes.find((r) => r.recipeId === String(recipeId));
            if (!recipe) return false;

            const ing = recipe.ingredients.find((i) => i.name === ingredientName);
            if (!ing) return false;

            ing.checked = !ing.checked;
            persistAndNotify();
            return ing.checked;
        },

        // Remove a single ingredient from a recipe
        removeIngredient(recipeId, ingredientName) {
            const recipe = list.recipes.find((r) => r.recipeId === String(recipeId));
            if (!recipe) return false;

            const initialLength = recipe.ingredients.length;
            recipe.ingredients = recipe.ingredients.filter((i) => i.name !== ingredientName);

            // If no ingredients left, remove the recipe entirely
            if (recipe.ingredients.length === 0) {
                list.recipes = list.recipes.filter((r) => r.recipeId !== String(recipeId));
            }

            if (initialLength !== recipe.ingredients.length) {
                persistAndNotify();
                return true;
            }
            return false;
        },

        // Clear all checked ingredients
        clearChecked() {
            list.recipes.forEach((r) => {
                r.ingredients = r.ingredients.filter((i) => !i.checked);
            });
            // Remove recipes with no ingredients left
            list.recipes = list.recipes.filter((r) => r.ingredients.length > 0);
            persistAndNotify();
        },

        // Clear the entire list
        clear() {
            list = { recipes: [] };
            persistAndNotify();
        },

        // Get all recipes in the list
        getAll() {
            return JSON.parse(JSON.stringify(list.recipes));
        },

        // Get total number of recipes
        recipeCount() {
            return list.recipes.length;
        },

        // Get total number of ingredients
        ingredientCount() {
            return list.recipes.reduce((sum, r) => sum + r.ingredients.length, 0);
        },
    };
}
