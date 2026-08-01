"use client";

import { useEffect } from "react";
import { useNavigation } from "./NavigationProvider";

/**
 * Global navigation interceptor that triggers loader on any navigation attempt
 */
export const NavigationInterceptor = () => {
  const { startLoading } = useNavigation();

  useEffect(() => {
    // Intercept all link clicks
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement;

      if (link && link.href) {
        const href = link.href;
        const currentUrl = window.location.href;

        // Only trigger loader for different URLs
        if (
          href !== currentUrl &&
          !href.startsWith("mailto:") &&
          !href.startsWith("tel:")
        ) {
          startLoading();
        }
      }
    };

    // Intercept all form submissions
    const handleFormSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;

      // Only trigger for forms that navigate (not AJAX submissions)
      if (form && form.action && form.method !== "post") {
        startLoading();
      }
    };

    // Intercept browser back/forward navigation
    const handlePopState = () => {
      startLoading();
    };

    // Add event listeners
    document.addEventListener("click", handleLinkClick, true);
    document.addEventListener("submit", handleFormSubmit, true);
    window.addEventListener("popstate", handlePopState);

    // Cleanup
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      document.removeEventListener("submit", handleFormSubmit, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [startLoading]);

  return null; // This component doesn't render anything
};

export default NavigationInterceptor;
