module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
  overrides: [
    // @tanstack/query-core v5 uses class private methods (ES2022), which RN 0.73's
    // Metro preset does not transform. Enable the transform ONLY for packages
    // outside RN core — applying it to React Native's own class components (e.g.
    // FlatList) corrupts `this.props` and crashes with
    // "Cannot read property 'getItem' of undefined" (facebook/react-native#36828).
    {
      test: /node_modules[\\/](?!react-native[\\/]|@react-native[\\/]|metro[\\/])/,
      plugins: [['@babel/plugin-transform-private-methods', { loose: true }]],
    },
  ],
};
