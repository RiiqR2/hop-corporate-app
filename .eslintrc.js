module.exports = {
  extends: ['expo'],
  ignorePatterns: ['/dist/*'],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
      },
    ],
  "@typescript-eslint/no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }],
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "unknown"
        ],
        "pathGroups": [
          {
            "pattern": "@/global.css",
            "group": "internal",
            "position": "before"
          },
          {
            "pattern": "@/components/**",
            "group": "internal",
            "position": "before"
          },
          {
            "pattern": "@/context/**",
            "group": "internal",
            "position": "before"
          },
          {
            "pattern": "@/utils/**",
            "group": "internal",
            "position": "before"
          },
          {
            "pattern": "@/services/**",
            "group": "internal",
            "position": "before"
          },
          {
            "pattern": "expo-router",
            "group": "external",
            "position": "after"
          },
          {
            "pattern": "react-native",
            "group": "builtin",
            "position": "before"
          }
        ],
        "pathGroupsExcludedImportTypes": ["builtin"],
        "newlines-between": "never",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    "import/no-duplicates": "error",
    "semi": ["error", "always"],
    "no-console": "error",
    'no-warning-comments': ['error', { terms: ['todo', 'fixme', 'xxx'], location: 'anywhere' }],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
