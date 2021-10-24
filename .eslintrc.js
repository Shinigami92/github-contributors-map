// @ts-check
const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  ignorePatterns: ['node_modules', 'dist', '.eslintrc.js'],
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:vue-pug-sfc/vue3-recommended',
    '@vue/prettier',
    '@vue/typescript',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: ['./tsconfig.lint.json'],
    warnOnUnsupportedTypeScriptVersion: false
  },
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  rules: {
    'comma-dangle': ['error', 'never'],
    'grouped-accessor-pairs': ['warn', 'getBeforeSet'],
    'linebreak-style': ['error', 'unix'],
    'max-classes-per-file': 'error',
    'max-len': ['warn', { code: 120, ignorePattern: '^import .+ from .+;$', ignoreTemplateLiterals: true }],
    'no-case-declarations': 'warn',
    'no-constant-condition': 'error',
    'no-unused-expressions': 'error',
    'no-useless-concat': 'error',
    'prefer-template': 'error',
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single', { avoidEscape: true }],

    // Cant resolve module.exports = ...
    // https://github.com/benmosher/eslint-plugin-import/issues/1145
    'import/default': 'warn',

    'import/no-unresolved': 'error',

    // Cant resolve types
    // https://github.com/benmosher/eslint-plugin-import/issues/1341
    'import/named': 'off',

    'max-lines': ['warn', 400],

    'id-denylist': [
      'error',
      'any',
      'Number',
      'number',
      'String',
      'string',
      'Boolean',
      'boolean',
      'Undefined',
      'undefined'
    ],

    semi: ['off'],
    '@typescript-eslint/semi': ['error'],
    indent: ['off', 2],
    '@typescript-eslint/indent': ['off', 2],

    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'warn',

    '@typescript-eslint/array-type': ['warn', { default: 'array-simple', readonly: 'generic' }],
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description' }],
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    '@typescript-eslint/explicit-member-accessibility': 'error',
    '@typescript-eslint/lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: true }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/prefer-reduce-type-parameter': 'warn',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/typedef': [
      'warn',
      {
        arrowParameter: false,
        memberVariableDeclaration: true,
        objectDestructuring: false,
        parameter: false,
        propertyDeclaration: true,
        variableDeclaration: true
      }
    ],

    'vue/order-in-components': [
      'warn',
      {
        order: [
          'el',
          'name',
          'key',
          'parent',
          'functional',
          ['delimiters', 'comments'],
          ['components', 'directives', 'filters'],
          'extends',
          'mixins',
          ['provide', 'inject'],
          'layout',
          'middleware',
          'validate',
          'scrollToTop',
          'transition',
          'loading',
          'inheritAttrs',
          ['props', 'propsData'],
          'emits',
          // We prefer model below props/emits
          'model',
          'setup',
          'asyncData',
          'data',
          'fetch',
          'head',
          'computed',
          'watch',
          'watchQuery',
          'LIFECYCLE_HOOKS',
          // We prefer ROUTER_GUARDS below setup
          'ROUTER_GUARDS',
          'methods',
          ['template', 'render'],
          'renderError'
        ]
      }
    ]
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      // use <root>/tsconfig.json
      typescript: {}
    }
  }
});
