module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation/.*|@expo/.*|expo(?:-.*)?|react-native-image-colors|react-native-markdown-display)/)',
  ],
  moduleNameMapper: {
    '^@expo/ui/jetpack-compose$':
      '<rootDir>/__mocks__/expo-ui-jetpack-compose.js',
    '^@expo/ui/jetpack-compose/modifiers$':
      '<rootDir>/__mocks__/expo-ui-jetpack-compose-modifiers.js',
    '^@expo/vector-icons(?:/.*)?$': '<rootDir>/__mocks__/expo-vector-icons.js',
    '^react-native-mmkv-storage$':
      '<rootDir>/__mocks__/react-native-mmkv-storage.js',
    '^react-native-linear-gradient$':
      '<rootDir>/__mocks__/react-native-linear-gradient.js',
    '\\.(css|less|scss|sass)$':
      '<rootDir>/__mocks__/expo-ui-jetpack-compose-modifiers.js',
  },
};
