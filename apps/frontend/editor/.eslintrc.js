module.exports = {
  extends: ['../../.eslintrc.js'],
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
    // React 17+ doesn't need React in scope
    'react/react-in-jsx-scope': 'off',

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React Refresh (HMR)
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    // React best practices
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
