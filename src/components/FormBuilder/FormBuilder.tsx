import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Stack,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FormField, FormSchema } from '../../types';
import { LocalStorageService } from '../../services';
import { ResponsiveLayout, FeedbackButton } from '../common';
import { useNotification, useLoading } from '../../contexts';
import { ErrorHandler } from '../../utils/errorHandler';
import SimpleFieldEditor from './SimpleFieldEditor';

// Sortable Field Item Component
interface SortableFieldItemProps {
  field: FormField;
  index: number;
  totalFields: number;
  onEdit: (field: FormField) => void;
  onDelete: (field: FormField) => void;
  isEditing: boolean;
  getFieldTypeLabel: (type: FormField['type']) => string;
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  index,
  totalFields,
  onEdit,
  onDelete,
  isEditing,
  getFieldTypeLabel,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      divider={index < totalFields - 1}
      sx={{
        cursor: isDragging ? 'grabbing' : 'default',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <IconButton
        {...attributes}
        {...listeners}
        disabled={isEditing}
        sx={{
          cursor: isEditing ? 'default' : 'grab',
          '&:active': { cursor: 'grabbing' },
          mr: 1,
        }}
      >
        <DragIndicatorIcon />
      </IconButton>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1">{field.label}</Typography>
            <Chip
              label={getFieldTypeLabel(field.type)}
              size="small"
              variant="outlined"
            />
            {field.required && (
              <Chip label="Required" size="small" color="primary" />
            )}
            {field.derivedFrom && (
              <Chip label="Derived" size="small" color="secondary" />
            )}
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            {field.defaultValue && (
              <Typography variant="caption" display="block">
                Default: {String(field.defaultValue)}
              </Typography>
            )}
            {field.options && field.options.length > 0 && (
              <Typography variant="caption" display="block">
                Options: {field.options.join(', ')}
              </Typography>
            )}
          </Box>
        }
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          onClick={() => onEdit(field)}
          disabled={isEditing}
          color="primary"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => onDelete(field)}
          disabled={isEditing}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </ListItem>
  );
};

const FormBuilder: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showSuccess, showError } = useNotification();
  const { withLoading } = useLoading();
  
  const [formSchema, setFormSchema] = useState<FormSchema>({
    id: `form-${Date.now()}`,
    name: '',
    createdAt: new Date(),
    fields: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<FormField | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<FormField | null>(null);
  
  // Save form state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formNameError, setFormNameError] = useState('');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddField = () => {
    setEditingField(undefined);
    setIsEditing(true);
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
    setIsEditing(true);
  };

  const handleSaveField = (field: FormField) => {
    setFormSchema(prev => {
      const existingIndex = prev.fields.findIndex(f => f.id === field.id);
      if (existingIndex >= 0) {
        // Update existing field
        const updatedFields = [...prev.fields];
        updatedFields[existingIndex] = field;
        return { ...prev, fields: updatedFields };
      } else {
        // Add new field
        return { ...prev, fields: [...prev.fields, field] };
      }
    });
    setIsEditing(false);
    setEditingField(undefined);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingField(undefined);
  };

  const handleDeleteField = (field: FormField) => {
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fieldToDelete) {
      setFormSchema(prev => ({
        ...prev,
        fields: prev.fields.filter(f => f.id !== fieldToDelete.id),
      }));
    }
    setDeleteDialogOpen(false);
    setFieldToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setFieldToDelete(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormSchema(prev => {
        const oldIndex = prev.fields.findIndex(field => field.id === active.id);
        const newIndex = prev.fields.findIndex(field => field.id === over.id);

        return {
          ...prev,
          fields: arrayMove(prev.fields, oldIndex, newIndex),
        };
      });
    }
  };

  const getFieldTypeLabel = (type: FormField['type']) => {
    const typeLabels = {
      text: 'Text',
      number: 'Number',
      textarea: 'Textarea',
      select: 'Select',
      radio: 'Radio',
      checkbox: 'Checkbox',
      date: 'Date',
    };
    return typeLabels[type];
  };

  // Save form handlers
  const handleSaveForm = () => {
    if (formSchema.fields.length === 0) {
      showError('Cannot save an empty form. Please add at least one field.');
      return;
    }
    
    setFormName(formSchema.name || '');
    setFormNameError('');
    setSaveDialogOpen(true);
  };

  const handleSaveDialogClose = () => {
    setSaveDialogOpen(false);
    setFormName('');
    setFormNameError('');
  };

  const handleFormNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormName(value);
    
    // Clear error when user starts typing
    if (formNameError && value.trim()) {
      setFormNameError('');
    }
  };

  const handleConfirmSave = async () => {
    const trimmedName = formName.trim();
    
    // Validate form name
    if (!trimmedName) {
      setFormNameError('Form name is required');
      return;
    }
    
    if (trimmedName.length < 2) {
      setFormNameError('Form name must be at least 2 characters long');
      return;
    }
    
    if (trimmedName.length > 100) {
      setFormNameError('Form name must be less than 100 characters');
      return;
    }

    try {
      await withLoading(async () => {
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const schemaToSave: FormSchema = {
          ...formSchema,
          name: trimmedName,
          createdAt: new Date(),
        };
        
        LocalStorageService.saveForm(schemaToSave);
        
        // Update the current form schema with the saved name
        setFormSchema(schemaToSave);
        
        // Close dialog first for better UX
        setSaveDialogOpen(false);
        setFormName('');
        setFormNameError('');
        
        // Show success message after dialog closes
        setTimeout(() => {
          showSuccess(`Form "${trimmedName}" saved successfully!`);
        }, 100);
      }, `Saving "${trimmedName}"...`);
      
    } catch (error) {
      console.error('Error saving form:', error);
      const errorMessage = ErrorHandler.getDetailedMessage(error);
      showError(errorMessage);
    }
  };

  return (
    <ResponsiveLayout maxWidth="xl" fullHeight>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
            color: 'text.primary',
          }}
        >
          Form Builder
        </Typography>
        
        {/* Mobile action buttons */}
        {isMobile && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSaveForm}
              disabled={isEditing || formSchema.fields.length === 0}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={() => window.open('/preview', '_blank')}
              disabled={isEditing || formSchema.fields.length === 0}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddField}
              disabled={isEditing}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Add
            </Button>
          </Stack>
        )}
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 3, md: 4 },
          flex: 1,
        }}
      >
        {/* Left Panel - Form Fields List */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              Form Fields
            </Typography>
            
            {/* Desktop action buttons */}
            {!isMobile && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveForm}
                  disabled={isEditing || formSchema.fields.length === 0}
                >
                  Save Form
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => window.open('/preview', '_blank')}
                  disabled={isEditing || formSchema.fields.length === 0}
                >
                  Preview Form
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddField}
                  disabled={isEditing}
                >
                  Add Field
                </Button>
              </Stack>
            )}
          </Box>

          {formSchema.fields.length === 0 ? (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No fields added yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Add Field" to get started building your form
              </Typography>
            </Paper>
          ) : (
            <Card elevation={2}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formSchema.fields.map(field => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <List sx={{ p: 0 }}>
                    {formSchema.fields.map((field, index) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        index={index}
                        totalFields={formSchema.fields.length}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                        isEditing={isEditing}
                        getFieldTypeLabel={getFieldTypeLabel}
                      />
                    ))}
                  </List>
                </SortableContext>
              </DndContext>
            </Card>
          )}
        </Box>

        {/* Right Panel - Field Editor */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          display: isEditing ? 'block' : { xs: 'none', md: 'block' },
        }}>
          {isEditing ? (
            <SimpleFieldEditor
              field={editingField}
              onSave={handleSaveField}
              onCancel={handleCancelEdit}
              availableFields={formSchema.fields}
            />
          ) : (
            <Paper 
              elevation={0}
              sx={{ 
                p: 4,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'grey.50',
                height: 'fit-content',
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Field Editor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select a field to edit or add a new field to get started
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Field
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the field "{fieldToDelete?.label}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Form Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={handleSaveDialogClose}
        aria-labelledby="save-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="save-dialog-title">
          Save Form
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter a name for your form. This will help you identify it later.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Form Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formName}
            onChange={handleFormNameChange}
            error={!!formNameError}
            helperText={formNameError || 'Enter a descriptive name for your form'}
            inputProps={{
              maxLength: 100,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveDialogClose}>
            Cancel
          </Button>
          <FeedbackButton 
            onClick={handleConfirmSave} 
            variant="contained"
            disabled={!formName.trim()}
            startIcon={<SaveIcon />}
            loadingText="Saving..."
            successText="Saved!"
          >
            Save
          </FeedbackButton>
        </DialogActions>
      </Dialog>
    </ResponsiveLayout>
  );
};

export default FormBuilder;