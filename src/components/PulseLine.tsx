import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/theme';

type Props = {
  variant?: 'divider' | 'background';
  animated?: boolean;
  style?: ViewStyle;
};

export default function PulseLine({ variant = 'divider', animated = false, style }: Props) {
  const opacity = useRef(new Animated.Value(variant === 'background' ? 0.12 : 1)).current;

  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.22, duration: 1400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.08, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated]);

  const isDivider = variant === 'divider';
  const width = isDivider ? 220 : 260;
  const height = isDivider ? 26 : 56;
  const d = isDivider
    ? 'M0 13 H72 L84 3 L96 23 L108 13 H220'
    : 'M0 28 H90 L104 6 L118 50 L132 28 H260';

  return (
    <Animated.View style={[style, isDivider ? undefined : { opacity }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={d} stroke={colors.coral} strokeWidth={isDivider ? 2.5 : 4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}