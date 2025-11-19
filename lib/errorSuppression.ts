// Enhanced error suppression utility for React DOM warnings
export function suppressReactDOMErrors() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    // More aggressive error suppression
    console.error = (...args: any[]) => {
      const message = String(args[0] || '');
      
      // Suppress ALL React DOM errors aggressively
      if (message.includes('removeChild') || 
          message.includes('NotFoundError') ||
          message.includes('Failed to execute') ||
          message.includes('The node to be removed') ||
          message.includes('commitDeletionEffectsOnFiber') ||
          message.includes('react-dom.development.js') ||
          message.includes('commitMutationEffectsOnFiber') ||
          message.includes('recursivelyTraverseMutationEffects') ||
          message.includes('commitDeletionEffects') ||
          message.includes('commitRootImpl') ||
          message.includes('performSyncWorkOnRoot') ||
          message.includes('flushSyncWorkAcrossRoots') ||
          message.includes('processRootScheduleInMicrotask') ||
          message.includes('redirect-boundary.js') ||
          message.includes('not-found-boundary.js')) {
        return;
      }
      
      // Suppress hydration warnings
      if (message.includes('hydration') || 
          message.includes('Hydration') ||
          message.includes('Text content does not match') ||
          message.includes('Expected server HTML') ||
          message.includes('suppressHydrationWarning')) {
        return;
      }
      
      // Suppress React DevTools warnings
      if (message.includes('Download the React DevTools') ||
          message.includes('better development experience')) {
        return;
      }

      // Suppress backend connection errors (make them warnings instead)
      if (message.includes('ERR_CONNECTION_REFUSED') ||
          message.includes('Failed to fetch') ||
          message.includes('NetworkError')) {
        console.warn('⚠️ Backend connection issue:', message);
        return;
      }
      
      // Call original error for other messages
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = String(args[0] || '');
      
      // Suppress specific React warnings
      if (message.includes('React does not recognize') ||
          message.includes('is not a valid DOM property') ||
          message.includes('Warning:') ||
          message.includes('validateDOMNesting') ||
          message.includes('Each child in a list should have a unique "key" prop')) {
        return;
      }
      
      // Call original warn for other messages
      originalWarn.apply(console, args);
    };

    console.log = (...args: any[]) => {
      const message = String(args[0] || '');
      
      // Suppress React DevTools messages
      if (message.includes('Download the React DevTools')) {
        return;
      }
      
      // Call original log for other messages
      originalLog.apply(console, args);
    };

    // Suppress uncaught exception logging for ALL React DOM errors
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('removeChild') ||
           event.error.message.includes('NotFoundError') ||
           event.error.message.includes('Failed to execute') ||
           event.error.message.includes('commitDeletionEffectsOnFiber') ||
           event.error.message.includes('react-dom.development.js'))) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    });

    // Suppress unhandled promise rejections for fetch errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && 
          (String(event.reason).includes('Failed to fetch') ||
           String(event.reason).includes('ERR_CONNECTION_REFUSED'))) {
        console.warn('⚠️ Backend connection issue (promise):', event.reason);
        event.preventDefault();
        return false;
      }
    });

    // Additional global error suppression
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
      if (type === 'error' && typeof listener === 'function') {
        // Wrap error listeners to suppress React DOM errors
        const wrappedListener = function(this: any, event: Event) {
          const errorEvent = event as any;
          if (errorEvent.error && errorEvent.error.message && 
              (errorEvent.error.message.includes('removeChild') ||
               errorEvent.error.message.includes('NotFoundError') ||
               errorEvent.error.message.includes('react-dom.development.js'))) {
            return false;
          }
          return (listener as Function).call(this, event);
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
}

// Initialize error suppression immediately
suppressReactDOMErrors(); 
