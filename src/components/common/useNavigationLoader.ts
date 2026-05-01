'use client';

import { useNavigation } from './NavigationProvider';
import { useRouter } from 'next/navigation';

/**
 * Hook to access navigation loading state with immediate trigger
 * @returns {object} Navigation state and utilities
 */
export const useNavigationLoader = () => {
  const { isLoading, startLoading, stopLoading } = useNavigation();
  const router = useRouter();
  
  // Enhanced navigation function that triggers loader immediately
  const navigateWithLoader = (path: string) => {
    startLoading(); // Trigger loader immediately
    
    // Small delay to ensure loader is visible before navigation
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  // Enhanced replace function that triggers loader immediately
  const replaceWithLoader = (path: string) => {
    startLoading(); // Trigger loader immediately
    
    // Small delay to ensure loader is visible before navigation
    setTimeout(() => {
      router.replace(path);
    }, 100);
  };
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    navigateWithLoader,
    replaceWithLoader,
    // Also expose the router for direct access if needed
    router,
  };
};
