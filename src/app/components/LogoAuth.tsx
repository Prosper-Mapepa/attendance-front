'use client';

import React from 'react';

interface LogoProps {
  size?: number;
  variant?: 'dark' | 'light' | 'color' | 'simple';
  showText?: boolean;
  className?: string;
}

export default function LogoAuth({ 
  size = 48, 
  variant = 'color',
  showText = true,
  className = ''
}: LogoProps) {
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
    },
    simple: {
      checkmark: '#8B0000', // Gold checkmark only
    }
  };

  // Simple variant - logo-style gold checkmark with border (matches mobile)
  if (variant === 'simple') {
    const simpleColor = colors.simple;
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
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            {/* Outer ring for depth */}
            <circle
              cx="0"
              cy="0"
              r={size * 0.48}
              stroke={simpleColor.checkmark}
              strokeWidth="1.5"
              fill="none"
              opacity="0.3"
            />
            {/* Main border circle */}
            <circle
              cx="0"
              cy="0"
              r={size * 0.42}
              stroke={simpleColor.checkmark}
              strokeWidth={size * 0.04}
              fill="none"
            />
            {/* Inner accent circle */}
            <circle
              cx="0"
              cy="0"
              r={size * 0.36}
              stroke={simpleColor.checkmark}
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            {/* Checkmark */}
            <path
              d={`M ${-size * 0.18} 0 L ${-size * 0.07} ${size * 0.12} L ${size * 0.18} ${-size * 0.12}`}
              stroke={simpleColor.checkmark}
              strokeWidth={size * 0.08}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          {/* Text "AttendIQ" */}
          {showText && (
            <text
              x={size + size * 0.3}
              y={size * 0.62}
              fill="#1F2937"
              fontSize={size * 0.45}
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              Attend
              <tspan fill="#8B0000" fontWeight="800">IQ</tspan>
            </text>
          )}
        </svg>
      </div>
    );
  }

  // For non-simple variants
  const color = colors[variant] as { primary: string; secondary: string; checkmark: string };
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
        <g>
          {/* Outer glow circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.45}
            fill={color.primary}
            opacity="0.1"
          />
          
          {/* Main circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.35}
            fill={color.primary}
          />
          
          {/* Checkmark */}
          <path
            d={`M ${size * 0.32} ${size * 0.5} L ${size * 0.43} ${size * 0.62} L ${size * 0.68} ${size * 0.38}`}
            stroke={color.checkmark}
            strokeWidth={size * 0.06}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Text "AttendIQ" */}
        {showText && (
          <text
            x={size + size * 0.3}
            y={size * 0.62}
            fill={variant === 'light' ? '#FFFFFF' : '#1F2937'}
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

