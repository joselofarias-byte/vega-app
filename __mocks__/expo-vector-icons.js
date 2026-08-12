const React = require('react');
const {Text} = require('react-native');

const Icon = ({children, ...props}) =>
  React.createElement(Text, props, children || null);

module.exports = new Proxy(
  {__esModule: true, default: Icon},
  {
    get(target, property) {
      if (property in target) {
        return target[property];
      }
      return Icon;
    },
  },
);
