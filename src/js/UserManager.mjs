import { getLocalStorage, setLocalStorage } from "./utils.mjs";

// Manages user registration and login
export function createUserManager() {
    const USERS_KEY = "house-recipe-users";
    const SESSION_KEY = "house-recipe-session";

    // Private methods to interact with localStorage
    // Get users from localStorage
    function getUsers() {
        return getLocalStorage(USERS_KEY) || [];
    }

    // Save users to localStorage
    function saveUsers(users) {
        setLocalStorage(USERS_KEY, users);
    }

    // Get session from localStorage
    function getSession() {
        return getLocalStorage(SESSION_KEY);
    }

    // Save session to localStorage
    function saveSession(user) {
        setLocalStorage(SESSION_KEY, user);
    }

    // Clear session
    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    return {
        // Register a new user
        register({ name, username, email, password, avatar }) {
            if (!name || !username || !email || !password) {
                return { success: false, message: "All fields are required." };
            }

            const users = getUsers();

            // Verify email duplicade
            const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
            if (emailExists) {
                return { success: false, message: "Email already registered." };
            }

            // Verify username duplicade
            const usernameExists = users.some(
                (u) => u.username.toLowerCase() === username.toLowerCase()
            );
            if (usernameExists) {
                return {
                    success: false,
                    message: "Username already taken. Please choose another.",
                };
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name: name.trim(),
                username: username.toLowerCase().trim(),
                email: email.toLowerCase().trim(),
                password,
                avatar: avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Default",
                createdAt: new Date().toISOString(),
            };

            users.push(newUser);
            saveUsers(users);

            return { success: true, message: "Account created!", user: newUser };
        },

        // Login a user with email and password
        login(identifier, password) {
            const users = getUsers();
            const normalizedIdentifier = identifier.toLowerCase().trim();

            const user = users.find(
                (u) =>
                    (u.email.toLowerCase() === normalizedIdentifier ||
                        u.username?.toLowerCase() === normalizedIdentifier) &&
                    u.password === password
            );

            // If user not found
            if (!user) {
                return { success: false, message: "Invalid email or password." };
            }

            saveSession(user);
            return { success: true, message: "Welcome back!", user };
        },

        // Closes the session
        logout() {
            clearSession();
        },

        // Returns the current user
        getCurrentUser() {
            return getSession();
        },

        // Verify if a user is logged in
        isLoggedIn() {
            return !!getSession();
        },

        // Update user profile (name, email, password)
        updateProfile(updates) {
            const current = getSession();
            if (!current) {
                return { success: false, message: "You must be logged in." };
            }

            const users = getUsers();
            const index = users.findIndex((u) => u.id === current.id);
            if (index === -1) {
                return { success: false, message: "User not found." };
            }

            // Verificar email duplicado
            if (
                updates.email &&
                updates.email.toLowerCase() !== current.email.toLowerCase() &&
                users.some(
                    (u) =>
                        u.id !== current.id && u.email.toLowerCase() === updates.email.toLowerCase()
                )
            ) {
                return { success: false, message: "Email already in use." };
            }

            // Verify username duplicade
            if (
                updates.username &&
                updates.username.toLowerCase() !== current.username?.toLowerCase() &&
                users.some(
                    (u) =>
                        u.id !== current.id &&
                        u.username?.toLowerCase() === updates.username.toLowerCase()
                )
            ) {
                return { success: false, message: "Username already taken." };
            }

            // Update user
            const updatedUser = {
                ...users[index],
                ...updates,
                // Asegurar que username se guarde en minúsculas
                username: updates.username
                    ? updates.username.toLowerCase().trim()
                    : users[index].username,
                id: users[index].id,
                createdAt: users[index].createdAt,
            };

            users[index] = updatedUser;
            saveUsers(users);
            saveSession(updatedUser);

            return { success: true, message: "Profile updated!", user: updatedUser };
        },

        // Returns all users
        getAllUsers() {
            return getUsers();
        },
    };
}
