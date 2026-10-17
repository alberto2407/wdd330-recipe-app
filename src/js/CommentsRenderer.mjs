// src/js/CommentsRenderer.mjs
import { escapeHtml } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";

// Format a date as relative time
function formatRelativeTime(isoDate) {
    const now = Date.now();
    const date = new Date(isoDate).getTime();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 30) return "Just now";
    if (diffMin < 1) return `${diffSec} sec ago`;
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return new Date(isoDate).toLocaleDateString();
}

// Render the comments section
export function renderComments(commentsManager, containerSelector = "#recipe-comments") {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const userManager = createUserManager();
    const currentUser = userManager.getCurrentUser();
    const comments = commentsManager.getAll();

    // Comments list HTML
    let commentsListHtml = "";
    if (comments.length === 0) {
        commentsListHtml = `<p class="comments-empty">No comments yet. Be the first to leave one!</p>`;
    } else {
        commentsListHtml = comments
            .map((comment) => {
                const isOwn = currentUser && comment.userId === currentUser.id;
                const wasEdited = comment.updatedAt ? ' <span class="comment__edited">(edited)</span>' : "";

                return `
                    <div class="comment" data-comment-id="${escapeHtml(comment.id)}">
                        <img class="comment__avatar" src="${escapeHtml(comment.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=" + comment.username)}" alt="${escapeHtml(comment.username)}" />
                        <div class="comment__body">
                            <div class="comment__header">
                                <span class="comment__username">${escapeHtml(comment.username)}</span>
                                <span class="comment__time">${formatRelativeTime(comment.createdAt)}${wasEdited}</span>
                            </div>
                            <p class="comment__text">${escapeHtml(comment.text)}</p>
                            ${isOwn ? `
                                <div class="comment__actions">
                                    <button class="comment__action-btn" data-action="edit" data-comment-id="${escapeHtml(comment.id)}">✏ Edit</button>
                                    <button class="comment__action-btn comment__action-btn--danger" data-action="delete" data-comment-id="${escapeHtml(comment.id)}">🗑 Delete</button>
                                </div>
                            ` : ""}
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    // Comment form (only for logged-in users)
    const formHtml = currentUser
        ? `
            <form class="comment-form" id="comment-form">
                <label for="comment-input" class="visually-hidden">Write your comment</label>
                <textarea id="comment-input" class="comment-form__textarea" placeholder="Write your comment..." maxlength="500" required></textarea>
                <button type="submit" class="comment-form__submit">Post Comment</button>
            </form>
        `
        : `
            <div class="comment-login-prompt">
                <a href="/login/">Login</a> to leave a comment.
            </div>
        `;

    // Render the section
    container.innerHTML = `
        <h2 class="recipe-page__section-title">&#128172; Comments (${comments.length})</h2>
        <div class="comments-list">
            ${commentsListHtml}
        </div>
        ${formHtml}
    `;

    // Wire up form submit
    const form = container.querySelector("#comment-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const textarea = form.querySelector(".comment-form__textarea");
            const text = textarea.value.trim();
            if (!text) return;

            const result = commentsManager.add(text);
            if (result.success) {
                textarea.value = "";
                renderComments(commentsManager, containerSelector);
            } else {
                alert(result.message);
            }
        });
    }

    // Wire up edit/delete buttons
    container.querySelectorAll(".comment__action-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const action = btn.dataset.action;
            const commentId = btn.dataset.commentId;
            const commentEl = container.querySelector(`.comment[data-comment-id="${commentId}"]`);
            const textEl = commentEl.querySelector(".comment__text");
            const currentText = textEl.textContent;

            if (action === "delete") {
                if (confirm("Delete this comment?")) {
                    const result = commentsManager.remove(commentId);
                    if (result.success) {
                        renderComments(commentsManager, containerSelector);
                    } else {
                        alert(result.message);
                    }
                }
            } else if (action === "edit") {
                textEl.innerHTML = `
                    <textarea class="comment__edit-textarea" maxlength="500">${escapeHtml(currentText)}</textarea>
                    <div class="comment__edit-actions">
                        <button class="comment__edit-save">Save</button>
                        <button class="comment__edit-cancel">Cancel</button>
                    </div>
                `;

                const editTextarea = textEl.querySelector(".comment__edit-textarea");
                editTextarea.focus();

                textEl.querySelector(".comment__edit-save").addEventListener("click", () => {
                    const newText = editTextarea.value.trim();
                    const result = commentsManager.edit(commentId, newText);
                    if (result.success) {
                        renderComments(commentsManager, containerSelector);
                    } else {
                        alert(result.message);
                    }
                });

                textEl.querySelector(".comment__edit-cancel").addEventListener("click", () => {
                    renderComments(commentsManager, containerSelector);
                });
            }
        });
    });
}