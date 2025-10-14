'use client';

import React from 'react';

interface LogoProps {
  size?: number;
  variant?: 'dark' | 'light' | 'color';
  showText?: boolean;
  className?: string;
}

export default function Logo({ 
  size = 48, 
  variant = 'color',
  showText = true,
  className = ''
}: LogoProps) {
  const colors = {
    dark: {
      primary: '#8F1A27', // Deep Red
      secondary: '#1F2937', // Dark Gray
      text: '#1F2937',
    },
    light: {
      primary: '#FFFFFF',
      secondary: '#F3F4F6',
      text: '#FFFFFF',
    },
    color: {
      primary: '#8F1A27', // Deep Red
      secondary: '#FDB913', // CMU Gold
      text: '#1F2937',
    }
  };

  const color = colors[variant];
  const textWidth = showText ? size * 2.5 : 0;
  const totalWidth = size + textWidth + (showText ? size * 0.3 : 0);

  return (
    <div className={`inline-flex items-center ${className}`} style={{ height: size }}>
      <svg
        width={totalWidth}
        height={size}
        viewBox={`0 0 ${totalWidth} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Logo Icon - Checkmark with IQ brain elements */}
        <g>
          {/* Outer Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill={color.primary}
            opacity="0.1"
          />
          
          {/* Main Circle Background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2.5}
            fill={color.primary}
          />
          
          {/* Checkmark */}
          <path
            d={`M ${size * 0.32} ${size * 0.5} L ${size * 0.43} ${size * 0.62} L ${size * 0.68} ${size * 0.38}`}
            stroke={variant === 'dark' ? color.secondary : '#FFFFFF'}
            strokeWidth={size * 0.08}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Text "AttendIQ" */}
        {showText && (
          <text
            x={size + size * 0.3}
            y={size * 0.62}
            fill={color.text}
            fontSize={size * 0.45}
            fontWeight="700"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Attend
            <tspan fill={color.primary} fontWeight="800">IQ</tspan>
          </text>
        )}
      </svg>
    </div>
  );
}

// Export a variant specifically for use as app icon/favicon
export function LogoIcon({ size = 512 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="512" height="512" fill="#FFFFFF" rx="64"/>
      
      {/* Outer glow circle */}
      <circle
        cx="256"
        cy="256"
        r="200"
        fill="#8F1A27"
        opacity="0.08"
      />
      
      {/* Main circle */}
      <circle
        cx="256"
        cy="256"
        r="160"
        fill="#8F1A27"
      />
      
      {/* Checkmark */}
      <path
        d="M 180 256 L 225 305 L 345 185"
        stroke="#FFFFFF"
        strokeWidth="35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

