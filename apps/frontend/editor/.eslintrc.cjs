module.exports = {
  extends: ['../../../.eslintrc.js'],
  ignorePatterns: ['vite.config.ts'],
  env: {
    browser: true,
    es2020: true,
  },
  plugins: ['react', 'react-hooks', 'react-refresh'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // React 17+ doesn't need React in scope
    'react/react-in-jsx-scope': 'off',

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React Refresh (HMR)
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
