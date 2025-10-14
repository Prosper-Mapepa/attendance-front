'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedEyesProps {
  size?: number;
  className?: string;
}

export default function AnimatedEyes({ size = 24, className = '' }: AnimatedEyesProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [leftPupilX, setLeftPupilX] = useState(12);
  const [rightPupilX, setRightPupilX] = useState(12);
  const [pupilColor, setPupilColor] = useState('#8B0000'); // CMU Maroon as default

  useEffect(() => {
    // Random blinking
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 3000 + 2000);

    // Pupil movement
    const pupilInterval = setInterval(() => {
      setLeftPupilX(8 + Math.random() * 8);
      setRightPupilX(8 + Math.random() * 8);
    }, Math.random() * 2000 + 1000);

    // Color cycling for pupils
    const colorInterval = setInterval(() => {
      const colors = [
        '#8B0000', // CMU Maroon
        '#FFD700', // CMU Gold
        // '#4A90E2', // Blue
        // '#50C878', // Green
        '#FF6B6B', // Coral
        // '#9B59B6', // Purple
        '#FF8C00', // Orange
      ];
      setPupilColor(colors[Math.floor(Math.random() * colors.length)]);
    }, Math.random() * 4000 + 3000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(pupilInterval);
      clearInterval(colorInterval);
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: size * 2, height: size }}>
      {/* Left Eye */}
      <div className="absolute left-0 top-0">
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="transition-all duration-300"
        >
          {/* Eye outline */}
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry={isBlinking ? "1" : "6"}
            fill="white"
            stroke="currentColor"
            strokeWidth="1.5"
            className="transition-all duration-150"
          />
          {/* Pupil - only show when not blinking */}
          {!isBlinking && (
            <>
              <defs>
                <radialGradient id={`leftPupilGradient-${size}`} cx="30%" cy="30%">
                  <stop offset="0%" stopColor={pupilColor} />
                  <stop offset="70%" stopColor={pupilColor} />
                  <stop offset="100%" stopColor="#000000" />
                </radialGradient>
              </defs>
              <circle
                cx={leftPupilX}
                cy="12"
                r="3"
                fill={`url(#leftPupilGradient-${size})`}
                className="transition-all duration-500"
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
                }}
              />
              {/* Eye shine */}
              <circle
                cx={leftPupilX + 1}
                cy="10"
                r="1"
                fill="white"
                className="animate-pulse"
                style={{
                  animationDuration: '2s',
                  animationDelay: '0.5s'
                }}
              />
              {/* Additional shine for depth */}
              <circle
                cx={leftPupilX + 0.5}
                cy="11"
                r="0.5"
                fill="rgba(255,255,255,0.6)"
                className="animate-pulse"
                style={{
                  animationDuration: '3s',
                  animationDelay: '1s'
                }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Right Eye */}
      <div className="absolute right-0 top-0">
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="transition-all duration-300"
          style={{
            animationDelay: '0.1s'
          }}
        >
          {/* Eye outline */}
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry={isBlinking ? "1" : "6"}
            fill="white"
            stroke="currentColor"
            strokeWidth="1.5"
            className="transition-all duration-150"
          />
          {/* Pupil - only show when not blinking */}
          {!isBlinking && (
            <>
              <defs>
                <radialGradient id={`rightPupilGradient-${size}`} cx="30%" cy="30%">
                  <stop offset="0%" stopColor={pupilColor} />
                  <stop offset="70%" stopColor={pupilColor} />
                  <stop offset="100%" stopColor="#000000" />
                </radialGradient>
              </defs>
              <circle
                cx={rightPupilX}
                cy="12"
                r="3"
                fill={`url(#rightPupilGradient-${size})`}
                className="transition-all duration-500"
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
                }}
              />
              {/* Eye shine */}
              <circle
                cx={rightPupilX + 1}
                cy="10"
                r="1"
                fill="white"
                className="animate-pulse"
                style={{
                  animationDuration: '2s',
                  animationDelay: '0.8s'
                }}
              />
              {/* Additional shine for depth */}
              <circle
                cx={rightPupilX + 0.5}
                cy="11"
                r="0.5"
                fill="rgba(255,255,255,0.6)"
                className="animate-pulse"
                style={{
                  animationDuration: '3s',
                  animationDelay: '1.3s'
                }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Colorful glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute left-0 top-0 w-full h-full rounded-full opacity-15 animate-pulse" 
          style={{ 
            background: `radial-gradient(circle, ${pupilColor} 0%, transparent 70%)`,
            animationDuration: '3s',
            animationDelay: '1s'
          }} 
        />
        <div 
          className="absolute right-0 top-0 w-full h-full rounded-full opacity-15 animate-pulse" 
          style={{ 
            background: `radial-gradient(circle, ${pupilColor} 0%, transparent 70%)`,
            animationDuration: '3s',
            animationDelay: '1.3s'
          }} 
        />
      </div>
    </div>
  );
}
