"use client";

import { useEffect, ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function CustomModal({
  isOpen,
  onClose,
  children,
  maxWidth = "650px",
}: CustomModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsClosing(false);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;
  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`fixed inset-0 bg-black/10 backdrop-blur-sm ${
          isClosing
            ? "animate-out fade-out duration-200"
            : "animate-in fade-in duration-200"
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-white/2 backdrop-blur-xl border border-white/5 rounded-lg shadow-2xl shadow-blue-500/10 w-full ${
          isClosing
            ? "animate-out fade-out zoom-out-95 duration-200"
            : "animate-in fade-in zoom-in-95 duration-200"
        }`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-sm opacity-70 transition-all hover:opacity-100 focus:outline-none text-white/70 hover:text-white z-10 cursor-pointer"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
