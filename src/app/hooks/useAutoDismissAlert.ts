import { useState, useEffect } from 'react';

interface UseAutoDismissAlertOptions {
  timeout?: number; // milliseconds
  onDismiss?: () => void;
}

export function useAutoDismissAlert(options: UseAutoDismissAlertOptions = {}) {
  const { timeout = 5000, onDismiss } = options;
  const [alert, setAlert] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    id: string;
  } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    const id = Date.now().toString();
    setAlert({ message, type, id });
  };

  const dismissAlert = () => {
    setAlert(null);
    onDismiss?.();
  };

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        dismissAlert();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [alert, timeout]);

  return {
    alert,
    showAlert,
    dismissAlert,
  };
}
