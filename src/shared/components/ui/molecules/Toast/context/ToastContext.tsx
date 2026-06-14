import { createContext, type ReactNode, useContext, useMemo } from "react";
import ToastMessage from "react-native-toast-message";

import type { ToastOptions } from "../Toast.types";
import {
  normalizeAppToastVariant,
  showAppToast,
  type AppToastOptions,
} from "../showAppToast";

type ToastContextValue = {
  show: (content: ReactNode | string, options?: ToastOptions) => string;
  update: (
    id: string,
    content: ReactNode | string,
    options?: ToastOptions,
  ) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  showToast: (options: AppToastOptions) => void;
  hideToast: () => void;
};

type ToastProviderProps = {
  children: ReactNode;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function getToastTitle(content: ReactNode | string, options?: ToastOptions) {
  if (options?.title) {
    return options.title;
  }

  if (typeof content === "string") {
    return content;
  }

  return undefined;
}

function getToastDescription(options?: ToastOptions) {
  return options?.description ?? options?.message;
}

function showLegacyToast(content: ReactNode | string, options?: ToastOptions) {
  showAppToast({
    variant: normalizeAppToastVariant(options?.variant ?? options?.type),
    title: getToastTitle(content, options),
    description: getToastDescription(options),
    duration: options?.duration,
  });
}

export function ToastProvider({ children }: ToastProviderProps) {
  const value = useMemo<ToastContextValue>(
    () => ({
      show: (content, options) => {
        const id = String(Date.now());
        showLegacyToast(content, options);
        return id;
      },

      update: (_id, content, options) => {
        showLegacyToast(content, options);
      },

      dismiss: () => {
        ToastMessage.hide();
      },

      dismissAll: () => {
        ToastMessage.hide();
      },

      showToast: (options) => {
        showAppToast(options);
      },

      hideToast: () => {
        ToastMessage.hide();
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast precisa ser usado dentro de ToastProvider.");
  }

  return context;
}
