import React, { useState } from 'react';
import {
  Alert,
  Box,
  Typography,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ErrorOutline,
  WarningAmber,
  InfoOutlined,
  ExpandMore,
  ExpandLess,
  ArrowForward,
} from '@mui/icons-material';

interface ValidationError {
  fieldId: string;
  fieldLabel: string;
  errors: string[];
  suggestions?: string[];
}

interface ValidationSummaryProps {
  errors: ValidationError[];
  severity?: 'error' | 'warning' | 'info';
  title?: string;
  collapsible?: boolean;
  showFieldNavigation?: boolean;
  onFieldFocus?: (fieldId: string) => void;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  severity = 'error',
  title,
  collapsible = true,
  showFieldNavigation = true,
  onFieldFocus,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(!collapsible || errors.length <= 3);

  if (!errors || errors.length === 0) {
    return null;
  }

  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorOutline />;
      case 'warning':
        return <WarningAmber />;
      case 'info':
        return <InfoOutlined />;
      default:
        return <ErrorOutline />;
    }
  };

  const getTitle = () => {
    if (title) return title;

    const count = errors.length;
    const totalErrors = errors.reduce((sum, error) => sum + error.errors.length, 0);

    switch (severity) {
      case 'error':
        return `${count} field${count > 1 ? 's' : ''} with validation errors (${totalErrors} total)`;
      case 'warning':
        return `${count} field${count > 1 ? 's' : ''} with warnings (${totalErrors} total)`;
      case 'info':
        return `${count} field${count > 1 ? 's' : ''} need attention (${totalErrors} total)`;
      default:
        return `${count} field${count > 1 ? 's' : ''} with issues (${totalErrors} total)`;
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
      default:
        return theme.palette.error.main;
    }
  };

  const handleFieldClick = (fieldId: string) => {
    if (onFieldFocus) {
      onFieldFocus(fieldId);
    }
  };

  return (
    <Alert
      severity={severity}
      variant="outlined"
      icon={getIcon()}
      sx={{
        mb: 2,
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
            variant="subtitle2"
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
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontStyle: 'italic' }}
            >
              Please review and fix the following issues before submitting:
            </Typography>

            <List dense sx={{ py: 0 }}>
              {errors.map((fieldError, index) => (
                <React.Fragment key={fieldError.fieldId}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: 1,
                      alignItems: 'flex-start',
                      backgroundColor: alpha(getSeverityColor(), 0.02),
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                      <ErrorOutline
                        fontSize="small"
                        sx={{ color: getSeverityColor() }}
                      />
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle2"
                            component="span"
                            sx={{ fontWeight: 600, color: getSeverityColor() }}
                          >
                            {fieldError.fieldLabel}
                          </Typography>

                          {showFieldNavigation && onFieldFocus && (
                            <Button
                              size="small"
                              variant="text"
                              endIcon={<ArrowForward fontSize="small" />}
                              onClick={() => handleFieldClick(fieldError.fieldId)}
                              sx={{
                                minWidth: 'auto',
                                px: 1,
                                py: 0.25,
                                fontSize: '0.75rem',
                                color: getSeverityColor(),
                                '&:hover': {
                                  backgroundColor: alpha(getSeverityColor(), 0.1),
                                },
                              }}
                            >
                              Go to field
                            </Button>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box component="div">
                          {fieldError.errors.map((error, errorIndex) => (
                            <Box
                              key={errorIndex}
                              sx={{
                                color: 'text.primary',
                                mb: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                fontSize: '0.875rem',
                              }}
                            >
                              <Box
                                sx={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  backgroundColor: getSeverityColor(),
                                  flexShrink: 0,
                                }}
                              />
                              {error}
                            </Box>
                          ))}

                          {fieldError.suggestions && fieldError.suggestions.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {fieldError.suggestions.map((suggestion, suggestionIndex) => (
                                <Box
                                  key={suggestionIndex}
                                  sx={{
                                    color: 'text.secondary',
                                    fontStyle: 'italic',
                                    display: 'block',
                                    mb: 0.25,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  💡 {suggestion}
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>

                  {index < errors.length - 1 && (
                    <Divider sx={{ my: 0.5, opacity: 0.3 }} />
                  )}
                </React.Fragment>
              ))}
            </List>

            <Box
              sx={{
                mt: 2,
                p: 1.5,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                borderRadius: 1,
                border: '1px solid',
                borderColor: alpha(theme.palette.info.main, 0.2),
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <InfoOutlined fontSize="small" />
                Fields with errors are highlighted in red. Fix all issues to enable form submission.
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Alert>
  );
};

export default ValidationSummary;