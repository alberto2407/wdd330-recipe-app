import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";

// Create a StatsManager
export function createStatsManager() {
    const userManager = createUserManager();
    const user = userManager.getCurrentUser();

    // Dynamic key based on the user
    const key = user ? `house-recipe-stats-${user.id}` : "house-recipe-stats-guest";

    let stats = getLocalStorage(key) || {
        visits: 0,
        lastVisit: null,
        previousVisit: null,
    };

    return {
        // |Increments visits and updates lastVisit
        trackVisit() {
            // Move current lastVisit to previousVisit
            stats.previousVisit = stats.lastVisit;

            stats.visits += 1;
            stats.lastVisit = new Date().toISOString();
            setLocalStorage(key, stats);
        },

        // Get total visits
        getVisits() {
            return stats.visits;
        },

        // Get previous visit date (ISO string) or null
        getPreviousVisit() {
            return stats.previousVisit || null;
        },

        // Get all stats
        getAll() {
            return { ...stats };
        },
    };
}
