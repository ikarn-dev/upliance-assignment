import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ValidationRule } from '../../types';

interface ValidationRuleEditorProps {
  validationRules: ValidationRule[];
  onChange: (rules: ValidationRule[]) => void;
  fieldType: string;
}

const VALIDATION_TYPES = [
  { value: 'notEmpty', label: 'Not Empty', description: 'Field cannot be empty' },
  { value: 'minLength', label: 'Minimum Length', description: 'Minimum number of characters' },
  { value: 'maxLength', label: 'Maximum Length', description: 'Maximum number of characters' },
  { value: 'email', label: 'Email Format', description: 'Must be a valid email address' },
  { value: 'customPassword', label: 'Custom Password', description: 'Custom password validation' },
] as const;

const ValidationRuleEditor: React.FC<ValidationRuleEditorProps> = ({
  validationRules,
  onChange,
  fieldType,
}) => {
  const [selectedType, setSelectedType] = useState<ValidationRule['type']>('notEmpty');
  const [ruleValue, setRuleValue] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');

  const getDefaultMessage = (type: ValidationRule['type'], value?: string | number): string => {
    switch (type) {
      case 'notEmpty':
        return 'This field is required';
      case 'minLength':
        return `Must be at least ${value} characters long`;
      case 'maxLength':
        return `Must be no more than ${value} characters long`;
      case 'email':
        return 'Please enter a valid email address';
      case 'customPassword':
        return 'Password must meet the required criteria';
      default:
        return 'Invalid input';
    }
  };

  const handleAddRule = () => {
    const needsValue = selectedType === 'minLength' || selectedType === 'maxLength';

    if (needsValue && (!ruleValue || isNaN(Number(ruleValue)) || Number(ruleValue) <= 0)) {
      return; // Don't add invalid rules
    }

    const value = needsValue ? Number(ruleValue) : undefined;
    const message = customMessage.trim() || getDefaultMessage(selectedType, value);

    const newRule: ValidationRule = {
      type: selectedType,
      value,
      message,
    };

    // Check if rule of this type already exists
    const existingRuleIndex = validationRules.findIndex(rule => rule.type === selectedType);

    if (existingRuleIndex >= 0) {
      // Replace existing rule
      const updatedRules = [...validationRules];
      updatedRules[existingRuleIndex] = newRule;
      onChange(updatedRules);
    } else {
      // Add new rule
      onChange([...validationRules, newRule]);
    }

    // Reset form
    setSelectedType('notEmpty');
    setRuleValue('');
    setCustomMessage('');
  };

  const handleRemoveRule = (index: number) => {
    const updatedRules = validationRules.filter((_, i) => i !== index);
    onChange(updatedRules);
  };

  const isValidRule = () => {
    const needsValue = selectedType === 'minLength' || selectedType === 'maxLength';
    if (needsValue) {
      return ruleValue && !isNaN(Number(ruleValue)) && Number(ruleValue) > 0;
    }
    return true;
  };

  const getAvailableValidationTypes = () => {
    // Filter validation types based on field type
    switch (fieldType) {
      case 'number':
        return VALIDATION_TYPES.filter(type =>
          ['notEmpty', 'minLength', 'maxLength'].includes(type.value)
        );
      case 'email':
        return VALIDATION_TYPES.filter(type =>
          ['notEmpty', 'email'].includes(type.value)
        );
      case 'checkbox':
        return VALIDATION_TYPES.filter(type =>
          ['notEmpty'].includes(type.value)
        );
      case 'select':
      case 'radio':
        return VALIDATION_TYPES.filter(type =>
          ['notEmpty'].includes(type.value)
        );
      case 'date':
        return VALIDATION_TYPES.filter(type =>
          ['notEmpty'].includes(type.value)
        );
      default: // text, textarea
        return VALIDATION_TYPES;
    }
  };

  const availableTypes = getAvailableValidationTypes();
  const needsValue = selectedType === 'minLength' || selectedType === 'maxLength';

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Validation Rules
        </Typography>

        {fieldType === 'checkbox' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            For checkbox fields, "Not Empty" validation means the checkbox must be checked.
          </Alert>
        )}

        {/* Current Rules List */}
        {validationRules.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Rules
            </Typography>
            <List dense>
              {validationRules.map((rule, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveRule(index)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={VALIDATION_TYPES.find(t => t.value === rule.type)?.label || rule.type}
                      secondary={
                        <Box>
                          {rule.value && (
                            <Typography variant="caption" display="block">
                              Value: {rule.value}
                            </Typography>
                          )}
                          <Typography variant="caption" display="block">
                            Message: {rule.message}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < validationRules.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}

        {/* Add New Rule Form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2">
            Add Validation Rule
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel>Validation Type</InputLabel>
            <Select
              value={selectedType}
              label="Validation Type"
              onChange={(e) => setSelectedType(e.target.value as ValidationRule['type'])}
            >
              {availableTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box>
                    <Typography variant="body2">{type.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {needsValue && (
            <TextField
              fullWidth
              size="small"
              label={selectedType === 'minLength' ? 'Minimum Length' : 'Maximum Length'}
              type="number"
              value={ruleValue}
              onChange={(e) => setRuleValue(e.target.value)}
              inputProps={{ min: 1 }}
              error={ruleValue !== '' && (isNaN(Number(ruleValue)) || Number(ruleValue) <= 0)}
              helperText={
                ruleValue !== '' && (isNaN(Number(ruleValue)) || Number(ruleValue) <= 0)
                  ? 'Please enter a positive number'
                  : ''
              }
            />
          )}

          <TextField
            fullWidth
            size="small"
            label="Custom Error Message (optional)"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={getDefaultMessage(selectedType, needsValue ? Number(ruleValue) : undefined)}
            multiline
            rows={2}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddRule}
              disabled={!isValidRule()}
              size="small"
            >
              Add Rule
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ValidationRuleEditor;