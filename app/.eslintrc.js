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
    'prettier/prettier': 'off',
    'react-native/no-inline-styles': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    curly: 'off',
    quotes: 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-useless-escape': 'off',
  },
  env: {
    jest: true,
  },
};
