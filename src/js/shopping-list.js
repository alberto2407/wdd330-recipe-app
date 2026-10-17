import { qs, loadHeaderFooter, escapeHtml } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";
import { createShoppingListManager } from "./ShoppingListManager.mjs";
import { updateAuthUI } from "./AuthUI.mjs";

// Shopping List page logic
(async () => {
    await loadHeaderFooter();

    const userManager = createUserManager();
    const shoppingListManager = createShoppingListManager();

    updateAuthUI(userManager);

    const content = qs("#shopping-list-content");
    const clearCheckedBtn = qs("#clear-checked-btn");
    const clearAllBtn = qs("#clear-all-btn");
    const filterTabs = qs("#filter-tabs");

    // Filter state
    let currentFilter = "all";

    // Render the shopping list
    function renderList() {
        let recipes = shoppingListManager.getAll();

        // Apply filter
        if (currentFilter === "incomplete") {
            recipes = recipes.filter((r) => r.ingredients.some((i) => !i.checked));
        }

        // Empty state
        if (recipes.length === 0) {
            const emptyMessage =
                currentFilter === "incomplete"
                    ? "No recipes with pending ingredients! &#127881;"
                    : "Your shopping list is empty!";

            content.innerHTML = `
                <div class="empty-state">
                    <p>${emptyMessage}</p>
                    <a href="/" class="auth-link">Go find some recipes →</a>
                </div>
            `;
            clearCheckedBtn.disabled = true;
            clearAllBtn.disabled = true;
            return;
        }

        // Enable buttons
        clearCheckedBtn.disabled = false;
        clearAllBtn.disabled = false;

        // Render each recipe
        content.innerHTML = recipes
            .map(
                (recipe) => `
            <article class="shopping-recipe" data-recipe-id="${escapeHtml(recipe.recipeId)}">
                <header class="shopping-recipe__header">
                    <a href="/recipe/?id=${escapeHtml(recipe.recipeId)}" class="shopping-recipe__link">
                        <img class="shopping-recipe__thumb" src="${escapeHtml(recipe.recipeThumb)}"
                            alt="${escapeHtml(recipe.recipeName)}" loading="lazy"
                        />
                        <h2 class="shopping-recipe__title">${escapeHtml(recipe.recipeName)}</h2>
                    </a>
                    <button class="shopping-recipe__remove" data-recipe-id="${escapeHtml(recipe.recipeId)}"
                        aria-label="Remove recipe from shopping list">
                        &#10005;
                    </button>
                </header>

                <ul class="shopping-recipe__ingredients">
                    ${recipe.ingredients
                        .map(
                            (ing) => `
                        <li class="shopping-ingredient ${ing.checked ? "is-checked" : ""}">
                            <label class="shopping-ingredient__label">
                                <input type="checkbox" class="shopping-ingredient__checkbox"
                                    data-recipe-id="${escapeHtml(recipe.recipeId)}"
                                    data-ingredient="${escapeHtml(ing.name)}"
                                    ${ing.checked ? "checked" : ""}
                                />
                                <span class="shopping-ingredient__text">
                                    <strong>${escapeHtml(ing.measure)}</strong>
                                    ${escapeHtml(ing.name)}
                                </span>
                            </label>
                            <button class="shopping-ingredient__remove" data-recipe-id="${escapeHtml(recipe.recipeId)}"
                                data-ingredient="${escapeHtml(ing.name)}" aria-label="Remove ingredient">
                                &#10005;
                            </button>
                        </li>
                    `
                        )
                        .join("")}
                </ul>
            </article>
        `
            )
            .join("");

        // Wire up event listeners
        wireUpEvents();
    }

    // Wire up event listeners
    function wireUpEvents() {
        // Checkboxes
        content.querySelectorAll(".shopping-ingredient__checkbox").forEach((cb) => {
            cb.addEventListener("change", (e) => {
                const recipeId = e.target.dataset.recipeId;
                const ingredient = e.target.dataset.ingredient;
                const isChecked = shoppingListManager.toggleIngredient(recipeId, ingredient);
                e.target.closest(".shopping-ingredient").classList.toggle("is-checked", isChecked);

                // If filtering by "incomplete", re-render to hide completed recipes
                if (currentFilter === "incomplete") {
                    const recipe = shoppingListManager
                        .getAll()
                        .find((r) => r.recipeId === recipeId);
                    if (recipe && recipe.ingredients.every((i) => i.checked)) {
                        renderList();
                    }
                }
            });
        });

        // Remove ingredient buttons
        content.querySelectorAll(".shopping-ingredient__remove").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const recipeId = e.currentTarget.dataset.recipeId;
                const ingredient = e.currentTarget.dataset.ingredient;
                shoppingListManager.removeIngredient(recipeId, ingredient);
                renderList();
            });
        });

        // Remove recipe buttons
        content.querySelectorAll(".shopping-recipe__remove").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const recipeId = e.currentTarget.dataset.recipeId;
                const recipe = shoppingListManager.getAll().find((r) => r.recipeId === recipeId);
                if (
                    confirm(
                        `Remove "${recipe?.recipeName || "this recipe"}" from your shopping list?`
                    )
                ) {
                    shoppingListManager.removeRecipe(recipeId);
                    renderList();
                }
            });
        });
    }

    // Clear checked button
    clearCheckedBtn.addEventListener("click", () => {
        if (confirm("Remove all checked ingredients from your list?")) {
            shoppingListManager.clearChecked();
            renderList();
        }
    });

    // Clear all button
    clearAllBtn.addEventListener("click", () => {
        if (confirm("Clear your entire shopping list? This cannot be undone.")) {
            shoppingListManager.clear();
            renderList();
        }
    });

    // Filter tabs
    if (filterTabs) {
        filterTabs.querySelectorAll(".filter-tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                currentFilter = tab.dataset.filter;

                // Update active state
                filterTabs
                    .querySelectorAll(".filter-tab")
                    .forEach((t) => t.classList.remove("filter-tab--active"));
                tab.classList.add("filter-tab--active");

                renderList();
            });
        });
    }

    // Initial render
    renderList();
})();
