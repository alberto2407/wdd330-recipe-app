import { escapeHtml } from "./utils.mjs";

// RecipeRenderer class
export default class RecipeRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.template = document.querySelector("#recipe-card-template");
        this.onAddToShoppingList = null;
    }

    // Render a list of recipes
    render(recipes, onView, onFavorite, isFavorite) {
        if (!this.container || !this.template) return;

        this.container.innerHTML = "";

        if (recipes.length === 0) {
            this.container.innerHTML = `
                <p class="no-recipes">
                    No recipes found. Try adding different ingredients!
                </p>
            `;
            return;
        }

        // Render each recipe
        recipes.forEach((recipe) => {
            const clone = this.template.content.cloneNode(true);
            const card = clone.querySelector(".recipe-card");

            // Use dataset to store the recipe ID
            card.dataset.recipeId = recipe.idMeal;

            // Populate the template
            const image = card.querySelector(".recipe-card__image");
            image.src = recipe.strMealThumb;
            image.alt = recipe.strMeal;

            card.querySelector(".recipe-card__title").textContent = escapeHtml(recipe.strMeal);
            card.querySelector(".recipe-card__category").textContent = escapeHtml(
                recipe.strCategory || recipe.strArea || "Recipe"
            );

            // Favorite button state
            const favBtn = card.querySelector(".favorite-btn");
            const isFav = isFavorite(recipe.idMeal);
            favBtn.textContent = isFav ? "★" : "☆";
            favBtn.classList.toggle("is-favorite", isFav);

            // Event listeners
            card.querySelector(".recipe-card__view-btn").addEventListener("click", () => {
                onView(recipe.idMeal);
            });

            // Event listener for favorite button
            favBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const nowFavorite = onFavorite(recipe.idMeal);
                favBtn.textContent = nowFavorite ? "★" : "☆";
                favBtn.classList.toggle("is-favorite", nowFavorite);
            });

            // Append the recipe card
            this.container.appendChild(clone);
        });
    }

    // Show recipe details in a modal
    showDetails(recipe, modalSelector, contentSelector) {
        const modal = document.querySelector(modalSelector);
        const content = document.querySelector(contentSelector);
        if (!modal || !content || !recipe) return;

        // Extract ingredients and instructions
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ing = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ing && ing.trim()) {
                ingredients.push({
                    name: ing.trim(),
                    measure: measure ? measure.trim() : "",
                });
            }
        }

        // Populate the modal
        content.innerHTML = `
            <img class="modal__image" src="${recipe.strMealThumb}" alt="${escapeHtml(recipe.strMeal)}" />
            <h2 class="modal__title">${escapeHtml(recipe.strMeal)}</h2>
            <p class="modal__meta">
                <strong>Category:</strong> ${escapeHtml(recipe.strCategory || "N/A")} · 
                <strong>Area:</strong> ${escapeHtml(recipe.strArea || "N/A")}
            </p>
            <div class="modal__action-row">
                <button class="modal__share-btn" data-recipe-id="${recipe.idMeal}">
                    &#128279; Copy link
                </button>
                <button class="modal__shopping-btn" data-recipe-id="${recipe.idMeal}">
                    &#128722; Add to Shopping List
                </button>
                <a class="modal__full-link" href="/recipe/?id=${recipe.idMeal}" data-recipe-id="${recipe.idMeal}">
                    &#128196; View Full Recipe
                </a>
            </div>
            <h3 class="modal__section-title">Ingredients</h3>
            <ul class="modal__ingredients">
                ${ingredients.map((i) => `<li>${escapeHtml(i.measure)} ${escapeHtml(i.name)}</li>`).join("")}
            </ul>
            <h3 class="modal__section-title">Instructions</h3>
            <p class="modal__instructions">${escapeHtml(recipe.strInstructions || "No instructions provided.")}</p>
        `;

        // Wire up the share button
        const shareBtn = content.querySelector(".modal__share-btn");
        if (shareBtn) {
            shareBtn.addEventListener("click", async () => {
                // ← FIX: usar ?id= para consistencia y evitar 404 en local
                const url = `${window.location.origin}/recipe/?id=${recipe.idMeal}`;
                try {
                    await navigator.clipboard.writeText(url);
                    shareBtn.textContent = "Link copied!";
                    setTimeout(() => {
                        shareBtn.innerHTML = "&#128279; Copy link";
                    }, 2000);
                } catch (error) {
                    console.error("Clipboard error:", error);
                    // Fallback
                    window.prompt("Copy this link:", url);
                }
            });
        }

        // Wire up the "Add to Shopping List" button
        const shoppingBtn = content.querySelector(".modal__shopping-btn");
        if (shoppingBtn && this.onAddToShoppingList) {
            shoppingBtn.addEventListener("click", () => {
                const success = this.onAddToShoppingList(recipe);
                if (success) {
                    shoppingBtn.innerHTML = "&#10003; Added!";
                    shoppingBtn.classList.add("is-added");
                    setTimeout(() => {
                        shoppingBtn.innerHTML = "&#128722; Add to Shopping List";
                        shoppingBtn.classList.remove("is-added");
                    }, 2000);
                } else {
                    shoppingBtn.innerHTML = "&#10003; Already in List";
                    setTimeout(() => {
                        shoppingBtn.innerHTML = "&#128722; Add to Shopping List";
                    }, 2000);
                }
            });
        }
        modal.classList.remove("hide");
    }

    // Set the handler for adding to the shopping list
    setShoppingListHandler(handler) {
        this.onAddToShoppingList = handler;
    }

    // Hide the recipe details modal
    hideDetails(modalSelector) {
        const modal = document.querySelector(modalSelector);
        if (modal) modal.classList.add("hide");
    }
}
