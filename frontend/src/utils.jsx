// utils.js
import { toast, Toaster } from "react-hot-toast";
import React from "react";

// ✅ Success toast with minimal dismiss
export const handleSuccess = (msg) => {
  toast.success(
    (t) => (
      <div className="flex items-start justify-between gap-2">
        <span>{msg}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-gray-400 hover:text-gray-600 transition text-lg leading-none"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    ),
    {
      duration: 5000,
      className: "my-toast",
    }
  );
};

// ❌ Error toast with minimal dismiss
export const handleError = (msg) => {
  toast.error(
    (t) => (
      <div className="flex items-start justify-between gap-2">
        <span>{msg}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-gray-400 hover:text-gray-600 transition text-lg leading-none"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    ),
    {
      duration: 5000,
      className: "my-toast",
    }
  );
};

// 📦 Toast container
export const ToastContainer = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      className: "my-toast",
      style: {
        background: "var(--background, #fff)",
        color: "var(--text, #333)",
        border: "1px solid var(--border, #eaeaea)",
      },
    }}
  />
);
