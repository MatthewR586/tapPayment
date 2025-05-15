// Modal.jsx
import React, { useEffect } from "react";

export default function Modal({ isOpen, onClose, children }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      {/* Modal container - responsive sizing */}
      <div className={`
        bg-white rounded-2xl shadow-lg w-full
        relative
        max-h-[90vh] overflow-y-auto
        /* Mobile styles */
        md:max-w-md md:p-6
        /* Mobile fullscreen */
        h-[100vh] max-w-[100vw] 
        md:h-auto md:rounded-2xl
      `}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black hover:text-gray-600 text-2xl"
        >
          &times;
        </button>
        <div className="p-4 md:p-0">
          {children}
        </div>
      </div>
    </div>
  );
}