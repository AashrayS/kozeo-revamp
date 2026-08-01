'use client';

import { useNavigationLoader } from '../src/components/common/useNavigationLoader';

/**
 * Utility hook for immediate navigation with loader
 * Use this in any component that needs to navigate with instant loader feedback
 */
export const useInstantNavigation = () => {
  const { navigateWithLoader, replaceWithLoader, startLoading } = useNavigationLoader();

  // Navigate with immediate loader
  const navigate = (path: string) => {
    navigateWithLoader(path);
  };

  // Replace current route with immediate loader
  const replace = (path: string) => {
    replaceWithLoader(path);
  };

  // Manually trigger loader (useful for custom navigation logic)
  const triggerLoader = () => {
    startLoading();
  };

  // Handle programmatic navigation with loader
  const handleNavigation = (callback: () => void) => {
    startLoading();
    // Small delay to ensure loader is visible
    setTimeout(callback, 100);
  };

  return {
    navigate,
    replace,
    triggerLoader,
    handleNavigation,
  };
};

export default useInstantNavigation;
