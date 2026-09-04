import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      'coverage/**',
      // Gerado pelo Expo, não é fonte do projeto.
      'expo-env.d.ts',
    ],
  },

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },

  {
    files: ['**/*.tsx'],
    // `recommended-latest` ainda declara `plugins` como array (formato eslintrc);
    // só o preset `flat` é aceito pelo ESLint 10.
    ...reactHooks.configs.flat.recommended,
  },

  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: globals.jest,
    },
  },

  {
    // Arquivos de config ficam fora do tsconfig, então o serviço de tipos não os
    // enxerga: lintar com regras tipadas aqui daria erro de parsing.
    files: ['eslint.config.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ['babel.config.js', 'jest.config.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
);
