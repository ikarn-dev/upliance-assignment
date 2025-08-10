import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Button,
  Box,
  Alert,
  Stack,
  Divider,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add,
  Visibility,
  Description,
  CalendarToday,
  ArrowForward,
  CheckCircle,
  ArrowBack,
  Delete,
  Schedule,
} from '@mui/icons-material';
import type { FormSchema, FormState } from '../../types';
import { ValidationEngine, DerivedFieldCalculator, LocalStorageService } from '../../services';
import { ResponsiveLayout, FeedbackButton } from '../common';
import { useNotification } from '../../contexts';
import DynamicField from './DynamicField';


interface FormPreviewProps {
  schema?: FormSchema;
  onSubmit?: (values: Record<string, any>) => void;
}

const FormPreviewEmptyState: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [recentForms, setRecentForms] = useState<FormSchema[]>([]);

  useEffect(() => {
    try {
      const forms = LocalStorageService.getForms();
      setRecentForms(forms.slice(0, 3)); // Show only the 3 most recent forms
    } catch (error) {
      console.error('Error loading recent forms:', error);
    }
  }, []);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handlePreviewForm = (formId: string) => {
    navigate(`/preview/${formId}`);
  };

  return (
    <ResponsiveLayout maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 6 },
          textAlign: 'center',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
            color: 'text.primary',
          }}
        >
          Form Preview
        </Typography>

        <Alert
          severity="info"
          sx={{
            mb: 4,
            textAlign: 'left',
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" gutterBottom>
            No form selected for preview
          </Typography>
          <Typography variant="body2">
            Choose a form from your saved forms below, or create a new one to get started.
          </Typography>
        </Alert>

        {/* Recent Forms Section */}
        {recentForms.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 2,
                textAlign: 'left',
              }}
            >
              Your Recent Forms
            </Typography>

            <Stack spacing={2}>
              {recentForms.map((form) => (
                <Card
                  key={form.id}
                  elevation={1}
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1, textAlign: 'left' }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 1,
                          }}
                        >
                          {form.name}
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(form.createdAt)}
                            </Typography>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Description sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {form.fields.slice(0, 3).map((field, index) => (
                            <Chip
                              key={index}
                              label={field.type}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: 24 }}
                            />
                          ))}
                          {form.fields.length > 3 && (
                            <Chip
                              label={`+${form.fields.length - 3} more`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: 24 }}
                            />
                          )}
                        </Box>
                      </Box>

                      <Button
                        variant="contained"
                        startIcon={<Visibility />}
                        endIcon={<ArrowForward />}
                        onClick={() => handlePreviewForm(form.id)}
                        sx={{
                          ml: 2,
                          minWidth: 140,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}
                      >
                        Preview
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Button
              variant="outlined"
              onClick={() => navigate('/myforms')}
              sx={{
                mt: 2,
                minWidth: 160,
              }}
            >
              View All Forms
            </Button>
          </Box>
        )}

        {/* Action Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mb: 3 }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/create')}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              py: 1.5,
            }}
          >
            Create New Form
          </Button>

          {recentForms.length === 0 && (
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<Description />}
              onClick={() => navigate('/myforms')}
              sx={{
                minWidth: { xs: '100%', sm: 'auto' },
                py: 1.5,
              }}
            >
              View My Forms
            </Button>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {recentForms.length > 0
            ? 'Select a form above to preview how it will appear to users, or create a new one.'
            : 'You haven\'t created any forms yet. Start by creating your first form to see it here.'
          }
        </Typography>
      </Paper>
    </ResponsiveLayout>
  );
};

const FormPreview: React.FC<FormPreviewProps> = ({ schema, onSubmit }) => {
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();

  const [formState, setFormState] = useState<FormState>({
    values: {},
    errors: {},
    touched: {},
    isValid: false
  });
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [submissionData, setSubmissionData] = useState<{
    values: Record<string, any>;
    submittedAt: Date;
  } | null>(null);

  // Initialize form values with default values from schema
  useEffect(() => {
    if (schema) {
      const initialValues: Record<string, any> = {};

      schema.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialValues[field.id] = field.defaultValue;
        } else {
          // Set appropriate default values based on field type
          switch (field.type) {
            case 'checkbox':
              // For checkbox groups (with options), initialize as empty array
              // For single checkbox, initialize as false
              initialValues[field.id] = field.options && field.options.length > 0 ? [] : false;
              break;
            case 'number':
              initialValues[field.id] = '';
              break;
            default:
              initialValues[field.id] = '';
          }
        }
      });

      setFormState(prev => ({
        ...prev,
        values: initialValues,
        errors: {},
        touched: {},
        isValid: false
      }));

      // Reset submit attempt state when schema changes
      setHasAttemptedSubmit(false);
    }
  }, [schema]);

  // Run validation when form values change
  useEffect(() => {
    if (schema && Object.keys(formState.values).length > 0) {
      const validationResult = ValidationEngine.validateForm(formState.values, schema);

      setFormState(prev => ({
        ...prev,
        errors: validationResult.fieldErrors,
        isValid: validationResult.isValid
      }));
    }
  }, [formState.values, schema]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormState(prev => {
      const newValues = {
        ...prev.values,
        [fieldId]: value
      };

      // Update derived fields when parent field values change
      let updatedValues = newValues;
      if (schema) {
        const derivedResult = DerivedFieldCalculator.updateDerivedFields(newValues, schema);
        updatedValues = derivedResult.values;
      }

      // Immediately validate the form with the new values
      let validationResult = { fieldErrors: {}, isValid: true };
      if (schema) {
        validationResult = ValidationEngine.validateForm(updatedValues, schema);
      }

      return {
        ...prev,
        values: updatedValues,
        errors: validationResult.fieldErrors,
        isValid: validationResult.isValid
      };
    });
  };

  const handleFieldBlur = (fieldId: string) => {
    setFormState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldId]: true
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark that user has attempted to submit
    setHasAttemptedSubmit(true);

    // Mark all fields as touched to show validation errors
    const allTouched: Record<string, boolean> = {};
    schema?.fields.forEach(field => {
      allTouched[field.id] = true;
    });

    setFormState(prev => ({
      ...prev,
      touched: allTouched
    }));

    // Prevent submission if form is invalid
    if (!formState.isValid) {
      // Don't show toast notification - the form-level alert will handle this gracefully
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(formState.values);
      } else {
        // Default behavior - simulate form submission and show submission view
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set submission data to show submission view
        setSubmissionData({
          values: { ...formState.values },
          submittedAt: new Date()
        });
        
        showSuccess('Form submitted successfully!');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showError('Failed to submit form. Please try again.');
    }
  };

  const handleReset = () => {
    // Reset to initial values
    const initialValues: Record<string, any> = {};

    schema?.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialValues[field.id] = field.defaultValue;
      } else {
        // Set appropriate default values based on field type
        switch (field.type) {
          case 'checkbox':
            // For checkbox groups (with options), initialize as empty array
            // For single checkbox, initialize as false
            initialValues[field.id] = field.options && field.options.length > 0 ? [] : false;
            break;
          case 'number':
            initialValues[field.id] = '';
            break;
          default:
            initialValues[field.id] = '';
        }
      }
    });

    setFormState(prev => ({
      ...prev,
      values: initialValues,
      errors: {},
      touched: {},
      isValid: false
    }));

    // Reset submit attempt state when form is reset
    setHasAttemptedSubmit(false);

    showSuccess('Form reset successfully!');
  };

  const handleBackToForm = () => {
    setSubmissionData(null);
    setHasAttemptedSubmit(false);
  };

  const handleDeleteSubmission = () => {
    setSubmissionData(null);
    setHasAttemptedSubmit(false);
    
    // Reset form to initial state
    handleReset();
    showSuccess('Submission deleted successfully!');
  };

  const formatSubmissionDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getFieldDisplayValue = (field: any, value: any): string => {
    if (value === null || value === undefined) return 'Not provided';
    
    switch (field.type) {
      case 'checkbox':
        // Handle checkbox groups (multiple options) vs single checkbox
        if (field.options && field.options.length > 0) {
          // Checkbox group - show selected options
          if (Array.isArray(value) && value.length > 0) {
            return value.join(', ');
          } else {
            return 'None selected';
          }
        } else {
          // Single checkbox - show Yes/No
          return value ? 'Yes' : 'No';
        }
      case 'select':
      case 'radio':
        return String(value);
      case 'date':
        return value ? new Date(value).toLocaleDateString() : 'Not provided';
      default:
        return String(value) || 'Not provided';
    }
  };

  if (!schema) {
    return <FormPreviewEmptyState />;
  }

  // Show submission view if form has been submitted
  if (submissionData) {
    return (
      <ResponsiveLayout maxWidth="md">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            backgroundColor: 'background.paper',
            borderRadius: 2,
          }}
        >
          {/* Success Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckCircle
              sx={{
                fontSize: 64,
                color: 'success.main',
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                color: 'text.primary',
              }}
            >
              Form Submitted Successfully!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Thank you for submitting "{schema.name}"
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Submitted on {formatSubmissionDate(submissionData.submittedAt)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Submission Data */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 3,
              }}
            >
              Your Submission Details
            </Typography>

            <Stack spacing={3}>
              {schema.fields.map((field) => {
                const value = submissionData.values[field.id];
                const displayValue = getFieldDisplayValue(field, value);
                const isEmpty = value === null || value === undefined || value === '';

                return (
                  <Card
                    key={field.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: isEmpty 
                        ? alpha(theme.palette.grey[500], 0.05)
                        : alpha(theme.palette.success.main, 0.02),
                      borderColor: isEmpty 
                        ? alpha(theme.palette.grey[500], 0.2)
                        : alpha(theme.palette.success.main, 0.3),
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              color: 'text.primary',
                              mb: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {field.label}
                            {field.required && (
                              <Chip
                                label="Required"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: isEmpty ? 'text.secondary' : 'text.primary',
                              fontStyle: isEmpty ? 'italic' : 'normal',
                              fontWeight: isEmpty ? 400 : 500,
                            }}
                          >
                            {displayValue}
                          </Typography>
                        </Box>
                        {!isEmpty && (
                          <CheckCircle
                            sx={{
                              fontSize: 20,
                              color: 'success.main',
                              ml: 2,
                            }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ArrowBack />}
              onClick={handleBackToForm}
              sx={{
                minWidth: { xs: '100%', sm: 160 },
                py: 1.5,
              }}
            >
              Back to Form
            </Button>
            <FeedbackButton
              variant="outlined"
              color="error"
              size="large"
              startIcon={<Delete />}
              onClick={handleDeleteSubmission}
              loadingText="Deleting..."
              successText="Deleted!"
              sx={{
                minWidth: { xs: '100%', sm: 160 },
                py: 1.5,
              }}
            >
              Delete Submission
            </FeedbackButton>
          </Stack>


        </Paper>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout maxWidth="md">
      <Paper
        elevation={2}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          backgroundColor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
              color: 'text.primary',
            }}
          >
            {schema.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Form Preview - This is how your form will appear to users
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit} role="form">
          {/* Enhanced form-level validation summary */}
          {(() => {
            const currentErrors = Object.entries(formState.errors)
              .filter(([fieldId, fieldErrors]) => {
                // Only show errors for fields that are actually touched and have current errors
                const fieldValue = formState.values[fieldId];
                const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';

                // Don't show errors for fields that have values (they're valid now)
                if (hasValue) return false;

                return formState.touched[fieldId] && fieldErrors && fieldErrors.length > 0;
              })
              .map(([fieldId, fieldErrors]) => {
                const field = schema.fields.find(f => f.id === fieldId);
                const fieldLabel = field?.label || fieldId;

                // Generate helpful suggestions for each error
                const suggestions = field?.validation?.map(rule =>
                  ValidationEngine.getValidationHelpText(rule.type, rule.value)
                ).filter(Boolean) || [];

                return {
                  fieldId,
                  fieldLabel,
                  errors: fieldErrors,
                  suggestions
                };
              });

            // Only show validation summary if user has attempted to submit and there are errors
            return currentErrors.length > 0 && hasAttemptedSubmit ? (
              <Alert
                severity="info"
                variant="outlined"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.info.main, 0.02),
                  borderColor: alpha(theme.palette.info.main, 0.3),
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {currentErrors.length === 1
                    ? `Please fill out the "${currentErrors[0].fieldLabel}" field to continue.`
                    : `Please complete the ${currentErrors.length} required fields to submit your form.`
                  }
                </Typography>
              </Alert>
            ) : null;
          })()}

          <Stack spacing={3}>
            {schema.fields.map((field) => {
              const fieldErrors = formState.errors[field.id];
              const fieldValue = formState.values[field.id];
              const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';

              // Only show errors if field is touched, has errors, and doesn't have a valid value
              const shouldShowErrors = formState.touched[field.id] && fieldErrors && !hasValue;

              return (
                <DynamicField
                  key={field.id}
                  field={field}
                  value={fieldValue}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error={shouldShowErrors ? fieldErrors : undefined}
                />
              );
            })}
          </Stack>

          <Divider sx={{ my: 4 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="flex-start"
          >
            <FeedbackButton
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={!formState.isValid && Object.keys(formState.touched).length > 0}
              onClick={handleSubmit}
              loadingText="Submitting..."
              successText="Submitted!"
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                py: 1.5,
              }}
            >
              Submit Form
            </FeedbackButton>

            <FeedbackButton
              type="button"
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleReset}
              loadingText="Resetting..."
              successText="Reset!"
              sx={{
                minWidth: { xs: '100%', sm: 120 },
                py: 1.5,
              }}
            >
              Reset Form
            </FeedbackButton>
          </Stack>
        </Box>
      </Paper>
    </ResponsiveLayout>
  );
};

export default FormPreview;