import React, { useState } from 'react';
import { 
  Button, 
  CircularProgress, 
  Box,
  alpha,
  useTheme,
} from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import { CheckCircle } from '@mui/icons-material';

interface FeedbackButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  loadingText?: string;
  successText?: string;
  successDuration?: number;
  showSuccessIcon?: boolean;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  onClick,
  children,
  loadingText,
  successText,
  successDuration = 2000,
  showSuccessIcon = true,
  disabled,
  startIcon,
  ...props
}) => {
  const theme = useTheme();
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick || state !== 'idle') return;

    try {
      setState('loading');
      await onClick(event);
      
      if (successText || showSuccessIcon) {
        setState('success');
        setTimeout(() => {
          setState('idle');
        }, successDuration);
      } else {
        setState('idle');
      }
    } catch (error) {
      setState('idle');
      throw error; // Re-throw to allow parent components to handle
    }
  };

  const getButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress 
              size={16} 
              color="inherit"
              thickness={6}
            />
            {loadingText || children}
          </Box>
        );
      case 'success':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showSuccessIcon && (
              <CheckCircle 
                sx={{ 
                  fontSize: 18,
                  color: 'inherit',
                }} 
              />
            )}
            {successText || children}
          </Box>
        );
      default:
        return children;
    }
  };

  const getButtonStyles = () => {
    const baseStyles = {
      transition: 'all 0.2s ease-in-out',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    };

    switch (state) {
      case 'loading':
        return {
          ...baseStyles,
          '&:hover': {
            transform: 'none',
          },
        };
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.success.dark,
            transform: 'none',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.3)}, transparent)`,
            animation: 'shimmer 1s ease-in-out',
          },
          '@keyframes shimmer': {
            '0%': { left: '-100%' },
            '100%': { left: '100%' },
          },
        };
      default:
        return baseStyles;
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || state === 'loading'}
      sx={{
        ...getButtonStyles(),
        ...props.sx,
      }}
      startIcon={state === 'idle' ? startIcon : undefined}
    >
      {getButtonContent()}
    </Button>
  );
};

export default FeedbackButton;