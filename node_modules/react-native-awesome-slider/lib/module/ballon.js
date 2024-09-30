import React, { useImperativeHandle, useRef, memo } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { palette } from './theme/palette';
const BUBBLE_STYLE = {
  padding: 2,
  paddingHorizontal: 4,
  borderRadius: 5
};

/**
 * a component to show text inside a bubble
 */

export const BubbleComponent = /*#__PURE__*/React.forwardRef(({
  containerStyle,
  color = palette.Main,
  textStyle,
  textColor = palette.White,
  bubbleMaxWidth
}, ref) => {
  const textRef = useRef(null);
  useImperativeHandle(ref, () => ({
    setText: text => {
      textRef.current?.setNativeProps({
        text
      });
    }
  }));
  return /*#__PURE__*/React.createElement(Animated.View, {
    style: [styles.view, containerStyle]
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: {
      ...BUBBLE_STYLE,
      backgroundColor: color,
      maxWidth: bubbleMaxWidth
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    ref: textRef,
    textAlign: "center",
    style: [styles.textStyle, {
      color: textColor
    }, textStyle],
    defaultValue: "",
    caretHidden: true
  })), /*#__PURE__*/React.createElement(View, {
    style: [styles.triangle, {
      borderTopColor: color
    }]
  }));
});
export const Bubble = /*#__PURE__*/memo(BubbleComponent);
const styles = StyleSheet.create({
  triangle: {
    width: 10,
    height: 10,
    borderWidth: 5,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    flexDirection: 'row'
  },
  textStyle: {
    fontSize: 12,
    paddingVertical: 0
  },
  view: {
    alignItems: 'center'
  }
});
//# sourceMappingURL=ballon.js.map