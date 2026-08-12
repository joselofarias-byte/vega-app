const ReactNative = require('react-native');

const identity = value => value;
const easingIdentity = value => value;

const Easing = {
  linear: easingIdentity,
  ease: easingIdentity,
  quad: easingIdentity,
  cubic: easingIdentity,
  sin: easingIdentity,
  circle: easingIdentity,
  exp: easingIdentity,
  bounce: easingIdentity,
  poly: () => easingIdentity,
  bezier: () => easingIdentity,
  in: fn => fn || easingIdentity,
  out: fn => fn || easingIdentity,
  inOut: fn => fn || easingIdentity,
};

const createAnimatedComponent = Component => Component;
const useSharedValue = value => ({value});
const useDerivedValue = updater => ({value: updater()});
const useAnimatedProps = updater => updater();
const useAnimatedStyle = updater => updater();
const withTiming = value => value;
const withSpring = value => value;
const withDelay = (_delay, animation) => animation;
const withSequence = (...animations) => animations.at(-1);
const withRepeat = animation => animation;
const runOnJS = fn => fn;
const runOnUI = fn => fn;
const cancelAnimation = () => {};

const interpolate = (value, inputRange, outputRange) => {
  if (!Array.isArray(inputRange) || !Array.isArray(outputRange) || !inputRange.length) {
    return value;
  }
  if (value <= inputRange[0]) {
    return outputRange[0];
  }
  const last = inputRange.length - 1;
  if (value >= inputRange[last]) {
    return outputRange[Math.min(last, outputRange.length - 1)];
  }
  for (let i = 1; i < inputRange.length; i += 1) {
    if (value <= inputRange[i]) {
      const startIn = inputRange[i - 1];
      const endIn = inputRange[i];
      const startOut = outputRange[i - 1];
      const endOut = outputRange[i];
      if (typeof startOut !== 'number' || typeof endOut !== 'number') {
        return startOut;
      }
      const progress = (value - startIn) / (endIn - startIn || 1);
      return startOut + (endOut - startOut) * progress;
    }
  }
  return outputRange[0];
};

const Extrapolation = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
};

const Animated = {
  ...ReactNative.Animated,
  createAnimatedComponent,
  View: ReactNative.Animated.View,
  Text: ReactNative.Animated.Text,
  Image: ReactNative.Animated.Image,
  ScrollView: ReactNative.Animated.ScrollView,
};

const api = {
  __esModule: true,
  default: Animated,
  Easing,
  Extrapolation,
  createAnimatedComponent,
  useSharedValue,
  useDerivedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  runOnUI,
  cancelAnimation,
  interpolate,
  interpolateColor: (_value, _inputRange, outputRange) =>
    Array.isArray(outputRange) ? outputRange[0] : outputRange,
  measure: () => null,
  scrollTo: () => {},
  setUpTests: () => {},
};

module.exports = new Proxy(api, {
  get(target, property) {
    if (property in target) {
      return target[property];
    }
    return identity;
  },
});
