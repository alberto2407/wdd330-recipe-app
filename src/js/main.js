import { createPreferencesManager } from "./PreferencesManager.mjs";
import { createIngredientManager } from "./IngredientManager.mjs";
import { createFavoritesManager } from "./FavoritesManager.mjs";
import { createUserManager } from "./UserManager.mjs";
import { initWelcomeModal } from "./WelcomeModal.mjs";
import { qs, loadHeaderFooter } from "./utils.mjs";
import { updateAuthUI } from "./AuthUI.mjs";
import RecipeAPI from "./RecipeAPI.mjs";
import RecipeRenderer from "./RecipeRenderer.mjs";

// Main page logic
(async () => {
    await loadHeaderFooter();

    const preferencesManager = createPreferencesManager();
    const ingredientManager = createIngredientManager();
    const favoritesManager = createFavoritesManager();
    const userManager = createUserManager();
    const recipeAPI = new RecipeAPI();
    const recipeRenderer = new RecipeRenderer("#recipes-list");

    const ingredientForm = qs("#ingredient-form");
    const ingredientInput = qs("#ingredient-input");
    const ingredientList = qs("#ingredient-list");
    const searchBtn = qs("#search-recipes");
    const clearBtn = qs("#clear-ingredients");
    const recipesSection = qs("#recipes-section");
    const ingredientTemplate = qs("#ingredient-template");

    // Load user preferences
    if (preferencesManager.isDarkMode()) {
        document.body.classList.add("dark-mode");
    }

    updateAuthUI(userManager);
    initWelcomeModal();

    // Render initial list of ingredients
    function renderIngredients() {
        ingredientList.innerHTML = "";
        const ingredients = ingredientManager.getAll();

        // If there are no ingredients, show an empty state
        if (ingredients.length === 0) {
            ingredientList.innerHTML = `<p class="empty-state">No ingredients yet. Add some above!</p>`;
            searchBtn.disabled = true;
            return;
        }

        // Render each ingredient
        ingredients.forEach((ingredient) => {
            const clone = ingredientTemplate.content.cloneNode(true);
            const chip = clone.querySelector(".ingredient-chip");
            chip.dataset.ingredient = ingredient;
            chip.querySelector(".ingredient-name").textContent = ingredient;

            chip.querySelector(".remove-btn").addEventListener("click", () => {
                ingredientManager.remove(ingredient);
                renderIngredients();
            });

            ingredientList.appendChild(clone);
        });

        searchBtn.disabled = false;
    }

    // Search for recipes
    async function searchRecipes() {
        const ingredients = ingredientManager.getAll();
        if (ingredients.length === 0) return;

        recipesSection.classList.remove("hide");
        recipesSection.querySelector("h2").textContent = "Loading recipes...";
        qs("#recipes-list").innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Searching for recipes...</p>
      </div>
    `;

        // Fetch recipes
        try {
            let recipes = await recipeAPI.searchByIngredients(ingredients);

            // Filter by diets
            const diets = preferencesManager.getDiets();
            if (diets.length > 0) {
                recipes = await recipeAPI.filterByDiets(recipes, diets);
            }

            recipesSection.querySelector("h2").textContent =
                `Recipes You Can Make (${recipes.length})`;

            recipeRenderer.render(recipes, handleViewRecipe, handleToggleFavorite, (id) =>
                favoritesManager.isFavorite(id)
            );
        } catch (error) {
            console.error("Error searching recipes:", error);
            recipesSection.querySelector("h2").textContent = "Oops!";
            qs("#recipes-list").innerHTML = `
        <p class="error-message">Could not load recipes. Please try again.</p>
      `;
        }
    }

    // View recipe
    async function handleViewRecipe(recipeId) {
        const content = qs("#modal-content");
        content.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading recipe...</p>
      </div>
    `;
        qs("#recipe-modal").classList.remove("hide");

        // Fetch recipe
        try {
            const recipe = await recipeAPI.getRecipeById(recipeId);
            recipeRenderer.showDetails(recipe, "#recipe-modal", "#modal-content");
        } catch (error) {
            console.error("Error loading recipe details:", error);
            content.innerHTML = `<p class="error-message">Could not load recipe details.</p>`;
        }
    }

    // Toggle favorite
    function handleToggleFavorite(recipeId) {
        return favoritesManager.toggle(recipeId);
    }

    // Event listeners
    ingredientForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const value = ingredientInput.value.trim();
        if (value.length < 2) return;

        const added = ingredientManager.add(value);

        // If the ingredient was added, add it to the list
        if (added) {
            ingredientInput.value = "";
            renderIngredients();
            preferencesManager.addFrequentIngredient(value);
        } else {
            ingredientInput.value = "";
            ingredientInput.placeholder = "Already added!";
            setTimeout(() => {
                ingredientInput.placeholder = "e.g., chicken, tomato, rice...";
            }, 1500);
        }
    });

    // Event listeners for search and clear
    searchBtn.addEventListener("click", searchRecipes);
    clearBtn.addEventListener("click", () => {
        ingredientManager.clear();
        renderIngredients();
        recipesSection.classList.add("hide");
    });

    // Event listeners for modal
    qs("#close-modal").addEventListener("click", () => {
        recipeRenderer.hideDetails("#recipe-modal");
    });

    // Hide the recipe details modal
    qs("#recipe-modal").addEventListener("click", (e) => {
        if (e.target.id === "recipe-modal") {
            recipeRenderer.hideDetails("#recipe-modal");
        }
    });

    // Render initial list of ingredients
    renderIngredients();
})();
