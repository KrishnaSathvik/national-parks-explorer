// functions/.eslintrc.js
module.exports = {
    env: {
        node: true,
        es6: true,
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "script",
    },
    extends: ["eslint:recommended", "google"],
    rules: {
        quotes: ["error", "double"],
        "no-unused-vars": ["warn", {varsIgnorePattern: "^[A-Z_]+$"}],
    },
    globals: {
        require: "readonly",
        exports: "readonly",
        module: "readonly",
        process: "readonly",
        __dirname: "readonly",
    },
};
