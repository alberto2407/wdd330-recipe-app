// src/js/CommentsManager.mjs
import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { createUserManager } from "./UserManager.mjs";

// Create a CommentsManager for a specific recipe
export function createCommentsManager(recipeId) {
    const userManager = createUserManager();
    const key = `house-recipe-comments-${recipeId}`;

    let comments = getLocalStorage(key) || [];

    const persist = () => {
        setLocalStorage(key, comments);
    };

    return {
        // Add a new comment
        add(text) {
            const user = userManager.getCurrentUser();
            if (!user) return { success: false, message: "You must be logged in." };

            const trimmed = text.trim();
            if (trimmed.length < 1) return { success: false, message: "Comment cannot be empty." };
            if (trimmed.length > 500) return { success: false, message: "Comment is too long (max 500)." };

            const newComment = {
                id: Date.now().toString(),
                userId: user.id,
                username: user.username || user.name,
                avatar: user.avatar,
                text: trimmed,
                createdAt: new Date().toISOString(),
                updatedAt: null,
            };

            comments.push(newComment);
            persist();
            return { success: true, comment: newComment };
        },

        // Edit an existing comment (only by its author)
        edit(commentId, newText) {
            const user = userManager.getCurrentUser();
            if (!user) return { success: false, message: "You must be logged in." };

            const comment = comments.find((c) => c.id === commentId);
            if (!comment) return { success: false, message: "Comment not found." };
            if (comment.userId !== user.id) return { success: false, message: "You can only edit your own comments." };

            const trimmed = newText.trim();
            if (trimmed.length < 1) return { success: false, message: "Comment cannot be empty." };
            if (trimmed.length > 500) return { success: false, message: "Comment is too long (max 500)." };

            comment.text = trimmed;
            comment.updatedAt = new Date().toISOString();
            persist();
            return { success: true, comment };
        },

        // Delete a comment (only by its author)
        remove(commentId) {
            const user = userManager.getCurrentUser();
            if (!user) return { success: false, message: "You must be logged in." };

            const comment = comments.find((c) => c.id === commentId);
            if (!comment) return { success: false, message: "Comment not found." };
            if (comment.userId !== user.id) return { success: false, message: "You can only delete your own comments." };

            comments = comments.filter((c) => c.id !== commentId);
            persist();
            return { success: true };
        },

        // Get all comments (sorted newest first)
        getAll() {
            return [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },

        // Count comments
        count() {
            return comments.length;
        },

        // Check if a comment belongs to the current user
        isOwnComment(commentId) {
            const user = userManager.getCurrentUser();
            if (!user) return false;
            const comment = comments.find((c) => c.id === commentId);
            return comment && comment.userId === user.id;
        },
    };
}