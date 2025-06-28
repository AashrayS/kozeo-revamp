'use client';

import { useNavigationLoader } from '../src/components/common/useNavigationLoader';

/**
 * Utility hook for profile navigation
 */
export const useProfileNavigation = () => {
  const { navigateWithLoader } = useNavigationLoader();

  const navigateToProfile = (username: string) => {
    navigateWithLoader(`/profile/${username}`);
  };

  const navigateToCurrentUserProfile = () => {
    // In a real app, you'd get this from user context/auth
    const currentUsername = 'john_doe'; // This would come from your auth system
    navigateToProfile(currentUsername);
  };

  return {
    navigateToProfile,
    navigateToCurrentUserProfile,
  };
};

export default useProfileNavigation;
