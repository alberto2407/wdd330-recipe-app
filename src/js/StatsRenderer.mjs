import { qs } from "./utils.mjs";

// Render the visits stats card
export function renderStats(statsManager, containerSelector = "#visits-stats") {
    const container = qs(containerSelector);
    if (!container) return;

    const visits = statsManager.getVisits();
    const previousVisit = statsManager.getPreviousVisit();

    // Calculate time since last visit
    let lastVisitText = "Welcome! First time here";
    if (previousVisit) {
        const diffMs = Date.now() - new Date(previousVisit).getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) {
            lastVisitText = "Just now";
        } else if (diffMinutes < 60) {
            lastVisitText = `${diffMinutes} min ago`;
        } else if (diffHours < 24) {
            lastVisitText = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        } else if (diffDays === 1) {
            lastVisitText = "Yesterday";
        } else if (diffDays < 7) {
            lastVisitText = `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            lastVisitText = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
        } else {
            const months = Math.floor(diffDays / 30);
            lastVisitText = `${months} month${months > 1 ? "s" : ""} ago`;
        }
    }

    container.innerHTML = `
        <h3 class="side-card__title">&#128075; Your Activity</h3>

        <div class="stats-item">
            <span class="stats-item__icon">&#128064;</span>
            <div class="stats-item__content">
                <span class="stats-item__label">Visits</span>
                <span class="stats-item__value">${visits}</span>
            </div>
        </div>

        <div class="stats-item">
            <span class="stats-item__icon">&#128336;</span>
            <div class="stats-item__content">
                <span class="stats-item__label">Last visit</span>
                <span class="stats-item__value stats-item__value--small">${lastVisitText}</span>
            </div>
        </div>
    `;
}
