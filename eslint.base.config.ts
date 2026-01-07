/// <reference types="node" />
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import markdownPlugin from '@eslint/markdown';
import type { Linter } from 'eslint';
import jsoncPlugin from 'eslint-plugin-jsonc';
import yamlPlugin from 'eslint-plugin-yml';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';
import yamlParser from 'yaml-eslint-parser';

type BaseConfigOptions = {
  baseDirectory?: string;
  tsconfigPaths: string[];
  ignores?: string[];
};

const defaultBaseDirectory = path.dirname(fileURLToPath(import.meta.url));
const tsRules = {
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  'no-restricted-imports': [
    'error',
    {
      patterns: ['../*', '../**/*'],
    },
  ],
} satisfies Linter.RulesRecord;

export const createConfig = ({
  baseDirectory = defaultBaseDirectory,
  tsconfigPaths,
  ignores = [],
}: BaseConfigOptions): Linter.Config[] => {
  const compat = new FlatCompat({ baseDirectory });
  const resolvedTsconfigPaths = tsconfigPaths.map((tsconfigPath) =>
    path.resolve(baseDirectory, tsconfigPath),
  );
  const defaultIgnores = [
    '**/dist/',
    '**/coverage/',
    '**/node_modules/',
    '**/tsconfig.json',
    '**/eslint.config.ts',
    '**/pnpm-lock.yaml',
  ];

  const config = [
    // Base
    {
      ignores: [...defaultIgnores, ...ignores],
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
          project: resolvedTsconfigPaths,
          sourceType: 'module',
          tsconfigRootDir: baseDirectory,
          ecmaVersion: 2023,
        },
        globals: {
          ...globals.node,
        },
      },

      rules: tsRules,
      settings: {
        'import/resolver': {
          typescript: {
            project: resolvedTsconfigPaths,
          },
        },
      },
    })),

    // JSON / JSONC
    {
      files: ['**/*.json', '**/*.jsonc'],
      languageOptions: { parser: jsoncParser },
      plugins: { jsonc: jsoncPlugin },
      rules: {
        ...(jsoncPlugin.configs['recommended-with-jsonc'].rules as Linter.RulesRecord),
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
        ...(yamlPlugin.configs.standard.rules as Linter.RulesRecord),
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
  ] as Linter.Config[];

  return config;
};
