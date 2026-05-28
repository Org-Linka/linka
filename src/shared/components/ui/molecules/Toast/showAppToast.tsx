import ToastMessage from "react-native-toast-message";

export type AppToastVariant = "success" | "error" | "info" | "warning";

export type AppToastOptions = {
  variant?: AppToastVariant;
  title: string;
  description?: string;
  duration?: number;
};

const toastTypeByVariant: Record<AppToastVariant, string> = {
  success: "appSuccess",
  error: "appError",
  info: "appInfo",
  warning: "appWarning",
};

export function showAppToast({
  variant = "info",
  title,
  description,
  duration = 3200,
}: AppToastOptions) {
  ToastMessage.show({
    type: toastTypeByVariant[variant],
    text1: title,
    text2: description,
    visibilityTime: duration,
    autoHide: duration !== 0,
    topOffset: 48,
  });
}