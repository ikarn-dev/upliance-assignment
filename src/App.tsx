import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Navigation, ErrorBoundary } from './components';
import { CreatePage, PreviewPage, MyFormsPage } from './pages';
import { theme } from './theme';
import { NotificationProvider, LoadingProvider } from './contexts';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <NotificationProvider>
          <LoadingProvider>
            <Router>
              <Navigation />
              <Box 
                sx={{ 
                  minHeight: 'calc(100vh - 64px)', // Account for AppBar height
                  backgroundColor: 'background.default',
                }}
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/create" replace />} />
                  <Route path="/create" element={<CreatePage />} />
                  <Route path="/preview" element={<PreviewPage />} />
                  <Route path="/preview/:formId" element={<PreviewPage />} />
                  <Route path="/myforms" element={<MyFormsPage />} />
                  {/* Catch-all route for 404 handling */}
                  <Route path="*" element={<Navigate to="/create" replace />} />
                </Routes>
              </Box>
            </Router>
          </LoadingProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
