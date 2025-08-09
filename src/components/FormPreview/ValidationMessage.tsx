import React from 'react';
import { 
  Alert, 
  Box, 
  Typography, 
  Collapse,
  IconButton,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { 
  ErrorOutline, 
  WarningAmber, 
  InfoOutlined,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

interface ValidationMessageProps {
  errors: string[];
  severity?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'standard' | 'filled' | 'outlined';
  showIcon?: boolean;
  collapsible?: boolean;
  title?: string;
  helpText?: string;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({
  errors,
  severity = 'error',
  variant = 'standard',
  showIcon = true,
  collapsible = false,
  title,
  helpText
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(!collapsible);

  if (!errors || errors.length === 0) {
    return null;
  }

  const getIcon = () => {
    if (!showIcon) return false;
    
    switch (severity) {
      case 'error':
        return <ErrorOutline fontSize="small" />;
      case 'warning':
        return <WarningAmber fontSize="small" />;
      case 'info':
        return <InfoOutlined fontSize="small" />;
      default:
        return <ErrorOutline fontSize="small" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    const count = errors.length;
    switch (severity) {
      case 'error':
        return count === 1 ? 'Validation Error' : `${count} Validation Errors`;
      case 'warning':
        return count === 1 ? 'Warning' : `${count} Warnings`;
      case 'info':
        return count === 1 ? 'Information' : `${count} Items`;
      default:
        return count === 1 ? 'Error' : `${count} Errors`;
    }
  };

  const getSeverityColor = () => {
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

  // For single error without collapsible, show as simple alert
  if (errors.length === 1 && !collapsible && !helpText) {
    return (
      <Alert 
        severity={severity} 
        variant={variant}
        icon={getIcon()}
        sx={{ 
          mt: 1, 
          mb: 1,
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {errors[0]}
        </Typography>
      </Alert>
    );
  }

  // For multiple errors or collapsible, show enhanced version
  return (
    <Alert 
      severity={severity} 
      variant={variant}
      icon={getIcon()}
      sx={{ 
        mt: 1, 
        mb: 1,
        borderRadius: 2,
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: collapsible ? 'pointer' : 'default',
          }}
          onClick={collapsible ? () => setExpanded(!expanded) : undefined}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: getSeverityColor(),
            }}
          >
            {getTitle()}
          </Typography>
          
          {collapsible && (
            <IconButton 
              size="small" 
              sx={{ 
                ml: 1,
                color: getSeverityColor(),
                '&:hover': {
                  backgroundColor: alpha(getSeverityColor(), 0.1),
                },
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 1 }}>
            {errors.length === 1 ? (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {errors[0]}
              </Typography>
            ) : (
              <Stack spacing={0.5} sx={{ mb: 1 }}>
                {errors.map((error, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: getSeverityColor(),
                        mt: 0.75,
                        flexShrink: 0,
                      }}
                    />
                    <Typography 
                      variant="body2"
                      sx={{ 
                        flex: 1,
                        lineHeight: 1.5,
                      }}
                    >
                      {error}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
            
            {helpText && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  mt: 1,
                  p: 1,
                  backgroundColor: alpha(getSeverityColor(), 0.1),
                  borderRadius: 1,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                }}
              >
                💡 {helpText}
              </Typography>
            )}
          </Box>
        </Collapse>
      </Box>
    </Alert>
  );
};

export default ValidationMessage;