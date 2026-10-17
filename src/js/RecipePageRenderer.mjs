import { escapeHtml } from "./utils.mjs";

// Convert YouTube URL to embed URL
function getYoutubeEmbedUrl(url) {
    if (!url) return "";

    // Support multiple YouTube URL formats:
    //   - https://www.youtube.com/watch?v=VIDEO_ID
    //   - https://youtu.be/VIDEO_ID
    //   - https://www.youtube.com/shorts/VIDEO_ID
    //   - https://www.youtube.com/embed/VIDEO_ID (already embedded)
    const patterns = [
        /youtube\.com\/watch\?v=([^&?/]+)/,
        /youtu\.be\/([^&?/]+)/,
        /youtube\.com\/shorts\/([^&?/]+)/,
        /youtube\.com\/embed\/([^&?/]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
    }

    // Fallback: return the original URL
    return url;
}

// RecipePageRenderer class — renders the full recipe detail page
export default class RecipePageRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
    }

    // Render the recipe page
    render(recipe, handlers) {
        if (!this.container || !recipe) return;

        const { onShare, onToggleFavorite, isFavorite, onAddToShoppingList } = handlers;
        const isInList = handlers.isInShoppingList
            ? handlers.isInShoppingList(recipe.idMeal)
            : false;

        // Extract ingredients and measures
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ing = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeal${i}`] ? null : recipe[`strMeasure${i}`];
            if (ing && ing.trim()) {
                ingredients.push({
                    name: ing.trim(),
                    measure: measure ? measure.trim() : "",
                });
            }
        }

        // Determine favorite state
        const isFav = isFavorite(recipe.idMeal);

        // Build optional external links
        // Build YouTube video embed (if available)
        const youtubeEmbed = recipe.strYoutube
            ? `<section class="recipe-page__video-section">
                   <h2 class="recipe-page__section-title">&#127909; Video Tutorial</h2>
                   <div class="recipe-page__video-wrapper">
                       <iframe class="recipe-page__video" src="${getYoutubeEmbedUrl(recipe.strYoutube)}"
                           title="${escapeHtml(recipe.strMeal)} video tutorial" frameborder="0"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                           referrerpolicy="strict-origin-when-cross-origin" allowfullscreen
                       ></iframe>
                   </div>
                   <p class="recipe-page__video-hint">
                       If the video doesn't play, it may be restricted to YouTube.
                   </p>
                   <a class="recipe-page__external-link" href="${escapeHtml(recipe.strYoutube)}" target="_blank" rel="noopener noreferrer">
                       &#9654; Watch on YouTube
                   </a>
               </section>`
            : "";

        // Render the page
        this.container.innerHTML = `
            <div class="recipe-page__hero">
                <img class="recipe-page__image" src="${escapeHtml(recipe.strMealThumb)}" alt="${escapeHtml(recipe.strMeal)}"/>
            </div>

            <h1 class="recipe-page__title">${escapeHtml(recipe.strMeal)}</h1>

            <p class="recipe-page__meta">
                ${recipe.strCategory ? `<span><strong>Category:</strong> ${escapeHtml(recipe.strCategory)}</span>` : ""}
                ${recipe.strArea ? `<span><strong>Area:</strong> ${escapeHtml(recipe.strArea)}</span>` : ""}
            </p>

            <div class="recipe-page__actions">
                <button class="recipe-page__action-btn" id="back-btn" aria-label="Go back">
                    &#8592; Back
                </button>
                <button class="recipe-page__action-btn" id="share-btn" aria-label="Share recipe">
                    &#128279; Share
                </button>
                <button
                    class="recipe-page__action-btn recipe-page__action-btn--favorite ${isFav ? "is-favorite" : ""}"
                    id="favorite-btn"
                    aria-label="Toggle favorite"
                >
                    ${isFav ? "&#9829; Saved" : "&#9825; Save"}
                </button>
                <button
                    class="recipe-page__action-btn recipe-page__action-btn--shopping ${isInList ? "is-added" : ""}"
                    id="shopping-btn"
                    aria-label="Add to shopping list"
                >
                    ${isInList ? "&#10003; In Shopping List" : "&#128722; Add to Shopping List"}
                </button>
            </div>

            <div class="recipe-page__content">
                <section class="recipe-page__section">
                    <h2 class="recipe-page__section-title">&#129367; Ingredients</h2>
                    <ul class="recipe-page__ingredients">
                        ${ingredients
                .map((i) => `<li>${escapeHtml(i.measure)} ${escapeHtml(i.name)}</li>`)
                .join("")}
                    </ul>
                </section>

                <section class="recipe-page__section">
                    <h2 class="recipe-page__section-title">&#128203; Instructions</h2>
                    <p class="recipe-page__instructions">${escapeHtml(
                    recipe.strInstructions || "No instructions provided."
                )}</p>
                </section>
            </div>

            ${youtubeEmbed}
            <div class="recipe-page__section comments-section" id="recipe-comments"></div>
        `;

        // Wire event listeners
        this.#wireEvents(recipe.idMeal, { onShare, onToggleFavorite, onAddToShoppingList });
    }

    // Wire event listeners
    #wireEvents(recipeId, { onShare, onToggleFavorite, onAddToShoppingList }) {
        // Back button
        const backBtn = this.container.querySelector("#back-btn");
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                // If there's browser history, go back. Otherwise, go home.
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = "/";
                }
            });
        }

        // Share button
        const shareBtn = this.container.querySelector("#share-btn");
        if (shareBtn) {
            shareBtn.addEventListener("click", async () => {
                const success = await onShare(recipeId);
                if (success) {
                    const originalHtml = shareBtn.innerHTML;
                    shareBtn.innerHTML = "&#10003; Link copied!";
                    setTimeout(() => {
                        shareBtn.innerHTML = originalHtml;
                    }, 2000);
                }
            });
        }

        // Favorite button
        const favBtn = this.container.querySelector("#favorite-btn");
        if (favBtn) {
            favBtn.addEventListener("click", () => {
                const nowFavorite = onToggleFavorite(recipeId);
                if (nowFavorite) {
                    favBtn.innerHTML = "&#9829; Saved";
                    favBtn.classList.add("is-favorite");
                } else {
                    favBtn.innerHTML = "&#9825; Save";
                    favBtn.classList.remove("is-favorite");
                }
            });
        }

        // Shopping list button
        const shoppingBtn = this.container.querySelector("#shopping-btn");
        if (shoppingBtn && onAddToShoppingList) {
            shoppingBtn.addEventListener("click", () => {
                // onAddToShoppingList is passed via closure
                const result = onAddToShoppingList();
                if (result === "added") {
                    shoppingBtn.innerHTML = "&#10003; In Shopping List";
                    shoppingBtn.classList.add("is-added");
                } else if (result === "removed") {
                    shoppingBtn.innerHTML = "&#128722; Add to Shopping List";
                    shoppingBtn.classList.remove("is-added");
                } else {
                    shoppingBtn.innerHTML = "&#10003; Already in List";
                    setTimeout(() => {
                        shoppingBtn.innerHTML = "&#128722; Add to Shopping List";
                    }, 2000);
                }
            });
        }
    }

    // Render an error state
    renderError(title, message) {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="recipe-page__error">
                <h1>${escapeHtml(title)}</h1>
                <p>${escapeHtml(message)}</p>
                <a href="/" class="recipe-page__error-btn">&#8592; Back to Home</a>
            </div>
        `;
    }
}
