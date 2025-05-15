// src/components/showToast.js
import { toast } from "react-toastify";

export const showToast = (message, type = "info") => {
  toast(message, {
    type,
    position: "top-center",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};
