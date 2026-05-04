import { useCallback, useEffect, useRef } from 'react';

interface UsePollingOptions {
  interval: number;
  enabled?: boolean;
  onError?: (error: any) => void;
}

/**
 * Custom hook for polling data at regular intervals.
 * Useful as fallback when real-time subscriptions aren't available.
 */
export const usePolling = (
  callback: () => Promise<void>,
  options: UsePollingOptions
) => {
  const { interval, enabled = true, onError } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const startPolling = useCallback(() => {
    // Call immediately on start
    callback().catch((error) => {
      if (isMountedRef.current && onError) {
        onError(error);
      }
    });

    // Set up interval
    intervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return;

      callback().catch((error) => {
        if (isMountedRef.current && onError) {
          onError(error);
        }
      });
    }, interval);
  }, [callback, interval, onError]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    start: startPolling,
    stop: stopPolling,
  };
};
