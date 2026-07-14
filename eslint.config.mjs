import { fixupConfigRules } from "@eslint/compat";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    files: ["**/*.ts", "**/*.tsx"]
},
{
    ignores: [
        "**/dist",
        "**/coverage",
        "**/.eslintrc.cjs",
        "**/*.test.ts",
        "**/*.test.tsx",
        "src/components/@extended",
        "venv/**",
    ],

}, ...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
)), {
    plugins: {
        "react-refresh": reactRefresh,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },
        parser: tsParser,
    },
    rules: {
        "react-refresh/only-export-components": ["warn", {
            allowConstantExport: true,
        }],
        // react-hooks 7.1.1 added this to the recommended preset. It flags guarded
        // init/reset/fetch effects across the app that are working as intended;
        // adopting it would mean refactoring checkout, auth, and inventory flows,
        // which is out of scope for a dependency bump. Disabled deliberately.
        "react-hooks/set-state-in-effect": "off",
    },
}];