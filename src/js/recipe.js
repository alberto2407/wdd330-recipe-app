import { createShoppingListManager } from "./ShoppingListManager.mjs";
import { createLastRecipeManager } from "./LastRecipeManager.mjs";
import { createFavoritesManager } from "./FavoritesManager.mjs";
import { createCommentsManager } from "./CommentsManager.mjs";
import { renderComments } from "./CommentsRenderer.mjs";
import { createUserManager } from "./UserManager.mjs";
import { loadHeaderFooter } from "./utils.mjs";
import { updateAuthUI } from "./AuthUI.mjs";
import RecipeAPI from "./RecipeAPI.mjs";
import RecipePageRenderer from "./RecipePageRenderer.mjs";

// Recipe detail page logic
(async () => {
    await loadHeaderFooter();

    const shoppingListManager = createShoppingListManager();
    const lastRecipeManager = createLastRecipeManager();
    const favoritesManager = createFavoritesManager();
    const userManager = createUserManager();
    const recipeAPI = new RecipeAPI();
    const renderer = new RecipePageRenderer("#recipe-page");

    updateAuthUI(userManager);

    // Extract recipe ID from URL: /recipe/52772
    const pathMatch = window.location.pathname.match(/^\/recipe\/(\d+)\/?$/);
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = pathMatch ? pathMatch[1] : urlParams.get("id");

    if (!recipeId) {
        renderer.renderError("Recipe not found", "The URL is missing a valid recipe ID.");
        return;
    }

    // Fetch and render the recipe
    try {
        const recipe = await recipeAPI.getRecipeById(recipeId);

        if (!recipe) {
            renderer.renderError(
                "Recipe not found",
                "We couldn't find this recipe. It may have been removed."
            );
            return;
        }

        // Save as last viewed recipe
        lastRecipeManager.save(recipe);

        renderer.render(recipe, {
            onShare: handleShare,
            onToggleFavorite: handleToggleFavorite,
            isFavorite: (id) => favoritesManager.isFavorite(id),
            isInShoppingList: (id) => shoppingListManager.hasRecipe(id),
            onAddToShoppingList: () => {
                // If already in list, remove it. Otherwise, add it.
                if (shoppingListManager.hasRecipe(recipeId)) {
                    shoppingListManager.removeRecipe(recipeId);
                    return "removed";
                }
                const success = shoppingListManager.addRecipe(recipe);
                return success ? "added" : "already";
            },
        });

        // Initialize comments section
        const commentsManager = createCommentsManager(recipeId);
        renderComments(commentsManager, "#recipe-comments");
    } catch (error) {
        console.error("Error loading recipe:", error);
        renderer.renderError("Oops!", "Could not load the recipe. Please try again later.");
    }

    // Handle share button
    async function handleShare(id) {
        // Use query string format so it works both in local dev and production
        const url = `${window.location.origin}/recipe/?id=${id}`;
        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch (error) {
            console.error("Clipboard error:", error);
            window.prompt("Copy this link:", url);
            return false;
        }
    }

    // Handle favorite toggle
    function handleToggleFavorite(id) {
        return favoritesManager.toggle(id);
    }
})();
