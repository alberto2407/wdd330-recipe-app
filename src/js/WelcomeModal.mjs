// src/js/WelcomeModal.mjs
import { qs, getLocalStorage, setLocalStorage } from "./utils.mjs";

const STORAGE_KEY = "house-recipe-welcome-seen";

// Function to initialize the welcome modal
export function initWelcomeModal() {
    const modal = qs("#welcome-modal");
    if (!modal) return;

    // Verify if the user has already seen the modal
    const hasSeen = getLocalStorage(STORAGE_KEY);

    if (hasSeen) {
        // If the user has already seen the modal, hide it
        return;
    }

    // Show the modal
    modal.classList.remove("hide");

    // Function to close the modal
    const closeModal = () => {
        modal.classList.add("hide");
        setLocalStorage(STORAGE_KEY, true);
    };

    // Close with the close button
    const closeBtn = qs("#close-welcome-modal");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    // Close with the "No, thanks" button
    const noThanksBtn = qs("#no-thanks-btn");
    if (noThanksBtn) {
        noThanksBtn.addEventListener("click", closeModal);
    }

    // If the user wants to register instead of logging in or signing up directly
    const registerBtn = qs("#welcome-register-btn");
    if (registerBtn) {
        registerBtn.addEventListener("click", closeModal);
    }

    // Close the modal when clicking outside
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close the modal when pressing the escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hide")) {
            closeModal();
        }
    });
}
