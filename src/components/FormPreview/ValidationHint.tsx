import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  ErrorOutline,
  InfoOutlined,
  WarningAmber,
} from '@mui/icons-material';

interface ValidationHintProps {
  message: string;
  suggestion?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  compact?: boolean;
  showIcon?: boolean;
}

const ValidationHint: React.FC<ValidationHintProps> = ({
  message,
  suggestion,
  severity = 'error',
  compact = false,
  showIcon = true,
}) => {
  const theme = useTheme();

  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconProps = { fontSize: 'small' as const };
    
    switch (severity) {
      case 'error':
        return <ErrorOutline {...iconProps} />;
      case 'warning':
        return <WarningAmber {...iconProps} />;
      case 'info':
        return <InfoOutlined {...iconProps} />;
      case 'success':
        return <CheckCircle {...iconProps} />;
      default:
        return <ErrorOutline {...iconProps} />;
    }
  };

  const getColor = () => {
    switch (severity) {
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      case 'success':
        return theme.palette.success.main;
      default:
        return theme.palette.error.main;
    }
  };

  if (compact) {
    const icon = getIcon();
    return (
      <Tooltip title={suggestion || message} arrow>
        <span>
          <Chip
            {...(icon && { icon })}
            label={message}
            size="small"
            variant="outlined"
            sx={{
              borderColor: getColor(),
              color: getColor(),
              backgroundColor: alpha(getColor(), 0.05),
              '& .MuiChip-icon': {
                color: getColor(),
              },
              fontSize: '0.75rem',
              height: 24,
            }}
          />
        </span>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        p: 1.5,
        borderRadius: 1,
        backgroundColor: alpha(getColor(), 0.05),
        border: '1px solid',
        borderColor: alpha(getColor(), 0.2),
        mt: 0.5,
      }}
    >
      {showIcon && (
        <Box
          sx={{
            color: getColor(),
            display: 'flex',
            alignItems: 'center',
            mt: 0.125,
          }}
        >
          {getIcon()}
        </Box>
      )}
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            color: getColor(),
            fontWeight: 500,
            lineHeight: 1.4,
            mb: suggestion ? 0.5 : 0,
          }}
        >
          {message}
        </Typography>
        
        {suggestion && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontStyle: 'italic',
              lineHeight: 1.3,
              display: 'block',
            }}
          >
            💡 {suggestion}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ValidationHint;