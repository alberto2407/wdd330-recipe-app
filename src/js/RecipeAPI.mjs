const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Recipe API
export default class RecipeAPI {
    // Search recipes by ingredient
    async searchByIngredient(ingredient) {
        const url = `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.meals || [];
    }

    // Search recipes by multiple ingredients
    async searchByIngredients(ingredients) {
        const results = await Promise.all(
            ingredients.map((ingredient) => this.searchByIngredient(ingredient))
        );

        // Merge and deduplicate by meal ID
        const allMeals = results.flat();
        const uniqueMeals = allMeals.filter(
            (meal, index, self) => self.findIndex((m) => m.idMeal === meal.idMeal) === index
        );

        return uniqueMeals;
    }

    // Get a recipe by ID
    async getRecipeById(id) {
        const url = `${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    }

    // Get a random recipe
    async getRandomRecipe() {
        const url = `${BASE_URL}/random.php`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    }

    // Diet rules: each diet has a list of forbidden ingredients
    static DIET_RULES = {
        vegetarian: [
            "chicken",
            "beef",
            "pork",
            "lamb",
            "bacon",
            "ham",
            "sausage",
            "turkey",
            "duck",
            "veal",
            "goat",
            "venison",
            "fish",
            "salmon",
            "tuna",
            "cod",
            "shrimp",
            "prawn",
            "crab",
            "lobster",
            "clam",
            "mussel",
            "oyster",
            "squid",
            "anchovy",
            "sardine",
            "gelatin",
            "lard",
        ],
        vegan: [
            // Everything vegetarian + animal products
            "chicken",
            "beef",
            "pork",
            "lamb",
            "bacon",
            "ham",
            "sausage",
            "turkey",
            "duck",
            "veal",
            "goat",
            "venison",
            "fish",
            "salmon",
            "tuna",
            "cod",
            "shrimp",
            "prawn",
            "crab",
            "lobster",
            "clam",
            "mussel",
            "oyster",
            "squid",
            "anchovy",
            "sardine",
            "gelatin",
            "lard",
            "egg",
            "eggs",
            "milk",
            "cheese",
            "butter",
            "cream",
            "yogurt",
            "yoghurt",
            "honey",
            "mayonnaise",
            "ghee",
            "whey",
        ],
        "gluten-free": [
            "flour",
            "bread",
            "breadcrumbs",
            "pasta",
            "spaghetti",
            "macaroni",
            "noodles",
            "wheat",
            "barley",
            "rye",
            "couscous",
            "cracker",
            "crackers",
            "beer",
            "soy sauce",
            "panko",
        ],
        "dairy-free": [
            "milk",
            "cheese",
            "butter",
            "cream",
            "yogurt",
            "yoghurt",
            "ghee",
            "whey",
            "mozzarella",
            "parmesan",
            "cheddar",
            "ricotta",
            "mascarpone",
            "custard",
        ],
        keto: [
            "rice",
            "bread",
            "pasta",
            "spaghetti",
            "macaroni",
            "noodles",
            "potato",
            "potatoes",
            "sugar",
            "flour",
            "honey",
            "syrup",
            "corn",
            "beans",
            "lentils",
            "chickpeas",
            "banana",
            "apple",
            "orange",
            "grapes",
            "mango",
            "pear",
            "peach",
        ],
        paleo: [
            "rice",
            "bread",
            "pasta",
            "spaghetti",
            "macaroni",
            "noodles",
            "potato",
            "potatoes",
            "sugar",
            "flour",
            "honey",
            "syrup",
            "corn",
            "beans",
            "lentils",
            "chickpeas",
            "soy",
            "tofu",
            "milk",
            "cheese",
            "butter",
            "cream",
            "yogurt",
            "yoghurt",
            "oats",
            "quinoa",
            "barley",
        ],
        "low-carb": [
            "rice",
            "bread",
            "pasta",
            "spaghetti",
            "macaroni",
            "noodles",
            "potato",
            "potatoes",
            "sugar",
            "flour",
            "honey",
            "syrup",
            "banana",
            "grapes",
            "mango",
        ],
        pescatarian: [
            "chicken",
            "beef",
            "pork",
            "lamb",
            "bacon",
            "ham",
            "sausage",
            "turkey",
            "duck",
            "veal",
            "goat",
            "venison",
        ],
    };

    // Cache to avoid duplicate lookups
    #recipeCache = new Map();

    // Get full recipe details (cached)
    async getRecipeDetails(id) {
        if (this.#recipeCache.has(id)) {
            return this.#recipeCache.get(id);
        }
        const recipe = await this.getRecipeById(id);
        this.#recipeCache.set(id, recipe);
        return recipe;
    }

    // Extract ingredient names from a full recipe object
    static getIngredients(recipe) {
        if (!recipe) return [];
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ing = recipe[`strIngredient${i}`];
            if (ing && ing.trim()) {
                ingredients.push(ing.trim().toLowerCase());
            }
        }
        return ingredients;
    }

    // Check if a recipe complies with all active diets
    static compliesWithDiets(recipe, diets) {
        if (!diets || diets.length === 0) return true;

        const ingredients = RecipeAPI.getIngredients(recipe);
        const ingredientText = ingredients.join(" ");

        // For each active diet, check if any forbidden ingredient is present
        for (const diet of diets) {
            const forbidden = RecipeAPI.DIET_RULES[diet];
            if (!forbidden) continue; // unknown diet, skip

            const hasForbidden = forbidden.some((bad) =>
                ingredientText.includes(bad.toLowerCase())
            );

            if (hasForbidden) return false; // fails one diet → exclude
        }

        return true; // passes all diets
    }

    // Filter recipes by diets (fetches details for each)
    async filterByDiets(recipes, diets) {
        if (!diets || diets.length === 0) return recipes;

        // Fetch full details for each recipe in parallel
        const detailedRecipes = await Promise.all(
            recipes.map((r) => this.getRecipeDetails(r.idMeal).catch(() => null))
        );

        // Filter out nulls and non-compliant recipes
        return detailedRecipes.filter(
            (recipe) => recipe && RecipeAPI.compliesWithDiets(recipe, diets)
        );
    }
}
