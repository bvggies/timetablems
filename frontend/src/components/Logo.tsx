import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon' | 'compact';
  sx?: SxProps<Theme>;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 40, 
  variant = 'full',
  sx,
  color = 'currentColor',
}) => {
  const iconSize = variant === 'icon' ? size : size * 0.6;
  
  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Calendar base */}
      <rect
        x="20"
        y="30"
        width="80"
        height="70"
        rx="8"
        fill={color}
        opacity="0.1"
      />
      <rect
        x="20"
        y="30"
        width="80"
        height="70"
        rx="8"
        stroke={color}
        strokeWidth="3"
      />
      
      {/* Calendar header */}
      <rect
        x="20"
        y="30"
        width="80"
        height="25"
        rx="8"
        fill={color}
      />
      
      {/* Calendar rings/binding */}
      <circle cx="35" cy="42.5" r="3" fill="white" />
      <circle cx="85" cy="42.5" r="3" fill="white" />
      
      {/* Calendar grid lines */}
      <line
        x1="40"
        y1="55"
        x2="40"
        y2="100"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
      <line
        x1="60"
        y1="55"
        x2="60"
        y2="100"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
      <line
        x1="80"
        y1="55"
        x2="80"
        y2="100"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
      <line
        x1="20"
        y1="70"
        x2="100"
        y2="70"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
      <line
        x1="20"
        y1="85"
        x2="100"
        y2="85"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
      
      {/* Time indicators */}
      <circle cx="30" cy="62.5" r="4" fill={color} />
      <circle cx="50" cy="77.5" r="4" fill={color} />
      <circle cx="70" cy="62.5" r="4" fill={color} />
      <circle cx="90" cy="77.5" r="4" fill={color} />
      
      {/* PUG text/accent */}
      <text
        x="60"
        y="20"
        fontSize="16"
        fontWeight="700"
        fill={color}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
      >
        PUG
      </text>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <Box sx={{ display: 'inline-flex', ...sx }}>
        <LogoIcon />
      </Box>
    );
  }

  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          ...sx,
        }}
      >
        <LogoIcon />
        <Box
          component="span"
          sx={{
            fontSize: size * 0.35,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PUG
        </Box>
      </Box>
    );
  }

  // Full variant
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        ...sx,
      }}
    >
      <LogoIcon />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: size * 0.4,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PUG Timetable
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: size * 0.2,
            fontWeight: 500,
            letterSpacing: '0.05em',
            opacity: 0.7,
            textTransform: 'uppercase',
          }}
        >
          Management System
        </Box>
      </Box>
    </Box>
  );
};

export default Logo;

