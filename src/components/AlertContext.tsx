import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AlertContextProps {
  showAlert: (title: string, message: string) => void;
  hideAlert: () => void;
  alert: { title: string; message: string } | null;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  const showAlert = (title: string, message: string) => {
    setAlert({ title, message });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, alert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
