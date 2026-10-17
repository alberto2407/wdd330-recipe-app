# BYU-Pathway Worldwide Online

## WDD 330 - Web Frontend Development II

###  House Recipe

A web application that helps you to find recipes based on the ingredients you already have at home.
Built as a final project for **WDD 330 – Web Frontend Development II** at BYU-Idaho.

🔗 **Live Demo:** https://wdd330-recipe-app.onrender.com

---

## Features

- 🔍 **Search recipes by ingredients** — Add what's in your kitchen and get recipe ideas instantly.
- 🔎 **Search by name** — Find recipes by title.
- 🎲 **Surprise Me** — Get a random recipe suggestion.
- 📄 **Recipe detail page** — Full page view with ingredients, instructions, and embedded YouTube video.
- 🛒 **Shopping List** — Add recipes and track ingredients to buy. Check them off as you go.
- 🕒 **Recipe History** — See the last recipes you viewed, with "previous/next" navigation and "still to buy" status.
- 📊 **Your Activity** — Track how many times you've visited and when was your last visit.
- 👤 **User accounts** — Register, login with email or username, and edit your profile.
- ❤️ **Favorites** — Save recipes per user with persistent storage.
- 🌙 **Dark Mode** — Toggle between light and dark themes, saved per user.
- 🥗 **Dietary Preferences** — Filter recipes by vegetarian, vegan, gluten-free, keto, paleo, low-carb, dairy-free, and pescatarian.
- 🔗 **Shareable recipe links** — Every recipe has its own URL (`/recipe/?id={id}`).
- 🎨 **Custom avatars** — Powered by DiceBear.
- 🎉 **Welcome modal** — Shown only on the first visit.
- 📱 **Responsive design** — Works on mobile, tablet, and desktop.

---

## Tech Stack

- [Vite](https://vitejs.dev/) — Build tool and dev server
- [SCSS](https://sass-lang.com/) — Styling with nesting and variables
- Vanilla JavaScript (ES Modules) — Application logic
- [TheMealDB API](https://www.themealdb.com/api.php) — Recipe data
- [DiceBear API](https://www.dicebear.com/) — Avatar generation
- localStorage — Client-side persistence per user
- ESLint + Prettier — Code quality and formatting
- [Render](https://render.com/) — Deployment

## Prerequisites

- You must have Node installed to run the following commands.

## Common Workflow Commands

- `npm run lint` to run ESLint against your code to find errors.
- `npm run format` to run Prettier to automatically format your code.
- `npm run dev` starts up a local server and updates on any JS or CSS/SCSS
- `npm run build` to build final files when you are ready to turn in.