import ToastMessage from "react-native-toast-message";

export type AppToastVariant = "success" | "error" | "info" | "warning";

type AppToastType = "appSuccess" | "appError" | "appInfo" | "appWarning";

type AppToastDefault = {
  type: AppToastType;
  title: string;
  description: string;
  duration: number;
};

export type AppToastOptions = {
  variant?: AppToastVariant | "default" | null;
  title?: string | null;
  description?: string | null;
  message?: string | null;
  duration?: number;
};

export const appToastDefaults: Record<AppToastVariant, AppToastDefault> = {
  success: {
    type: "appSuccess",
    title: "Tudo certo",
    description: "A ação foi concluída com sucesso.",
    duration: 3200,
  },
  error: {
    type: "appError",
    title: "Não foi possível concluir",
    description: "Tente novamente em alguns instantes.",
    duration: 5200,
  },
  info: {
    type: "appInfo",
    title: "Informação",
    description: "Há uma atualização disponível para você.",
    duration: 3600,
  },
  warning: {
    type: "appWarning",
    title: "Atenção",
    description: "Revise as informações antes de continuar.",
    duration: 4200,
  },
};

export function normalizeAppToastVariant(variant?: string | null): AppToastVariant {
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

export function getErrorToastMessage(
  error: unknown,
  fallback = appToastDefaults.error.description,
) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "").trim();

    if (message) {
      return message;
    }
  }

  return fallback;
}

export function showAppToast({
  variant = "info",
  title,
  description,
  message,
  duration,
}: AppToastOptions) {
  const normalizedVariant = normalizeAppToastVariant(variant);
  const defaults = appToastDefaults[normalizedVariant];
  const visibilityTime = duration ?? defaults.duration;

  ToastMessage.show({
    type: defaults.type,
    text1: normalizeToastText(title) ?? defaults.title,
    text2:
      normalizeToastText(description) ??
      normalizeToastText(message) ??
      defaults.description,
    visibilityTime,
    autoHide: visibilityTime !== 0,
    topOffset: 48,
  });
}

function normalizeToastText(value?: string | null) {
  const text = value?.trim();
  return text ? text : undefined;
}
