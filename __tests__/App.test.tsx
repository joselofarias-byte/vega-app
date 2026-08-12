/**
 * @format
 */

jest.mock('react-native-image-colors', () => ({
  cache: {removeItem: jest.fn()},
  getColors: jest.fn(async () => ({
    platform: 'android',
    lightVibrant: '#FFFFFF',
    vibrant: '#FFFFFF',
    dominant: '#FFFFFF',
    average: '#FFFFFF',
    darkVibrant: '#FFFFFF',
  })),
}));

import 'react-native';
import React from 'react';
import App from '../src/App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<App />);
});
