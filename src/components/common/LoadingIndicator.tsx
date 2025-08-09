import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';

interface LoadingIndicatorProps {
  variant?: 'circular' | 'linear' | 'dots';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
  fullScreen?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  variant = 'circular',
  size = 'medium',
  message,
  overlay = false,
  color = 'primary',
  fullScreen = false,
}) => {
  const theme = useTheme();

  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 64;
      default:
        return 40;
    }
  };

  const getMessageSize = () => {
    switch (size) {
      case 'small':
        return 'body2';
      case 'large':
        return 'h6';
      default:
        return 'body1';
    }
  };

  const renderCircularLoader = () => (
    <CircularProgress
      size={getSizeValue()}
      color={color}
      thickness={4}
      sx={{
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      }}
    />
  );

  const renderLinearLoader = () => (
    <Box sx={{ width: '100%', maxWidth: 300 }}>
      <LinearProgress
        color={color}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: color === 'inherit' 
            ? alpha(theme.palette.text.primary, 0.1)
            : alpha(theme.palette[color].main, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );

  const renderDotsLoader = () => (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        alignItems: 'center',
      }}
    >
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: getSizeValue() / 4,
            height: getSizeValue() / 4,
            borderRadius: '50%',
            backgroundColor: color === 'inherit' 
              ? theme.palette.text.primary
              : theme.palette[color].main,
            animation: `bounce 1.4s ease-in-out ${index * 0.16}s infinite both`,
            '@keyframes bounce': {
              '0%, 80%, 100%': {
                transform: 'scale(0)',
              },
              '40%': {
                transform: 'scale(1)',
              },
            },
          }}
        />
      ))}
    </Box>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'linear':
        return renderLinearLoader();
      case 'dots':
        return renderDotsLoader();
      default:
        return renderCircularLoader();
    }
  };

  const content = (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 2,
        }}
      >
        {renderLoader()}
        {message && (
          <Typography
            variant={getMessageSize() as any}
            color="text.secondary"
            sx={{
              textAlign: 'center',
              fontWeight: 500,
              maxWidth: 300,
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  );

  if (overlay || fullScreen) {
    return (
      <Box
        sx={{
          position: fullScreen ? 'fixed' : 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(4px)',
          zIndex: fullScreen ? theme.zIndex.modal : theme.zIndex.drawer,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingIndicator;