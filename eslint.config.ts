// eslint.config.js
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import markdownPlugin from '@eslint/markdown';
import jsoncPlugin from 'eslint-plugin-jsonc';
import yamlPlugin from 'eslint-plugin-yml';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';
import tseslint from 'typescript-eslint';
import yamlParser from 'yaml-eslint-parser';

const compat = new FlatCompat();

export default [
  // Base
  {
    ignores: [
      'dist/',
      'coverage/',
      'node_modules/',
      'src/kaboom/proto/**/*.ts',
      'tsconfig.json',
      'eslint.config.ts',
    ],
  },

  // JS defaults
  js.configs.recommended,

  // TypeScript (applies to .ts/.tsx and script blocks)
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2023,
      },
      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../*', '../**/*'],
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
  })),

  // JSON / JSONC
  {
    files: ['**/*.json', '**/*.jsonc'],
    languageOptions: { parser: jsoncParser },
    plugins: { jsonc: jsoncPlugin },
    rules: {
      ...jsoncPlugin.configs['recommended-with-jsonc'].rules,
    },
  },

  // YAML
  {
    files: ['**/*.yml', '**/*.yaml'],
    plugins: { yml: yamlPlugin },
    languageOptions: {
      parser: yamlParser,
    },
    rules: {
      ...yamlPlugin.configs.standard.rules,
    },
  },

  // Markdown (code blocks get linted)
  {
    files: ['**/*.md'],
    plugins: { markdown: markdownPlugin },
    processor: markdownPlugin.processors.markdown,
  },

  // Import rules (works with TS resolver)
  ...compat.extends('plugin:import/recommended'),

  // Turn off ESLint rules that conflict with Prettier
  ...compat.extends('prettier'),
];
