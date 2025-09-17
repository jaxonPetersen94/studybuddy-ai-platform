import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  position = 'top-center',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 200);
  };

  const typeConfigs = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-success',
      borderColor: 'border-l-success',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-error',
      borderColor: 'border-l-error',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-warning',
      borderColor: 'border-l-warning',
    },
    info: {
      icon: Info,
      iconColor: 'text-info',
      borderColor: 'border-l-info',
    },
  } as const;

  const config = typeConfigs[type];
  const IconComponent = config.icon;

  const getAnimationClasses = () => {
    const baseClasses = 'transform transition-all duration-300 ease-out';

    if (isLeaving) {
      const exitAnimations = {
        'top-center': 'opacity-0 scale-95 -translate-y-2',
        'bottom-center': 'opacity-0 scale-95 translate-y-2',
        'top-left': 'opacity-0 scale-95 -translate-x-2',
        'bottom-left': 'opacity-0 scale-95 -translate-x-2',
        'top-right': 'opacity-0 scale-95 translate-x-2',
        'bottom-right': 'opacity-0 scale-95 translate-x-2',
      };
      return `${baseClasses} ${exitAnimations[position]}`;
    }

    if (isVisible) {
      return `${baseClasses} opacity-100 scale-100 translate-x-0 translate-y-0`;
    }

    const entryAnimations = {
      'top-center': 'opacity-0 scale-95 -translate-y-2',
      'bottom-center': 'opacity-0 scale-95 translate-y-2',
      'top-left': 'opacity-0 scale-95 -translate-x-2',
      'bottom-left': 'opacity-0 scale-95 -translate-x-2',
      'top-right': 'opacity-0 scale-95 translate-x-2',
      'bottom-right': 'opacity-0 scale-95 translate-x-2',
    };
    return `${baseClasses} ${entryAnimations[position]}`;
  };

  return (
    <div
      className={`
        ${getAnimationClasses()}
        w-80 max-w-sm mb-3
        bg-base-100 border border-base-300/50 ${config.borderColor}
        border-l-4 rounded-box shadow-lg p-4 group relative
      `}
    >
      <div className="flex items-start space-x-3">
        <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
          <IconComponent className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-medium text-base-content mb-1 leading-tight">
              {title}
            </div>
          )}
          <div className="text-xs text-base-content/70 leading-relaxed">
            {message}
          </div>
        </div>

        <button
          onClick={handleClose}
          className="opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs p-1 flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Progress Bar using Tailwind animations */}
      {duration > 0 && (
        <div className="mt-3 -mx-4 -mb-4">
          <div className="h-1 bg-base-200/50 rounded-b-box overflow-hidden">
            <div
              className={`h-full ${config.iconColor} bg-current transition-all ease-linear animate-[shrink_${duration}ms_linear_forwards]`}
              style={{
                animation: `shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: ToastProps['position'];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-center',
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4 items-end',
    'top-left': 'top-4 left-4 items-start',
    'bottom-right': 'bottom-4 right-4 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  } as const;

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed z-[9999] flex flex-col ${positionClasses[position]} pointer-events-none`}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} position={position} />
        </div>
      ))}
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAll = () => setToasts([]);

  const success = (
    message: string,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'type' | 'message'>>,
  ) => addToast({ type: 'success', message, ...options });

  const error = (
    message: string,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'type' | 'message'>>,
  ) => addToast({ type: 'error', message, ...options });

  const warning = (
    message: string,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'type' | 'message'>>,
  ) => addToast({ type: 'warning', message, ...options });

  const info = (
    message: string,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'type' | 'message'>>,
  ) => addToast({ type: 'info', message, ...options });

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
};

// Minimal keyframe for progress bar (still needed as Tailwind doesn't have width shrinking animation)
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);

export default Toast;
