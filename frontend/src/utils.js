// utils.js
import { toast, Toaster } from "sonner";
import React from "react";

// Success toast
export const handleSuccess = (msg) => {
  toast.success(msg, {
    duration: 2500,
    className: "my-toast",
  });
};

// Error toast
export const handleError = (msg) => {
  toast.error(msg, {
    duration: 2500,
    className: "my-toast",
  });
};

// Info toast
export const handleInfo = (msg) => {
  toast.info(msg, {
    duration: 3000,
    className: "my-toast",
  });
};

// Warning toast
export const handleWarning = (msg) => {
  toast.warning(msg, {
    duration: 3000,
    className: "my-toast",
  });
};

export const ToastContainer = () => {
  return React.createElement(Toaster, {
    position: "top-right",
    toastOptions: {
      style: {
        background: "var(--background, #fff)",
        color: "var(--text, #333)",
        border: "1px solid var(--border, #eaeaea)",
      },
    },
    closeButton: true,
    richColors: true,
    expand: true,
  });
};
