const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const path = require('path')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  {
    ignores: ['build/**', 'node_modules/**', 'coverage/**'],
  },
  ...compat.config({
    extends: [
      'eslint:recommended',
      'react-app',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/typescript',
      'plugin:prettier/recommended',
      'plugin:testing-library/react',
      'plugin:jest-dom/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    plugins: [
      '@typescript-eslint',
      'react',
      'react-hooks',
      'prettier',
      'testing-library',
      'jest-dom',
    ],
    rules: {
      // Disable flowtype rules
      'flowtype/define-flow-type': 'off',
      'flowtype/no-types-missing-file-annotation': 'off',
      'flowtype/use-flow-type': 'off',
      // Disable type-aware TypeScript rules that require parserServices
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-for-in-array': 'off',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-readonly': 'off',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      // Keep existing rules
      camelcase: 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      'react/prop-types': 'warn',
    },
    settings: {
      'import/resolver': {
        node: {
          moduleDirectory: ['node_modules', 'src/'],
          paths: ['src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      react: {
        version: 'detect',
      },
    },
    env: {
      browser: true,
      es6: true,
      jest: true,
    },
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
  }),
]
