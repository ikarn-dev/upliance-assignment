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
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { FormField } from '../../types';
import ValidationRuleEditor from './ValidationRuleEditor';
import DerivedFieldEditor from './DerivedFieldEditor';

interface FieldEditorProps {
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

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel, availableFields = [] }) => {
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

  const [newOption, setNewOption] = useState('');

  const handleFieldChange = (key: keyof FormField, value: any) => {
    setFieldData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFieldData(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption.trim()],
      }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setFieldData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSave = () => {
    if (!fieldData.label.trim()) {
      return; // Basic validation - label is required
    }
    onSave(fieldData);
  };

  const needsOptions = fieldData.type === 'select' || fieldData.type === 'radio';

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {field ? 'Edit Field' : 'Add New Field'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Field Type Selection */}
          <FormControl fullWidth>
            <InputLabel>Field Type</InputLabel>
            <Select
              value={fieldData.type}
              label="Field Type"
              onChange={(e) => handleFieldChange('type', e.target.value)}
            >
              {FIELD_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Field Label */}
          <TextField
            fullWidth
            label="Field Label"
            value={fieldData.label}
            onChange={(e) => handleFieldChange('label', e.target.value)}
            required
            error={!fieldData.label.trim()}
            helperText={!fieldData.label.trim() ? 'Label is required' : ''}
          />

          {/* Required Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={fieldData.required}
                onChange={(e) => handleFieldChange('required', e.target.checked)}
              />
            }
            label="Required Field"
          />

          {/* Default Value */}
          {fieldData.type !== 'checkbox' && (
            <TextField
              fullWidth
              label="Default Value"
              value={fieldData.defaultValue || ''}
              onChange={(e) => handleFieldChange('defaultValue', e.target.value)}
              type={fieldData.type === 'number' ? 'number' : 'text'}
              multiline={fieldData.type === 'textarea'}
              rows={fieldData.type === 'textarea' ? 3 : 1}
            />
          )}

          {/* Checkbox Default Value */}
          {fieldData.type === 'checkbox' && (
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(fieldData.defaultValue)}
                  onChange={(e) => handleFieldChange('defaultValue', e.target.checked)}
                />
              }
              label="Default Checked"
            />
          )}

          {/* Options for Select and Radio */}
          {needsOptions && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Add Option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <IconButton onClick={handleAddOption} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {fieldData.options?.map((option, index) => (
                  <Chip
                    key={index}
                    label={option}
                    onDelete={() => handleRemoveOption(index)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Box>
              {needsOptions && (!fieldData.options || fieldData.options.length === 0) && (
                <Typography variant="caption" color="error">
                  At least one option is required for {fieldData.type} fields
                </Typography>
              )}
            </Box>
          )}

          {/* Validation Rules */}
          <ValidationRuleEditor
            validationRules={fieldData.validation || []}
            onChange={(rules) => handleFieldChange('validation', rules)}
            fieldType={fieldData.type}
          />

          {/* Derived Field Configuration */}
          <DerivedFieldEditor
            derivedConfig={fieldData.derivedFrom}
            onChange={(config) => handleFieldChange('derivedFrom', config)}
            availableFields={availableFields}
            currentFieldId={fieldData.id}
          />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={
                !fieldData.label.trim() ||
                (needsOptions && (!fieldData.options || fieldData.options.length === 0))
              }
            >
              {field ? 'Update Field' : 'Add Field'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FieldEditor;