import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type AlertType = 'success' | 'error' | 'info' | 'warning' | 'prompt';

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, title?: string) => void;
  showPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
  hideAlert: () => void;
  submitPrompt: (value: string | null) => void;
  alertState: {
    isOpen: boolean;
    message: string;
    type: AlertType;
    title: string;
    defaultValue?: string;
  };
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const promptResolverRef = React.useRef<((value: string | null) => void) | null>(null);

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    message: string;
    type: AlertType;
    title: string;
    defaultValue?: string;
  }>({
    isOpen: false,
    message: '',
    type: 'info',
    title: '',
  });

  const showAlert = (message: string, type: AlertType = 'info', title?: string) => {
    setAlertState({
      isOpen: true,
      message,
      type,
      title: title || (type === 'error' ? 'Error' : type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : 'Info'),
    });
  };

  const showPrompt = (message: string, defaultValue: string = '', title: string = 'Input Required'): Promise<string | null> => {
    return new Promise((resolve) => {
      promptResolverRef.current = resolve;
      setAlertState({
        isOpen: true,
        message,
        type: 'prompt',
        title,
        defaultValue
      });
    });
  };

  const submitPrompt = (value: string | null) => {
    if (promptResolverRef.current) {
      promptResolverRef.current(value);
      promptResolverRef.current = null;
    }
    hideAlert();
  };

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, showPrompt, hideAlert, submitPrompt, alertState }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
