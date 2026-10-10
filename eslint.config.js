import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import prettierConfig from "eslint-config-prettier";

export default [
    {
        ignores: ["dist/**", "node_modules/**", ".vite/**", "*.min.js", "*.min.css"],
    },

    js.configs.recommended,

    {
        files: ["src/**/*.{js,mjs}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
        },
        plugins: {
            import: importPlugin,
        },
        rules: {
            "no-unused-vars": [
                1,
                {
                    argsIgnorePattern: "^_",
                },
            ],
            "arrow-body-style": [2, "as-needed"],
            "no-param-reassign": [
                2,
                {
                    props: false,
                },
            ],
            "no-console": [
                "warn",
                {
                    allow: ["warn", "error"],
                },
            ],
            quotes: [
                "error",
                "double",
                {
                    allowTemplateLiterals: true,
                },
            ],
            "func-names": 0,
            "space-unary-ops": 2,
            "space-in-parens": "error",
            "space-infix-ops": "error",
            "comma-dangle": 0,
            "max-len": 0,
            "import/extensions": 0,
            "no-underscore-dangle": 0,
            "consistent-return": 0,
            radix: 0,
            "no-shadow": [
                2,
                {
                    hoist: "all",
                    allow: ["resolve", "reject", "done", "next", "err", "error"],
                },
            ],
            "no-unused-expressions": "off",
        },
    },

    prettierConfig,
];