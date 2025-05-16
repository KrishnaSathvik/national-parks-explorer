import React, { createContext, useContext, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContext = createContext();

/**
 * Hook to access the custom toast context.
 */
export const useToast = () => useContext(ToastContext);

/**
 * ToastProvider wraps the app and provides the showToast function.
 */
export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, type = "info") => {
    const toastTypes = {
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
    };

    (toastTypes[type] || toast.info)(message);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </ToastContext.Provider>
  );
};
