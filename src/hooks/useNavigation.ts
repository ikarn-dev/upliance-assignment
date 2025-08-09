import { useNavigate, useLocation } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToCreate = () => navigate('/create');
  const navigateToPreview = () => navigate('/preview');
  const navigateToMyForms = () => navigate('/myforms');

  const isCurrentRoute = (path: string) => location.pathname === path;

  return {
    navigate,
    location,
    navigateToCreate,
    navigateToPreview,
    navigateToMyForms,
    isCurrentRoute,
    currentPath: location.pathname,
  };
};