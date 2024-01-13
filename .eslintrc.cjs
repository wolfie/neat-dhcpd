/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:functional/no-exceptions',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'functional'],
  root: true,
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@neat-dhcpd/db',
            message: 'Only import types',
            allowTypeImports: true,
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['*.test.ts'],
      rules: { 'functional/no-throw-statements': 0 },
    },
  ],
  ignorePatterns: ['build', '*.js', '*.cjs'],
};
