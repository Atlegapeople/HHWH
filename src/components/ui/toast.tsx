'use client';

import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-vivid-green-cyan" />,
          bgColor: 'bg-gradient-to-r from-light-green-cyan/20 to-vivid-green-cyan/10',
          borderColor: 'border-l-4 border-vivid-green-cyan',
          textColor: 'text-gray-800'
        };
      case 'error':
        return {
          icon: <XCircle className="h-5 w-5 text-vivid-red" />,
          bgColor: 'bg-gradient-to-r from-vivid-red/20 to-vivid-red/10',
          borderColor: 'border-l-4 border-vivid-red',
          textColor: 'text-gray-800'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
          bgColor: 'bg-gradient-to-r from-orange-100 to-orange-50',
          borderColor: 'border-l-4 border-orange-500',
          textColor: 'text-gray-800'
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5 text-blue-500" />,
          bgColor: 'bg-gradient-to-r from-blue-100 to-blue-50',
          borderColor: 'border-l-4 border-blue-500',
          textColor: 'text-gray-800'
        };
    }
  };

  const config = getToastConfig();

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md w-full
        ${config.bgColor} ${config.borderColor}
        backdrop-blur-sm rounded-lg shadow-xl
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium leading-relaxed ${config.textColor}`}>
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast Manager Hook
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    showToast,
    ToastContainer
  };
}