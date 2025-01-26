module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'eslint:recommended', // Uses the recommended rules from ESLint
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
    'prettier', // Disables ESLint rules that conflict with Prettier
  ],
  plugins: [
    '@typescript-eslint', // Adds TypeScript-specific rules
    'prettier', // Integrates Prettier with ESLint
  ],
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  env: {
    node: true, // Enable Node.js global variables and scoping
    es2020: true, // Enable ES2020 global variables
  },
  rules: {
    'prettier/prettier': 'error', // Enforce Prettier formatting as errors
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_' }, // Ignore unused variables starting with _
    ],
    '@typescript-eslint/no-require-imports': 'off',
  },
  ignorePatterns: [
    'node_modules/', // Ignore node_modules directory
    'dist/', // Ignore dist directory
    'package-lock.json', // Ignore package-lock.json
  ],
};
