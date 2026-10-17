// src/js/LastRecipeRenderer.mjs
import { qs, escapeHtml } from "./utils.mjs";

// Render the "Recipe History" side card
export function renderLastRecipe(
    lastRecipeManager,
    shoppingListManager,
    containerSelector = "#last-recipe-card"
) {
    const container = qs(containerSelector);
    if (!container) return;

    const currentRecipe = lastRecipeManager.get();
    const totalCount = lastRecipeManager.count();

    //  No history yet
    if (!currentRecipe) {
        container.innerHTML = `
            <h3 class="side-card__title">
                &#127858; Recipe History
            </h3>
            <p class="side-card__empty">No recipes yet. Start searching!</p>
        `;
        return;
    }

    // Check if the current recipe is in the shopping list
    const isInShoppingList = shoppingListManager.hasRecipe(currentRecipe.recipeId);

    // Get the shopping list entry
    const shoppingEntry = isInShoppingList
        ? shoppingListManager.getAll().find((r) => r.recipeId === currentRecipe.recipeId)
        : null;

    // Get the list of pending ingredients
    const pendingIngredients = shoppingEntry
        ? shoppingEntry.ingredients.filter((i) => !i.checked)
        : [];

    // ---------- Header and status badge ----------
    const statusBadge = isInShoppingList
        ? `<span class="side-card__status side-card__status--planning">&#128722; Planning</span>`
        : `<span class="side-card__status side-card__status--not-planning">Not planning</span>`;

    // ---------- Navigation buttons and counter ----------
    const currentIndex = lastRecipeManager.getCurrentIndex();
    const canGoPrevious = lastRecipeManager.canGoPrevious();
    const canGoNext = lastRecipeManager.canGoNext();
    const showNav = totalCount > 1;

    const navHtml = showNav
        ? `
            <div class="last-recipe-nav">
                <button
                    class="last-recipe-nav__arrow"
                    id="history-prev"
                    aria-label="Previous recipe"
                    ${canGoPrevious ? "" : "disabled"}
                >
                    &#8592;
                </button>
                <span class="last-recipe-nav__counter">${currentIndex + 1} / ${totalCount}</span>
                <button
                    class="last-recipe-nav__arrow"
                    id="history-next"
                    aria-label="Next recipe"
                    ${canGoNext ? "" : "disabled"}
                >
                    &#8594;
                </button>
            </div>
        `
        : "";

    // ---------- Body content and buttons ----------
    let bodyHtml = "";

    if (!isInShoppingList) {
        // State 1: Not in shopping list
        bodyHtml = `
            <div class="last-recipe-card__hint">
                &#128722; Add this recipe to your shopping list to track what you need to buy.
            </div>
            <button class="last-recipe-card__btn last-recipe-card__btn--shopping" id="history-add-shopping" data-recipe-id="${currentRecipe.recipeId}">
                &#128722; Add to Shopping List
            </button>
        `;
    } else if (pendingIngredients.length === 0) {
        // State 3: In shopping list, everything purchased
        bodyHtml = `
            <p class="last-recipe-card__complete">
                &#9989; All ingredients purchased!
            </p>
            <a href="/shopping-list/" class="last-recipe-card__btn last-recipe-card__btn--shopping">
                &#128722; View Shopping List
            </a>
        `;
    } else {
        // State 2: In shopping list, some pending
        const maxDisplay = 4;
        const displayed = pendingIngredients.slice(0, maxDisplay);
        const extra = pendingIngredients.length - maxDisplay;

        bodyHtml = `
            <div class="last-recipe-card__missing">
                <p class="last-recipe-card__missing-title">
                    &#128722; Still to buy (${pendingIngredients.length}):
                </p>
                <ul class="last-recipe-card__missing-list">
                    ${displayed.map((i) => `<li>${escapeHtml(i.name)}</li>`).join("")}
                    ${extra > 0 ? `<li class="last-recipe-card__missing-more">+${extra} more</li>` : ""}
                </ul>
            </div>
            <a href="/shopping-list/" class="last-recipe-card__btn last-recipe-card__btn--shopping">
                &#128722; View Shopping List
            </a>
        `;
    }

    // ---------- Render the card content ----------
    container.innerHTML = `
        <h3 class="side-card__title">
            &#127858; Recipe History
            ${statusBadge}
        </h3>

        ${navHtml}

        <a href="/recipe/?id=${currentRecipe.recipeId}" class="last-recipe-card__link">
            <img
                class="last-recipe-card__image"
                src="${escapeHtml(currentRecipe.recipeThumb)}"
                alt="${escapeHtml(currentRecipe.recipeName)}"
                loading="lazy"
            />
            <p class="last-recipe-card__name">${escapeHtml(currentRecipe.recipeName)}</p>
        </a>

        ${bodyHtml}

        <a href="/recipe/?id=${currentRecipe.recipeId}" class="last-recipe-card__btn">
            View Recipe &#8594;
        </a>
    `;

    // ---------- Navigation buttons ----------
    if (showNav) {
        const prevBtn = container.querySelector("#history-prev");
        const nextBtn = container.querySelector("#history-next");

        if (prevBtn) {
            prevBtn.addEventListener("click", (e) => {
                e.preventDefault();
                if (lastRecipeManager.goPrevious()) {
                    renderLastRecipe(lastRecipeManager, shoppingListManager, containerSelector);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", (e) => {
                e.preventDefault();
                if (lastRecipeManager.goNext()) {
                    renderLastRecipe(lastRecipeManager, shoppingListManager, containerSelector);
                }
            });
        }
    }

    // ---------- "Add to Shopping List" ----------
    const addBtn = container.querySelector("#history-add-shopping");
    if (addBtn) {
        addBtn.addEventListener("click", async () => {
            // Disable the button to prevent multiple clicks
            const recipeId = addBtn.dataset.recipeId;
            addBtn.disabled = true;
            addBtn.textContent = "Adding...";

            try {
                // Import the RecipeAPI dynamically to avoid circular deps
                const { default: RecipeAPI } = await import("./RecipeAPI.mjs");
                const api = new RecipeAPI();
                const fullRecipe = await api.getRecipeById(recipeId);

                if (fullRecipe) {
                    shoppingListManager.addRecipe(fullRecipe);
                    renderLastRecipe(lastRecipeManager, shoppingListManager, containerSelector);
                } else {
                    addBtn.disabled = false;
                    addBtn.textContent = "&#128722; Add to Shopping List";
                }
            } catch (error) {
                console.error("Error adding to shopping list:", error);
                addBtn.disabled = false;
                addBtn.textContent = "&#128722; Add to Shopping List";
            }
        });
    }
}
