import React, { createContext, useContext, useState, useCallback } from 'react';
import { Backdrop, CircularProgress, Typography, Box, alpha } from '@mui/material';

interface LoadingState {
  isLoading: boolean;
  message?: string;
}

interface LoadingContextType {
  isLoading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(
    asyncFn: () => Promise<T>, 
    loadingMessage?: string
  ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: undefined,
  });

  const showLoading = useCallback((message?: string) => {
    setLoadingState({
      isLoading: true,
      message,
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      message: undefined,
    });
  }, []);

  const withLoading = useCallback(async <T,>(
    asyncFn: () => Promise<T>, 
    loadingMessage?: string
  ): Promise<T> => {
    try {
      showLoading(loadingMessage);
      const result = await asyncFn();
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const contextValue: LoadingContextType = {
    isLoading: loadingState.isLoading,
    showLoading,
    hideLoading,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: alpha('#000', 0.7),
          backdropFilter: 'blur(4px)',
        }}
        open={loadingState.isLoading}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress 
            color="primary" 
            size={48}
            thickness={4}
          />
          {loadingState.message && (
            <Typography 
              variant="h6" 
              component="div"
              sx={{
                color: 'white',
                fontWeight: 500,
                textAlign: 'center',
                maxWidth: 300,
              }}
            >
              {loadingState.message}
            </Typography>
          )}
        </Box>
      </Backdrop>
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingContext;