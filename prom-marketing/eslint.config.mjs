import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Bulgarian typographic quotes („…“) са нарочно съдържание, не грешка.
      "react/no-unescaped-entities": "off",
      // React Compiler правила (нови в eslint-config-next) — кодовата база е
      // отпреди тях и дава фалшиви положителни (SSR localStorage в useEffect,
      // Date.now() в server компоненти). Държим ги като warning, не блокер.
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
