module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@expo/.*|expo(?:-.*)?|react-native-image-colors|react-native-markdown-display)/)',
  ],
  moduleNameMapper: {
    '^@expo/ui/jetpack-compose$':
      '<rootDir>/__mocks__/expo-ui-jetpack-compose.js',
    '^@expo/ui/jetpack-compose/modifiers$':
      '<rootDir>/__mocks__/expo-ui-jetpack-compose-modifiers.js',
    '^@expo/vector-icons(?:/.*)?$': '<rootDir>/__mocks__/expo-vector-icons.js',
    '\\.(css|less|scss|sass)$':
      '<rootDir>/__mocks__/expo-ui-jetpack-compose-modifiers.js',
  },
};
