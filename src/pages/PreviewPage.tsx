import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Typography } from '@mui/material';
import { FormPreview, ResponsiveLayout, LoadingSkeleton } from '../components';
import { LocalStorageService } from '../services';
import { useNotification } from '../contexts';
import { ErrorHandler } from '../utils/errorHandler';
import type { FormSchema } from '../types';

const PreviewPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const { showError } = useNotification();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
  }, [formId]);

  const loadForm = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));

      const form = LocalStorageService.getForm(id);

      if (!form) {
        const errorMessage = 'Form not found. It may have been deleted or the link is invalid.';
        setError(errorMessage);
        showError(errorMessage);
        return;
      }

      setSchema(form);
    } catch (err) {
      console.error('Error loading form:', err);
      const errorMessage = ErrorHandler.getDetailedMessage(err);
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout maxWidth="md">
        <LoadingSkeleton variant="form" count={5} />
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
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
            Unable to Load Form
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </ResponsiveLayout>
    );
  }

  return <FormPreview schema={schema || undefined} />;
};

export default PreviewPage;