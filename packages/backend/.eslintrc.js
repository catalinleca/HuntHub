module.exports = {
  extends: ['../../.eslintrc.js'], // ← Changed from relative path
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', '**/*.js'],
};
