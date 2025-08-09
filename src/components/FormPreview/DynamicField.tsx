import React from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  InputAdornment,
  Tooltip,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  ErrorOutline,
  CheckCircle,
  AutoAwesome,
} from '@mui/icons-material';
import { type FormField } from '../../types';
import ValidationHint from './ValidationHint';

interface DynamicFieldProps {
  field: FormField;
  value: any;
  onChange: (fieldId: string, value: any) => void;
  onBlur?: (fieldId: string) => void;
  error?: string[];
  disabled?: boolean;
}

const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled = false
}) => {
  const theme = useTheme();
  const hasError = error && error.length > 0;
  const hasValue = value !== undefined && value !== null && value !== '';
  const isValid = !hasError && hasValue && field.required;

  // Derived fields should be disabled and read-only
  const isFieldDisabled = disabled || !!field.derivedFrom;

  // Define the type for validation hints
  interface ValidationHintType {
    message: string;
    suggestion: string;
    severity: 'error' | 'warning' | 'info' | 'success';
  }

  // Get enhanced validation information
  const getValidationInfo = (): {
    helperText: string;
    showValidationHint: boolean;
    validationHints: ValidationHintType[];
  } => {
    if (field.derivedFrom) {
      return {
        helperText: '🔄 This field is automatically calculated based on other fields',
        showValidationHint: false,
        validationHints: []
      };
    }

    if (hasError) {
      return {
        helperText: error!.join('; '),
        showValidationHint: false,
        validationHints: []
      };
    }

    // Don't show any validation hints - keep the interface clean
    return {
      helperText: '',
      showValidationHint: false,
      validationHints: []
    };
  };

  const validationInfo = getValidationInfo();

  // Get appropriate end adornment icon
  const getEndAdornment = () => {
    if (isFieldDisabled && field.derivedFrom) {
      return (
        <InputAdornment position="end">
          <Tooltip title="This field is automatically calculated">
            <AutoAwesome
              sx={{
                color: theme.palette.info.main,
                fontSize: 20,
              }}
            />
          </Tooltip>
        </InputAdornment>
      );
    }

    if (hasError) {
      return (
        <InputAdornment position="end">
          <Tooltip title={error!.join('; ')}>
            <ErrorOutline
              sx={{
                color: theme.palette.error.main,
                fontSize: 20,
              }}
            />
          </Tooltip>
        </InputAdornment>
      );
    }

    if (isValid) {
      return (
        <InputAdornment position="end">
          <CheckCircle
            sx={{
              color: theme.palette.success.main,
              fontSize: 20,
            }}
          />
        </InputAdornment>
      );
    }

    return null;
  };

  // Enhanced field styling
  const getFieldSx = () => {
    const baseSx = {
      '& .MuiOutlinedInput-root': {
        transition: 'all 0.2s ease-in-out',
      },
    };

    if (hasError) {
      return {
        ...baseSx,
        '& .MuiOutlinedInput-root': {
          ...baseSx['& .MuiOutlinedInput-root'],
          '& fieldset': {
            borderColor: theme.palette.error.main,
            borderWidth: 2,
          },
          '&:hover fieldset': {
            borderColor: theme.palette.error.dark,
          },
          backgroundColor: alpha(theme.palette.error.main, 0.02),
        },
      };
    }

    if (isValid) {
      return {
        ...baseSx,
        '& .MuiOutlinedInput-root': {
          ...baseSx['& .MuiOutlinedInput-root'],
          '& fieldset': {
            borderColor: theme.palette.success.main,
          },
          '&:hover fieldset': {
            borderColor: theme.palette.success.dark,
          },
          backgroundColor: alpha(theme.palette.success.main, 0.02),
        },
      };
    }

    if (isFieldDisabled && field.derivedFrom) {
      return {
        ...baseSx,
        '& .MuiOutlinedInput-root': {
          ...baseSx['& .MuiOutlinedInput-root'],
          backgroundColor: alpha(theme.palette.info.main, 0.05),
          '& fieldset': {
            borderColor: theme.palette.info.main,
            borderStyle: 'dashed',
          },
        },
      };
    }

    return baseSx;
  };

  const handleChange = (newValue: any) => {
    // Don't allow changes to derived fields
    if (!field.derivedFrom) {
      onChange(field.id, newValue);
    }
  };

  const handleBlur = () => {
    if (onBlur && !field.derivedFrom) {
      onBlur(field.id);
    }
  };

  // Render different field types
  switch (field.type) {
    case 'text':
      return (
        <Stack spacing={1} data-field-id={field.id}>
          <TextField
            fullWidth
            label={field.label}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            error={hasError}
            helperText={validationInfo.helperText}
            required={field.required}
            disabled={isFieldDisabled}
            margin="normal"
            sx={getFieldSx()}
            InputProps={{
              endAdornment: getEndAdornment(),
            }}
          />
          {validationInfo.showValidationHint && validationInfo.validationHints.map((hint, index) => (
            <ValidationHint
              key={index}
              message={hint.message}
              suggestion={hint.suggestion}
              severity={hint.severity}
            />
          ))}
        </Stack>
      );

    case 'number':
      return (
        <Stack spacing={1} data-field-id={field.id}>
          <TextField
            fullWidth
            type="number"
            label={field.label}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : '')}
            onBlur={handleBlur}
            error={hasError}
            helperText={validationInfo.helperText}
            required={field.required}
            disabled={isFieldDisabled}
            margin="normal"
            sx={getFieldSx()}
            InputProps={{
              endAdornment: getEndAdornment(),
            }}
          />
          {validationInfo.showValidationHint && validationInfo.validationHints.map((hint, index) => (
            <ValidationHint
              key={index}
              message={hint.message}
              suggestion={hint.suggestion}
              severity={hint.severity}
            />
          ))}
        </Stack>
      );

    case 'textarea':
      return (
        <Stack spacing={1} data-field-id={field.id}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.label}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            error={hasError}
            helperText={validationInfo.helperText}
            required={field.required}
            disabled={isFieldDisabled}
            margin="normal"
            sx={getFieldSx()}
            InputProps={{
              endAdornment: getEndAdornment(),
            }}
          />
          {validationInfo.showValidationHint && validationInfo.validationHints.map((hint, index) => (
            <ValidationHint
              key={index}
              message={hint.message}
              suggestion={hint.suggestion}
              severity={hint.severity}
            />
          ))}
        </Stack>
      );

    case 'date':
      return (
        <Stack spacing={1} data-field-id={field.id}>
          <TextField
            fullWidth
            type="date"
            label={field.label}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            error={hasError}
            helperText={validationInfo.helperText}
            required={field.required}
            disabled={isFieldDisabled}
            margin="normal"
            sx={getFieldSx()}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              endAdornment: getEndAdornment(),
            }}
          />
          {validationInfo.showValidationHint && validationInfo.validationHints.map((hint, index) => (
            <ValidationHint
              key={index}
              message={hint.message}
              suggestion={hint.suggestion}
              severity={hint.severity}
            />
          ))}
        </Stack>
      );

    case 'select':
      return (
        <Stack spacing={1} data-field-id={field.id}>
          <FormControl
            fullWidth
            margin="normal"
            error={hasError}
            disabled={isFieldDisabled}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.2s ease-in-out',
                ...(hasError && {
                  '& fieldset': {
                    borderColor: theme.palette.error.main,
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.error.dark,
                  },
                  backgroundColor: alpha(theme.palette.error.main, 0.02),
                }),
                ...(isValid && {
                  '& fieldset': {
                    borderColor: theme.palette.success.main,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.success.dark,
                  },
                  backgroundColor: alpha(theme.palette.success.main, 0.02),
                }),
                ...(isFieldDisabled && field.derivedFrom && {
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                  '& fieldset': {
                    borderColor: theme.palette.info.main,
                    borderStyle: 'dashed',
                  },
                }),
              },
            }}
          >
            <FormLabel
              component="legend"
              required={field.required}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
                fontWeight: 500,
              }}
            >
              {field.label}
              {field.derivedFrom && (
                <Tooltip title="This field is automatically calculated">
                  <AutoAwesome
                    sx={{
                      color: theme.palette.info.main,
                      fontSize: 16,
                    }}
                  />
                </Tooltip>
              )}
            </FormLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              displayEmpty
              endAdornment={
                <InputAdornment position="end" sx={{ mr: 1 }}>
                  {hasError && (
                    <Tooltip title={error!.join('; ')}>
                      <ErrorOutline
                        sx={{
                          color: theme.palette.error.main,
                          fontSize: 20,
                        }}
                      />
                    </Tooltip>
                  )}
                  {isValid && (
                    <CheckCircle
                      sx={{
                        color: theme.palette.success.main,
                        fontSize: 20,
                      }}
                    />
                  )}
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>Select an option</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {validationInfo.helperText && (
              <FormHelperText
                sx={{
                  mt: 1,
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                }}
              >
                {validationInfo.helperText}
              </FormHelperText>
            )}
          </FormControl>
          {validationInfo.showValidationHint && validationInfo.validationHints.map((hint, index) => (
            <ValidationHint
              key={index}
              message={hint.message}
              suggestion={hint.suggestion}
              severity={hint.severity}
            />
          ))}
        </Stack>
      );

    case 'radio':
      return (
        <Stack spacing={1} data-field-id={field.id}>
          <FormControl
            component="fieldset"
            margin="normal"
            error={hasError}
            disabled={isFieldDisabled}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: hasError
                ? theme.palette.error.main
                : isFieldDisabled && field.derivedFrom
                  ? theme.palette.info.main
                  : 'divider',
              borderRadius: 2,
              borderStyle: isFieldDisabled && field.derivedFrom ? 'dashed' : 'solid',
              backgroundColor: hasError
                ? alpha(theme.palette.error.main, 0.02)
                : isValid
                  ? alpha(theme.palette.success.main, 0.02)
                  : isFieldDisabled && field.derivedFrom
                    ? alpha(theme.palette.info.main, 0.05)
                    : 'transparent',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <FormLabel
              component="legend"
              required={field.required}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
                fontWeight: 500,
                color: hasError ? 'error.main' : 'text.primary',
              }}
            >
              {field.label}
              {field.derivedFrom && (
                <Tooltip title="This field is automatically calculated">
                  <AutoAwesome
                    sx={{
                      color: theme.palette.info.main,
                      fontSize: 16,
                    }}
                  />
                </Tooltip>
              )}
              {hasError && (
                <Tooltip title={error!.join('; ')}>
                  <ErrorOutline
                    sx={{
                      color: theme.palette.error.main,
                      fontSize: 16,
                    }}
                  />
                </Tooltip>
              )}
              {isValid && (
                <CheckCircle
                  sx={{
                    color: theme.palette.success.main,
                    fontSize: 16,
                  }}
                />
              )}
            </FormLabel>
            <RadioGroup
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                    },
                  }}
                />
              ))}
            </RadioGroup>
            {validationInfo.helperText && (
              <FormHelperText
                sx={{
                  mt: 1,
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                }}
              >
                {validationInfo.helperText}
              </FormHelperText>
            )}
          </FormControl>
          {validationInfo.showValidationHint && validationInfo.validationHints.map((hint, index) => (
            <ValidationHint
              key={index}
              message={hint.message}
              suggestion={hint.suggestion}
              severity={hint.severity}
            />
          ))}
        </Stack>
      );

    case 'checkbox':
      return (
        <Stack spacing={1} data-field-id={field.id}>
          <Box
            margin="normal"
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: hasError
                ? theme.palette.error.main
                : isFieldDisabled && field.derivedFrom
                  ? theme.palette.info.main
                  : 'divider',
              borderRadius: 2,
              borderStyle: isFieldDisabled && field.derivedFrom ? 'dashed' : 'solid',
              backgroundColor: hasError
                ? alpha(theme.palette.error.main, 0.02)
                : isValid
                  ? alpha(theme.palette.success.main, 0.02)
                  : isFieldDisabled && field.derivedFrom
                    ? alpha(theme.palette.info.main, 0.05)
                    : 'transparent',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <FormControl error={hasError} disabled={isFieldDisabled}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(value)}
                    onChange={(e) => handleChange(e.target.checked)}
                    onBlur={handleBlur}
                    sx={{
                      color: hasError
                        ? 'error.main'
                        : isValid
                          ? 'success.main'
                          : 'primary.main',
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {field.label}
                    {field.derivedFrom && (
                      <Tooltip title="This field is automatically calculated">
                        <AutoAwesome
                          sx={{
                            color: theme.palette.info.main,
                            fontSize: 16,
                          }}
                        />
                      </Tooltip>
                    )}
                    {hasError && (
                      <Tooltip title={error!.join('; ')}>
                        <ErrorOutline
                          sx={{
                            color: theme.palette.error.main,
                            fontSize: 16,
                          }}
                        />
                      </Tooltip>
                    )}
                    {isValid && (
                      <CheckCircle
                        sx={{
                          color: theme.palette.success.main,
                          fontSize: 16,
                        }}
                      />
                    )}
                  </Box>
                }
                required={field.required}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  },
                }}
              />
              {validationInfo.helperText && (
                <FormHelperText
                  sx={{
                    mt: 1,
                    ml: 4,
                    fontSize: '0.75rem',
                    lineHeight: 1.4,
                  }}
                >
                  {validationInfo.helperText}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
          {validationInfo.showValidationHint && validationInfo.validationHints.map((hint, index) => (
            <ValidationHint
              key={index}
              message={hint.message}
              suggestion={hint.suggestion}
              severity={hint.severity}
            />
          ))}
        </Stack>
      );

    default:
      return (
        <Stack spacing={1} data-field-id={field.id}>
          <TextField
            fullWidth
            label={field.label}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            error={hasError}
            helperText={validationInfo.helperText}
            required={field.required}
            disabled={isFieldDisabled}
            margin="normal"
            sx={getFieldSx()}
            InputProps={{
              endAdornment: getEndAdornment(),
            }}
          />
          {validationInfo.showValidationHint && validationInfo.validationHints.map((hint, index) => (
            <ValidationHint
              key={index}
              message={hint.message}
              suggestion={hint.suggestion}
              severity={hint.severity}
            />
          ))}
        </Stack>
      );
  }
};

export default DynamicField;