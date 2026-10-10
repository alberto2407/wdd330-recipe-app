import { escapeHtml } from "./utils.mjs";

// RecipeRenderer class
export default class RecipeRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.template = document.querySelector("#recipe-card-template");
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
            <h3 class="modal__section-title">Ingredients</h3>
            <ul class="modal__ingredients">
                ${ingredients.map((i) => `<li>${escapeHtml(i.measure)} ${escapeHtml(i.name)}</li>`).join("")}
            </ul>
            <h3 class="modal__section-title">Instructions</h3>
            <p class="modal__instructions">${escapeHtml(recipe.strInstructions || "No instructions provided.")}</p>
        `;
        modal.classList.remove("hide");
    }

    // Hide the recipe details modal
    hideDetails(modalSelector) {
        const modal = document.querySelector(modalSelector);
        if (modal) modal.classList.add("hide");
    }
}
