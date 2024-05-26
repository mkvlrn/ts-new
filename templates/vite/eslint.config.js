// @ts-check
import eslint from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import * as pluginImport from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginVitest from 'eslint-plugin-vitest';
import eslintTypescript, { parser } from 'typescript-eslint';

export default eslintTypescript.config(
  // base config
  eslint.configs.recommended,

  // typescript-eslint
  ...eslintTypescript.configs.strict,
  ...eslintTypescript.configs.stylistic,
  {
    languageOptions: {
      parserOptions: {
        parser,
        ecmaVersion: 'latest',
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { 'import/resolver': { typescript: {} } },
    rules: {
      // reminds you to remove scattered console statements
      'no-console': 'warn',
    },
  },

  // eslint-plugin-import
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      ...pluginImport.configs.recommended.rules,
      ...pluginImport.configs.typescript.rules,
      ...pluginImport.configs.react.rules,
      // allows for the use of devDependencies in test files
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      // doesn't REQUIRE default exports, which is a silly idea to begin with
      'import/prefer-default-export': 'off',

      /**
       * the 2 rules below are temporarily disabled because
       * they break the flat config support
       */
      // TODO - revisit these rules
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      /**
       * and these 2 are also temporarily disabled
       * because they are throwing false positives
       * again because of the flat config support
       * */
      // TODO - revisit these rules
      'import/default': 'off',
      'import/namespace': 'off',
    },
  },

  // eslint-plugin-react, eslint-plugin-react-hooks, @next/eslint-plugin-next
  {
    files: ['*.jsx', '*.tsx'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    // @ts-expect-error, probably something to do with flat config support
    rules: {
      ...pluginReact.configs['jsx-runtime'].rules,
      ...pluginReactHooks.configs.recommended.rules,
    },
  },

  // eslint-plugin-unicorn
  {
    plugins: {
      unicorn: pluginUnicorn,
    },
    rules: {
      ...pluginUnicorn.configs['flat/recommended'].rules,
      // null is fine
      'unicorn/no-null': 'off',
      // not yet but soon (waiting on nestjs to act right)
      'unicorn/prefer-top-level-await': 'off',
      // some names come from external sources, gotta adapt
      'unicorn/prevent-abbreviations': [
        'error',
        { allowList: { ProcessEnv: true }, ignore: ['next-env'] },
      ],
    },
  },

  // eslint-plugin-vitest
  {
    files: ['*.test.ts', '*.spec.ts', '*.test.tsx', '*.spec.tsx'],
    plugins: {
      vitest: pluginVitest,
    },
    rules: {
      ...pluginVitest.configs.recommended.rules,
    },
  },

  // eslint-config-prettier
  configPrettier,
);
