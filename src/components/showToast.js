// src/components/showToast.js
import { toast } from "react-toastify";

/**
 * Display a styled toast notification
 * 
 * @param {string} message - The message to show
 * @param {"info"|"success"|"warning"|"error"} [type="info"] - The type of toast
 */
export const showToast = (message, type = "info") => {
  const config = {
    position: "top-center",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  };

  switch (type) {
    case "success":
      toast.success(message, config);
      break;
    case "error":
      toast.error(message, config);
      break;
    case "warning":
      toast.warning(message, config);
      break;
    default:
      toast.info(message, config);
  }
};
