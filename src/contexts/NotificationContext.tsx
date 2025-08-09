import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, type AlertColor, Slide, type SlideProps } from '@mui/material';

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
  autoHideDuration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor, autoHideDuration?: number) => void;
  showSuccess: (message: string, autoHideDuration?: number) => void;
  showError: (message: string, autoHideDuration?: number) => void;
  showWarning: (message: string, autoHideDuration?: number) => void;
  showInfo: (message: string, autoHideDuration?: number) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 6000,
  });

  const showNotification = useCallback((
    message: string,
    severity: AlertColor = 'info',
    autoHideDuration: number = 6000
  ) => {
    setNotification({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
  }, []);

  const showSuccess = useCallback((message: string, autoHideDuration: number = 4000) => {
    showNotification(message, 'success', autoHideDuration);
  }, [showNotification]);

  const showError = useCallback((message: string, autoHideDuration: number = 8000) => {
    showNotification(message, 'error', autoHideDuration);
  }, [showNotification]);

  const showWarning = useCallback((message: string, autoHideDuration: number = 6000) => {
    showNotification(message, 'warning', autoHideDuration);
  }, [showNotification]);

  const showInfo = useCallback((message: string, autoHideDuration: number = 6000) => {
    showNotification(message, 'info', autoHideDuration);
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.autoHideDuration}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            minWidth: 'auto',
          },
        }}
      >
        <Alert
          onClose={handleClose}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: '100%',
            fontWeight: 500,
            boxShadow: (theme) => theme.shadows[6],
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;