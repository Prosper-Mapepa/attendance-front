import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';

interface LogoProps {
  size?: number;
  variant?: 'dark' | 'light' | 'color';
}

export default function Logo({ size = 48, variant = 'color' }: LogoProps) {
  const colors = {
    dark: {
      primary: '#8B0000', // Deep Red
      secondary: '#1F2937',
      checkmark: '#FFFFFF',
    },
    light: {
      primary: '#FFFFFF',
      secondary: '#F3F4F6',
      checkmark: '#8F1A27',
    },
    color: {
      primary: '#8B0000', // Deep Red
      secondary: '#FDB913', // CMU Gold
      checkmark: '#FFFFFF',
    }
  };

  const color = colors[variant];

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer glow circle */}
        <Circle
          cx="50"
          cy="50"
          r="45"
          fill={color.primary}
          opacity="0.1"
        />
        
        {/* Main circle */}
        <Circle
          cx="50"
          cy="50"
          r="35"
          fill={color.primary}
        />
        
        {/* Checkmark */}
        <Path
          d="M 32 50 L 43 62 L 68 38"
          stroke={color.checkmark}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

