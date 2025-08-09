import React, { useState } from 'react';
import {
  Button,
  Box,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';


interface InteractiveButtonProps extends ButtonProps {
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  rippleEffect?: boolean;
  tooltip?: string;
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  hoverEffect = 'lift',
  rippleEffect = true,
  tooltip,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const [, setIsHovered] = useState(false);
  const [, setIsPressed] = useState(false);

  const getHoverStyles = () => {
    const baseStyles = {
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    } as const;

    switch (hoverEffect) {
      case 'lift':
        return {
          ...baseStyles,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
          '&:active': {
            transform: 'translateY(0px)',
            boxShadow: theme.shadows[2],
          },
        } as const;

      case 'glow':
        return {
          ...baseStyles,
          '&:hover': {
            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
          },
        } as const;

      case 'scale':
        return {
          ...baseStyles,
          '&:hover': {
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        } as const;

      default:
        return baseStyles;
    }
  };

  const getRippleStyles = () => {
    if (!rippleEffect) return {} as const;

    return {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      '&::before': {
        content: '""',
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        borderRadius: '50%',
        background: alpha(theme.palette.common.white, 0.3),
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.6s, height 0.6s',
      },
      '&:active::before': {
        width: '300px',
        height: '300px',
      },
    } as const;
  };

  const buttonContent = (
    <Button
      {...props}
      onMouseEnter={(e) => {
        setIsHovered(true);
        props.onMouseEnter?.(e as any);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        props.onMouseLeave?.(e as any);
      }}
      onMouseDown={(e) => {
        setIsPressed(true);
        props.onMouseDown?.(e as any);
      }}
      onMouseUp={(e) => {
        setIsPressed(false);
        props.onMouseUp?.(e as any);
      }}
      sx={{
        ...getHoverStyles(),
        ...getRippleStyles(),
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
};

export default InteractiveButton;