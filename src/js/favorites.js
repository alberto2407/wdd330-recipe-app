import { createShoppingListManager } from "./ShoppingListManager.mjs";
import { createLastRecipeManager } from "./LastRecipeManager.mjs";
import { createFavoritesManager } from "./FavoritesManager.mjs";
import { createUserManager } from "./UserManager.mjs";
import { qs, loadHeaderFooter } from "./utils.mjs";
import { updateAuthUI } from "./AuthUI.mjs";
import RecipeAPI from "./RecipeAPI.mjs";
import RecipeRenderer from "./RecipeRenderer.mjs";

// Favorites page logic
(async () => {
    await loadHeaderFooter();

    const userManager = createUserManager();
    const favoritesManager = createFavoritesManager();
    const lastRecipeManager = createLastRecipeManager();
    const shoppingListManager = createShoppingListManager();
    const recipeAPI = new RecipeAPI();
    const recipeRenderer = new RecipeRenderer("#favorites-list");

    updateAuthUI(userManager);

    const favoriteIds = favoritesManager.getAll();

    // Update the favorites counter in the page title
    const countEl = qs("#favorites-count");
    if (countEl) {
        countEl.textContent = `(${favoriteIds.length})`;
    }

    if (favoriteIds.length === 0) {
        qs("#favorites-list").innerHTML = `
      <div class="empty-state">
        <p>No favorites yet!</p>
        <a href="/" class="auth-link">Go find some recipes →</a>
      </div>
    `;
        return;
    }

    recipeRenderer.setShoppingListHandler((recipe) => shoppingListManager.addRecipe(recipe));

    try {
        // Fetch all favorite recipes in parallel
        const recipes = await Promise.all(favoriteIds.map((id) => recipeAPI.getRecipeById(id)));

        const validRecipes = recipes.filter((r) => r !== null);

        recipeRenderer.render(validRecipes, handleViewRecipe, handleToggleFavorite, (id) =>
            favoritesManager.isFavorite(id)
        );
    } catch (error) {
        console.error("Error loading favorites:", error);
        qs("#favorites-list").innerHTML = `
      <p class="error-message">Could not load favorites. Please try again.</p>
    `;
    }

    // Function to handle viewing recipe details
    async function handleViewRecipe(recipeId) {
        const content = qs("#modal-content");
        content.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading recipe...</p>
            </div>
        `;
        qs("#recipe-modal").classList.remove("hide");

        // Fetch the recipe details
        try {
            const recipe = await recipeAPI.getRecipeById(recipeId);

            // Save to history so it appears in the home side card
            lastRecipeManager.save(recipe);

            recipeRenderer.showDetails(recipe, "#recipe-modal", "#modal-content");
        } catch (error) {
            console.error("Error loading recipe details:", error);
            content.innerHTML = `<p class="error-message">Could not load recipe details.</p>`;
        }
    }

    // Function to handle toggling favorite
    function handleToggleFavorite(recipeId) {
        const result = favoritesManager.toggle(recipeId);

        // If the recipe was removed from favorites, reload the page to update the list
        if (!result) {
            window.location.reload();
        }
        return result;
    }

    qs("#close-modal").addEventListener("click", () => {
        recipeRenderer.hideDetails("#recipe-modal");
    });

    qs("#recipe-modal").addEventListener("click", (e) => {
        if (e.target.id === "recipe-modal") {
            recipeRenderer.hideDetails("#recipe-modal");
        }
    });
})();
