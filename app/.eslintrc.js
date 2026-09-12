module.exports = {
  root: true,
  extends: '@react-native',
  parserOptions: {
    requireConfigFile: false,
  },
  overrides: [
    {
      files: ['__tests__/**/*'],
      env: { jest: true },
    },
  ],
  rules: {
    'prettier/prettier': 'warn',
    'react-native/no-inline-styles': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-unused-vars': 'warn',
    curly: 'warn',
    quotes: 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'no-useless-escape': 'off',
  },
  env: {
    jest: true,
  },
};
