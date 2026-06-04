import { useRef, type ReactNode } from 'react';
import { Animated, PanResponder, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

const MAX_TILT = 22;

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Inclinaison 3D au doigt — équivalent du `rotateX` / `rotateY` au survol sur le site (`CardDetailModal`).
 */
export function TiltableCard({ children, style }: Props) {
  const layout = useRef({ w: 1, h: 1 });
  const rx = useRef(new Animated.Value(0)).current;
  const ry = useRef(new Animated.Value(0)).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    layout.current = { w: width || 1, h: height || 1 };
  };

  const reset = () => {
    Animated.parallel([
      Animated.spring(rx, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
      Animated.spring(ry, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
    ]).start();
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const { w, h } = layout.current;
        const nx = (locationX / w - 0.5) * 2;
        const ny = (locationY / h - 0.5) * 2;
        rx.setValue(-ny * MAX_TILT);
        ry.setValue(nx * MAX_TILT);
      },
      onPanResponderRelease: reset,
      onPanResponderTerminate: reset,
    }),
  ).current;

  const tiltX = rx.interpolate({
    inputRange: [-MAX_TILT, MAX_TILT],
    outputRange: [`-${MAX_TILT}deg`, `${MAX_TILT}deg`],
  });
  const tiltY = ry.interpolate({
    inputRange: [-MAX_TILT, MAX_TILT],
    outputRange: [`-${MAX_TILT}deg`, `${MAX_TILT}deg`],
  });

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        style,
        {
          transform: [{ perspective: 1400 }, { rotateX: tiltX }, { rotateY: tiltY }],
        },
      ]}
      {...pan.panHandlers}
    >
      {children}
    </Animated.View>
  );
}
