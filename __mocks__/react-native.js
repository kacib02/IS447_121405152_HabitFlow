const React = require('react');

const View = ({ children }) => React.createElement(React.Fragment, null, children);
const Text = ({ children, ...props }) => React.createElement('text', props, children);
const TextInput = ({ placeholder, value, onChangeText, ...props }) =>
  React.createElement('input', { placeholder, value, onChange: onChangeText, ...props });
const Pressable = ({ children, onPress, ...props }) =>
  React.createElement('button', { onClick: onPress, ...props }, children);
const ScrollView = ({ children }) => React.createElement(React.Fragment, null, children);
const Alert = { alert: jest.fn() };
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
    if (!style) return {};
    if (Array.isArray(style)) return Object.assign({}, ...style.map(StyleSheet.flatten));
    return style;
  },
};

module.exports = { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet };