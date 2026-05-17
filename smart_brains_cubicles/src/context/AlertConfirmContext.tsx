import React, { createContext, useContext, useState, useRef } from 'react';
import { AlertCircle, HelpCircle, Check, X } from 'lucide-react';

interface AlertConfirmOptions {
  title: string;
  message: string;
  isConfirm: boolean;
  resolve: (value: boolean) => void;
}

interface AlertConfirmContextType {
  showAlert: (title: string, message: string) => Promise<void>;
  showConfirm: (title: string, message: string) => Promise<boolean>;
}

const AlertConfirmContext = createContext<AlertConfirmContextType | undefined>(undefined);

export const AlertConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<AlertConfirmOptions | null>(null);

  const showAlert = (title: string, message: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      setModal({
        title,
        message,
        isConfirm: false,
        resolve: () => {
          setModal(null);
          resolve();
        },
      });
    });
  };

  const showConfirm = (title: string, message: string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setModal({
        title,
        message,
        isConfirm: true,
        resolve: (value: boolean) => {
          setModal(null);
          resolve(value);
        },
      });
    });
  };

  return (
    <AlertConfirmContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Modal Container Overlay */}
      {modal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          
          {/* Modal Card */}
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 transform scale-100 transition-all duration-300 ease-out animate-scale-up">
            
            {/* Design Gradient Top Bar Accent */}
            <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
            
            <div className="p-6">
              <div className="flex items-start space-x-4">
                
                {/* Icon Container */}
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  modal.isConfirm ? 'bg-primary/10 text-primary-dark' : 'bg-amber-50 text-amber-500'
                }`}>
                  {modal.isConfirm ? (
                    <HelpCircle size={24} />
                  ) : (
                    <AlertCircle size={24} />
                  )}
                </div>
                
                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                    {modal.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-semibold mt-2 whitespace-pre-wrap leading-relaxed">
                    {modal.message}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Footer Buttons Actions */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end space-x-3">
              {modal.isConfirm ? (
                <>
                  <button
                    onClick={() => modal.resolve(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-100 active:scale-95 transition-all text-sm flex items-center"
                  >
                    <X size={16} className="mr-1.5" />
                    Cancel
                  </button>
                  <button
                    onClick={() => modal.resolve(true)}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark active:scale-95 transition-all text-sm flex items-center shadow-sm"
                  >
                    <Check size={16} className="mr-1.5" />
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => modal.resolve(true)}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark active:scale-95 transition-all text-sm flex items-center shadow-sm"
                >
                  <Check size={16} className="mr-1.5" />
                  Okay
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </AlertConfirmContext.Provider>
  );
};

export const useAlertConfirm = () => {
  const context = useContext(AlertConfirmContext);
  if (context === undefined) {
    throw new Error('useAlertConfirm must be used within an AlertConfirmProvider');
  }
  return context;
};
