import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Button,
  Fade,
  Zoom,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import type { FormField } from '../../types';
import { FeedbackButton } from '../common';
import { useNotification } from '../../contexts';

interface SimpleFieldEditorProps {
  field?: FormField;
  onSave: (field: FormField) => void;
  onCancel: () => void;
  availableFields?: FormField[];
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
] as const;

const SimpleFieldEditor: React.FC<SimpleFieldEditorProps> = ({ field, onSave, onCancel }) => {
  const { showSuccess, showError } = useNotification();
  const [fieldData, setFieldData] = useState<FormField>(() => ({
    id: field?.id || `field-${Date.now()}`,
    type: field?.type || 'text',
    label: field?.label || '',
    required: field?.required || false,
    defaultValue: field?.defaultValue || '',
    options: field?.options || [],
    validation: field?.validation || [],
    derivedFrom: field?.derivedFrom,
  }));
  const [hasChanges, setHasChanges] = useState(false);

  const handleFieldChange = (key: keyof FormField, value: any) => {
    setFieldData(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!fieldData.label.trim()) {
      showError('Field label is required');
      return;
    }
    
    try {
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      onSave(fieldData);
      showSuccess(field ? 'Field updated successfully!' : 'Field added successfully!');
      setHasChanges(false);
    } catch (error) {
      showError('Failed to save field. Please try again.');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      // Could add confirmation dialog here in the future
      setHasChanges(false);
    }
    onCancel();
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {field ? 'Edit Field' : 'Add New Field'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Field Type Selection */}
          <Zoom in timeout={200}>
            <FormControl 
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 1,
                  },
                  '&.Mui-focused': {
                    boxShadow: 2,
                  },
                },
              }}
            >
              <InputLabel>Field Type</InputLabel>
              <Select
                value={fieldData.type}
                label="Field Type"
                onChange={(e) => handleFieldChange('type', e.target.value)}
              >
                {FIELD_TYPES.map((type) => (
                  <MenuItem 
                    key={type.value} 
                    value={type.value}
                    sx={{
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Zoom>

          {/* Field Label */}
          <Zoom in timeout={300}>
            <TextField
              fullWidth
              label="Field Label"
              value={fieldData.label}
              onChange={(e) => handleFieldChange('label', e.target.value)}
              required
              error={!fieldData.label.trim()}
              helperText={!fieldData.label.trim() ? 'Label is required' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 1,
                  },
                  '&.Mui-focused': {
                    boxShadow: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            />
          </Zoom>

          {/* Required Toggle */}
          <Zoom in timeout={400}>
            <FormControlLabel
              control={
                <Switch
                  checked={fieldData.required}
                  onChange={(e) => handleFieldChange('required', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    },
                    '& .MuiSwitch-thumb': {
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                />
              }
              label="Required Field"
              sx={{
                '& .MuiFormControlLabel-label': {
                  transition: 'color 0.2s ease-in-out',
                },
                '&:hover .MuiFormControlLabel-label': {
                  color: 'primary.main',
                },
              }}
            />
          </Zoom>

          {/* Action Buttons */}
          <Fade in timeout={300}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleCancel}
                startIcon={<Cancel />}
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: 2,
                  },
                }}
              >
                Cancel
              </Button>
              <FeedbackButton
                variant="contained"
                onClick={handleSave}
                disabled={!fieldData.label.trim()}
                startIcon={<Save />}
                loadingText={field ? 'Updating...' : 'Adding...'}
                successText={field ? 'Updated!' : 'Added!'}
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: 4,
                  },
                }}
              >
                {field ? 'Update Field' : 'Add Field'}
              </FeedbackButton>
            </Box>
          </Fade>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SimpleFieldEditor;