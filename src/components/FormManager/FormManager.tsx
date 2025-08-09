import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Box,
  Chip,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
  Stack,
  alpha,
  IconButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  Description,
  Visibility,
  Add,
  Refresh,
  Delete,
  DeleteSweep,
  MoreVert,
  SelectAll,
  Clear,
} from '@mui/icons-material';
import { LocalStorageService } from '../../services';
import { ResponsiveLayout, LoadingSkeleton, FeedbackButton } from '../common';
import { useNotification, useLoading } from '../../contexts';
import { ErrorHandler } from '../../utils/errorHandler';
import type { FormSchema } from '../../types';

const FormManager: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showError } = useNotification();
  const { withLoading } = useLoading();

  const [forms, setForms] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection and delete state
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormSchema | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      await withLoading(async () => {
        setError(null);

        // Add a small delay to show loading state for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const savedForms = LocalStorageService.getForms();
        setForms(savedForms);
        setLoading(false);
      }, 'Loading your forms...');
    } catch (err) {
      console.error('Error loading forms:', err);
      const errorMessage = ErrorHandler.getDetailedMessage(err);
      setError(errorMessage);
      showError(errorMessage);
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getFieldTypeCount = (fields: FormSchema['fields']) => {
    const counts: Record<string, number> = {};
    fields.forEach(field => {
      counts[field.type] = (counts[field.type] || 0) + 1;
    });
    return counts;
  };

  const handlePreviewForm = (formId: string) => {
    navigate(`/preview/${formId}`);
  };

  // Selection handlers
  const handleToggleSelection = (formId: string) => {
    const newSelection = new Set(selectedForms);
    if (newSelection.has(formId)) {
      newSelection.delete(formId);
    } else {
      newSelection.add(formId);
    }
    setSelectedForms(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedForms.size === forms.length) {
      setSelectedForms(new Set());
    } else {
      setSelectedForms(new Set(forms.map(form => form.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedForms(new Set());
    setSelectionMode(false);
  };

  // Delete handlers
  const handleDeleteForm = (form: FormSchema) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteAll = () => {
    setDeleteAllDialogOpen(true);
  };

  const confirmDeleteForm = async () => {
    if (formToDelete) {
      try {
        await withLoading(async () => {
          LocalStorageService.deleteForm(formToDelete.id);
          setForms(prev => prev.filter(f => f.id !== formToDelete.id));
          setDeleteDialogOpen(false);
          setFormToDelete(null);
        }, 'Deleting form...');
      } catch (error) {
        showError('Failed to delete form. Please try again.');
      }
    }
  };

  const confirmDeleteSelected = async () => {
    try {
      await withLoading(async () => {
        selectedForms.forEach(formId => {
          LocalStorageService.deleteForm(formId);
        });
        setForms(prev => prev.filter(f => !selectedForms.has(f.id)));
        setSelectedForms(new Set());
        setSelectionMode(false);
        setDeleteDialogOpen(false);
      }, `Deleting ${selectedForms.size} form${selectedForms.size > 1 ? 's' : ''}...`);
    } catch (error) {
      showError('Failed to delete selected forms. Please try again.');
    }
  };

  const confirmDeleteAll = async () => {
    try {
      await withLoading(async () => {
        LocalStorageService.clearAllForms();
        setForms([]);
        setSelectedForms(new Set());
        setSelectionMode(false);
        setDeleteAllDialogOpen(false);
      }, 'Deleting all forms...');
    } catch (error) {
      showError('Failed to delete all forms. Please try again.');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
            color: 'text.primary',
            mb: 3,
          }}
        >
          My Forms
        </Typography>
        <LoadingSkeleton variant="card" count={6} />
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
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
          My Forms
        </Typography>
        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Unable to Load Forms
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        <FeedbackButton
          variant="contained"
          onClick={loadForms}
          sx={{ mt: 2 }}
          startIcon={<Refresh />}
          loadingText="Loading..."
          successText="Loaded!"
        >
          Try Again
        </FeedbackButton>
      </ResponsiveLayout>
    );
  }

  if (forms.length === 0) {
    return (
      <ResponsiveLayout>
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
          My Forms
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            backgroundColor: alpha(theme.palette.grey[50], 0.5),
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Description sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No forms found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You haven't created any forms yet. Start building your first form to see it here.
          </Typography>
          <Button
            variant="contained"
            href="/create"
            size="large"
            startIcon={<Add />}
            sx={{ mt: 2 }}
          >
            Create Your First Form
          </Button>
        </Paper>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
              color: 'text.primary',
              mb: 1,
            }}
          >
            My Forms
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Manage and preview your saved forms. Click on any form to see how it will appear to users.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {/* Selection mode controls */}
          {selectionMode && (
            <>
              <Typography variant="body2" color="text.secondary">
                {selectedForms.size} selected
              </Typography>
              <Button
                size="small"
                onClick={handleSelectAll}
                startIcon={selectedForms.size === forms.length ? <Clear /> : <SelectAll />}
              >
                {selectedForms.size === forms.length ? 'Clear All' : 'Select All'}
              </Button>
              <Button
                size="small"
                color="error"
                onClick={handleDeleteSelected}
                disabled={selectedForms.size === 0}
                startIcon={<Delete />}
              >
                Delete Selected
              </Button>
              <Button
                size="small"
                onClick={handleClearSelection}
              >
                Cancel
              </Button>
            </>
          )}

          {/* Normal mode controls */}
          {!selectionMode && (
            <>
              {!isMobile && (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <MoreVert />
                  </IconButton>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    href="/create"
                    sx={{ minWidth: 140 }}
                  >
                    New Form
                  </Button>
                </>
              )}
              {isMobile && (
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                >
                  <MoreVert />
                </IconButton>
              )}
            </>
          )}
        </Stack>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { setSelectionMode(true); handleMenuClose(); }}>
          <ListItemIcon>
            <SelectAll fontSize="small" />
          </ListItemIcon>
          <ListItemText>Select Forms</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleDeleteAll(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteSweep fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete All Forms</ListItemText>
        </MenuItem>
      </Menu>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {Array.isArray(forms) && forms.map((form) => {
          const fieldCounts = getFieldTypeCount(form.fields);
          const totalFields = form.fields.length;

          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={form.id}>
              <Card
                elevation={1}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: selectedForms.has(form.id) ? 'primary.main' : 'divider',
                  backgroundColor: selectedForms.has(form.id) ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                  '&:hover': {
                    elevation: 4,
                    transform: selectionMode ? 'none' : 'translateY(-4px)',
                    borderColor: 'primary.main',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      noWrap
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        flex: 1,
                        mr: 1,
                      }}
                    >
                      {form.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {selectionMode && (
                        <Checkbox
                          checked={selectedForms.has(form.id)}
                          onChange={() => handleToggleSelection(form.id)}
                          size="small"
                        />
                      )}
                      {!selectionMode && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteForm(form);
                          }}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(form.createdAt)}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {totalFields} field{totalFields !== 1 ? 's' : ''}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Object.entries(fieldCounts).slice(0, 3).map(([type, count]) => (
                      <Chip
                        key={type}
                        label={`${count} ${type}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.75rem',
                          height: 24,
                        }}
                      />
                    ))}
                    {Object.entries(fieldCounts).length > 3 && (
                      <Chip
                        label={`+${Object.entries(fieldCounts).length - 3} more`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.75rem',
                          height: 24,
                        }}
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    size="medium"
                    startIcon={<Visibility />}
                    onClick={() => handlePreviewForm(form.id)}
                    variant="contained"
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontWeight: 500,
                    }}
                  >
                    Preview Form
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Mobile FAB for creating new form */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Button
            variant="contained"
            href="/create"
            sx={{
              borderRadius: '50%',
              minWidth: 56,
              width: 56,
              height: 56,
              boxShadow: theme.shadows[6],
              '&:hover': {
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <Add />
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Dialogs */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {formToDelete ? 'Delete Form' : 'Delete Selected Forms'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {formToDelete
              ? `Are you sure you want to delete the form "${formToDelete.name}"? This action cannot be undone.`
              : `Are you sure you want to delete ${selectedForms.size} selected form${selectedForms.size > 1 ? 's' : ''}? This action cannot be undone.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <FeedbackButton
            onClick={formToDelete ? confirmDeleteForm : confirmDeleteSelected}
            color="error"
            variant="contained"
            startIcon={<Delete />}
            loadingText="Deleting..."
            successText="Deleted!"
          >
            Delete
          </FeedbackButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteAllDialogOpen}
        onClose={() => setDeleteAllDialogOpen(false)}
        aria-labelledby="delete-all-dialog-title"
        aria-describedby="delete-all-dialog-description"
      >
        <DialogTitle id="delete-all-dialog-title">
          Delete All Forms
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-all-dialog-description">
            Are you sure you want to delete all {forms.length} form{forms.length > 1 ? 's' : ''}? This action cannot be undone and will permanently remove all your saved forms.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <FeedbackButton
            onClick={confirmDeleteAll}
            color="error"
            variant="contained"
            startIcon={<DeleteSweep />}
            loadingText="Deleting all..."
            successText="All deleted!"
          >
            Delete All
          </FeedbackButton>
        </DialogActions>
      </Dialog>
    </ResponsiveLayout>
  );
};

export default FormManager;