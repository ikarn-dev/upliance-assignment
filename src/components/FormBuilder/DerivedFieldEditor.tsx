import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  IconButton,
  FormControlLabel,
  Switch,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { DerivedFieldConfig, FormField } from '../../types';

interface DerivedFieldEditorProps {
  derivedConfig?: DerivedFieldConfig;
  onChange: (config?: DerivedFieldConfig) => void;
  availableFields: FormField[];
  currentFieldId?: string;
}

const DerivedFieldEditor: React.FC<DerivedFieldEditorProps> = ({
  derivedConfig,
  onChange,
  availableFields,
  currentFieldId,
}) => {
  const [isDerived, setIsDerived] = useState(Boolean(derivedConfig));
  const [parentFields, setParentFields] = useState<string[]>(
    derivedConfig?.parentFields || []
  );
  const [computationLogic, setComputationLogic] = useState(
    derivedConfig?.computationLogic || ''
  );
  const [selectedParentField, setSelectedParentField] = useState('');

  // Filter out the current field from available parent fields
  const availableParentFields = availableFields.filter(
    field => field.id !== currentFieldId
  );

  const handleIsDerivedChange = (checked: boolean) => {
    setIsDerived(checked);
    if (!checked) {
      // Clear derived configuration
      setParentFields([]);
      setComputationLogic('');
      onChange(undefined);
    } else {
      // Initialize with empty configuration
      const config: DerivedFieldConfig = {
        parentFields: [],
        computationLogic: '',
      };
      onChange(config);
    }
  };

  const handleAddParentField = () => {
    if (selectedParentField && !parentFields.includes(selectedParentField)) {
      const newParentFields = [...parentFields, selectedParentField];
      setParentFields(newParentFields);
      updateDerivedConfig(newParentFields, computationLogic);
      setSelectedParentField('');
    }
  };

  const handleRemoveParentField = (fieldId: string) => {
    const newParentFields = parentFields.filter(id => id !== fieldId);
    setParentFields(newParentFields);
    updateDerivedConfig(newParentFields, computationLogic);
  };

  const handleComputationLogicChange = (logic: string) => {
    setComputationLogic(logic);
    updateDerivedConfig(parentFields, logic);
  };

  const updateDerivedConfig = (fields: string[], logic: string) => {
    if (isDerived) {
      const config: DerivedFieldConfig = {
        parentFields: fields,
        computationLogic: logic,
      };
      onChange(config);
    }
  };

  const getFieldLabel = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    return field ? field.label : fieldId;
  };

  const generateVariableNames = () => {
    return parentFields.map(fieldId => {
      const field = availableFields.find(f => f.id === fieldId);
      return field ? `${field.label.toLowerCase().replace(/\s+/g, '_')}` : fieldId;
    });
  };

  const getExampleExpressions = () => {
    if (parentFields.length === 0) return [];
    
    const variables = generateVariableNames();
    const examples = [];
    
    if (variables.length >= 2) {
      examples.push(`${variables[0]} + ${variables[1]}`);
      examples.push(`${variables[0]} * ${variables[1]}`);
      examples.push(`Math.max(${variables[0]}, ${variables[1]})`);
    }
    
    if (variables.length >= 1) {
      examples.push(`${variables[0]} * 1.1`);
      examples.push(`${variables[0]} > 100 ? 'High' : 'Low'`);
      examples.push(`${variables[0]}.toUpperCase()`);
    }
    
    return examples;
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2">Derived Field Configuration</Typography>
          {isDerived && (
            <Chip label="Derived" size="small" color="secondary" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Enable Derived Field Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isDerived}
                onChange={(e) => handleIsDerivedChange(e.target.checked)}
              />
            }
            label="Make this a derived field"
          />

          {isDerived && (
            <>
              {/* Parent Fields Selection */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Parent Fields
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Select fields that this derived field depends on
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Select Parent Field</InputLabel>
                    <Select
                      value={selectedParentField}
                      label="Select Parent Field"
                      onChange={(e) => setSelectedParentField(e.target.value)}
                      disabled={availableParentFields.length === 0}
                    >
                      {availableParentFields.map((field) => (
                        <MenuItem key={field.id} value={field.id}>
                          {field.label} ({field.type})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton 
                    onClick={handleAddParentField} 
                    color="primary"
                    disabled={!selectedParentField || parentFields.includes(selectedParentField)}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                {availableParentFields.length === 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No other fields available. Add some fields first to create dependencies.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {parentFields.map((fieldId) => (
                    <Chip
                      key={fieldId}
                      label={getFieldLabel(fieldId)}
                      onDelete={() => handleRemoveParentField(fieldId)}
                      deleteIcon={<DeleteIcon />}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              {/* Computation Logic */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Computation Logic
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Enter a JavaScript expression to compute the field value
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="JavaScript Expression"
                  value={computationLogic}
                  onChange={(e) => handleComputationLogicChange(e.target.value)}
                  placeholder="e.g., field1 + field2"
                  helperText="Use parent field names as variables in your expression"
                />

                {parentFields.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Available variables: {generateVariableNames().join(', ')}
                    </Typography>
                    
                    {getExampleExpressions().length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Example expressions:
                        </Typography>
                        {getExampleExpressions().map((example, index) => (
                          <Typography 
                            key={index}
                            variant="caption" 
                            display="block" 
                            sx={{ 
                              fontFamily: 'monospace', 
                              backgroundColor: 'grey.100', 
                              p: 0.5, 
                              borderRadius: 0.5,
                              mt: 0.5,
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: 'grey.200' }
                            }}
                            onClick={() => setComputationLogic(example)}
                          >
                            {example}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Validation Warning */}
              {isDerived && (!parentFields.length || !computationLogic.trim()) && (
                <Alert severity="warning">
                  Derived fields require at least one parent field and computation logic.
                </Alert>
              )}
            </>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default DerivedFieldEditor;