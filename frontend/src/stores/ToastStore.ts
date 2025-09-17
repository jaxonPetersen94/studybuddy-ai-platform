import { create } from 'zustand';
import { ToastProps, ToastType } from '../components/ui/Toast';

interface ToastState {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (
    message: string,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'type' | 'message'>>,
  ) => string;
  error: (
    message: string,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'type' | 'message'>>,
  ) => string;
  warning: (
    message: string,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'type' | 'message'>>,
  ) => string;
  info: (
    message: string,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'type' | 'message'>>,
  ) => string;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const { removeToast } = get();

    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },

  success: (message, options = {}) => {
    const { addToast } = get();
    return addToast({ type: 'success', message, ...options });
  },

  error: (message, options = {}) => {
    const { addToast } = get();
    return addToast({ type: 'error', message, ...options });
  },

  warning: (message, options = {}) => {
    const { addToast } = get();
    return addToast({ type: 'warning', message, ...options });
  },

  info: (message, options = {}) => {
    const { addToast } = get();
    return addToast({ type: 'info', message, ...options });
  },
}));
