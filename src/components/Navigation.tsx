import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  useTheme, 
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  alpha
} from '@mui/material';
import { Menu as MenuIcon, Build, Visibility, Folder } from '@mui/icons-material';

const Navigation: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigationItems = [
    { path: '/create', label: 'Create', icon: <Build fontSize="small" /> },
    { path: '/preview', label: 'Preview', icon: <Visibility fontSize="small" /> },
    { path: '/myforms', label: 'My Forms', icon: <Folder fontSize="small" /> },
  ];

  const activeButtonStyle = {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
  };

  if (isMobile) {
    return (
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 600,
            }}
          >
            Form Builder
          </Typography>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 160,
                borderRadius: 2,
                boxShadow: theme.shadows[8],
              },
            }}
          >
            {navigationItems.map((item) => (
              <MenuItem
                key={item.path}
                component={Link}
                to={item.path}
                onClick={handleMenuClose}
                selected={isActive(item.path)}
                sx={{
                  gap: 1.5,
                  py: 1.5,
                  px: 2,
                  borderRadius: 1,
                  mx: 0.5,
                  mb: 0.5,
                  '&:last-child': { mb: 0 },
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                  },
                }}
              >
                {item.icon}
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: '-0.5px',
          }}
        >
          Dynamic Form Builder
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              startIcon={item.icon}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                ...(isActive(item.path) ? activeButtonStyle : {}),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;