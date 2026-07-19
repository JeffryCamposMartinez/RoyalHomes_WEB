import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({ isOpen: false, message: '', type: 'info', isConfirm: false, onConfirm: null, onCancel: null });

  const showAlert = useCallback((message, type = 'info') => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        message,
        type,
        isConfirm: false,
        onConfirm: () => {
          setAlertState({ isOpen: false, message: '', type: 'info', isConfirm: false });
          resolve(true);
        },
      });
    });
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        message,
        type: 'confirm',
        isConfirm: true,
        onConfirm: () => {
          setAlertState({ isOpen: false, message: '', type: 'info', isConfirm: false });
          resolve(true);
        },
        onCancel: () => {
          setAlertState({ isOpen: false, message: '', type: 'info', isConfirm: false });
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alertState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-scale-up border border-outline-variant/30">
            {alertState.type === 'error' && <span className="material-symbols-outlined text-error text-5xl mb-4">error</span>}
            {alertState.type === 'success' && <span className="material-symbols-outlined text-primary text-5xl mb-4">check_circle</span>}
            {alertState.type === 'info' && <span className="material-symbols-outlined text-primary text-5xl mb-4">info</span>}
            {alertState.type === 'confirm' && <span className="material-symbols-outlined text-secondary text-5xl mb-4">help</span>}
            
            <p className="font-body-lg text-on-surface mb-8">{alertState.message}</p>
            
            <div className="flex justify-center gap-4 w-full">
              {alertState.isConfirm && (
                <button 
                  onClick={alertState.onCancel}
                  className="flex-1 py-3 px-4 rounded-full font-label-md uppercase tracking-widest text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button 
                onClick={alertState.onConfirm}
                className="flex-1 py-3 px-4 rounded-full font-label-md uppercase tracking-widest bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
