import { createContext, type ReactNode, useContext, useMemo } from "react";

import {
  showAppToast,
  type AppToastOptions,
  type AppToastVariant,
} from "../showAppToast";

type LegacyToastOptions = {
  type?: AppToastVariant;
  variant?: AppToastVariant;
  title?: string;
  description?: string;
  message?: string;
  duration?: number;
};

type ToastContextValue = {
  show: (content: ReactNode | string, options?: LegacyToastOptions) => string;
  update: (
    id: string,
    content: ReactNode | string,
    options?: LegacyToastOptions,
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

function normalizeToastVariant(options?: LegacyToastOptions): AppToastVariant {
  const variant = options?.variant ?? options?.type ?? "info";

  if (
    variant === "success" ||
    variant === "error" ||
    variant === "info" ||
    variant === "warning"
  ) {
    return variant;
  }

  return "info";
}

function getToastTitle(content: ReactNode | string, options?: LegacyToastOptions) {
  if (options?.title) {
    return options.title;
  }

  if (typeof content === "string") {
    return content;
  }

  return "Notificação";
}

function getToastDescription(options?: LegacyToastOptions) {
  return options?.description ?? options?.message;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const value = useMemo<ToastContextValue>(
    () => ({
      show: (content, options) => {
        const id = String(Date.now());

        showAppToast({
          variant: normalizeToastVariant(options),
          title: getToastTitle(content, options),
          description: getToastDescription(options),
          duration: options?.duration,
        });

        return id;
      },

      update: (_id, content, options) => {
        showAppToast({
          variant: normalizeToastVariant(options),
          title: getToastTitle(content, options),
          description: getToastDescription(options),
          duration: options?.duration,
        });
      },

      dismiss: (_id) => {
        // O toast da biblioteca fecha sozinho ou pelo ToastMessage.hide() no index.tsx.
      },

      dismissAll: () => {
        // O toast da biblioteca fecha sozinho ou pelo ToastMessage.hide() no index.tsx.
      },

      showToast: (options) => {
        showAppToast(options);
      },

      hideToast: () => {
        // Mantido só para compatibilidade com código antigo.
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