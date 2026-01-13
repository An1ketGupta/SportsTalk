"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { FiCheck, FiX, FiInfo, FiAlertTriangle } from "react-icons/fi";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

const toastIcons: Record<ToastType, ReactNode> = {
    success: <FiCheck className="w-5 h-5" />,
    error: <FiX className="w-5 h-5" />,
    info: <FiInfo className="w-5 h-5" />,
    warning: <FiAlertTriangle className="w-5 h-5" />,
};

const toastColors: Record<ToastType, string> = {
    success: "bg-green-500/20 border-green-500/30 text-green-400",
    error: "bg-red-500/20 border-red-500/30 text-red-400",
    info: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg animate-slide-in ${toastColors[toast.type]}`}
                        style={{ animation: "slideIn 0.3s ease-out" }}
                    >
                        <div className="shrink-0">{toastIcons[toast.type]}</div>
                        <p className="text-sm font-medium text-white">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <FiX className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                ))}
            </div>

            <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </ToastContext.Provider>
    );
}
