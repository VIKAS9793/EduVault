/**
 * Service Worker Registration Utility
 * Implements secure PWA registration with error handling
 */

type ServiceWorkerConfig = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
};

/**
 * Registers service worker for offline functionality
 * @param config - Optional callbacks for registration events
 */
export const registerServiceWorker = (config?: ServiceWorkerConfig): void => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // Check for updates periodically
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (!installingWorker) {
              return;
            }

            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content available
                  config?.onUpdate?.(registration);
                } else {
                  // Content cached for offline use
                  config?.onSuccess?.(registration);
                }
              }
            });
          });
        })
        .catch((error: Error) => {
          console.error('Service worker registration failed:', error);
          config?.onError?.(error);
        });
    });
  }
};

/**
 * Unregisters all service workers
 * Useful for development and testing
 */
export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }
};
