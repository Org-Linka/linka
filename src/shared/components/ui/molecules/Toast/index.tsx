import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Text, View } from "react-native";
import ToastMessage, {
  BaseToastProps,
  ToastConfig,
} from "react-native-toast-message";

import type { ToastOptions, ToastProps } from "./Toast.types";
import {
  showAppToast,
  type AppToastOptions,
  type AppToastVariant,
} from "./showAppToast";

const COLORS = {
  brand: "#2F3B69",
  muted: "#66708F",

  successBg: "#F4FCF7",
  successBorder: "#D8F1E3",
  successIconBg: "#E7F8EE",
  successIcon: "#1F8A52",
  successText: "#1D5F3D",

  errorBg: "#FFF6F5",
  errorBorder: "#FAD4CF",
  errorIconBg: "#FEE9E7",
  errorIcon: "#B42318",
  errorText: "#912018",

  infoBg: "#F7F8FF",
  infoBorder: "#DDE4FF",
  infoIconBg: "#EEF2FF",
  infoIcon: "#2F3B69",
  infoText: "#2F3B69",

  warningBg: "#FFFBEB",
  warningBorder: "#FDE68A",
  warningIconBg: "#FEF3C7",
  warningIcon: "#B7791F",
  warningText: "#854D0E",
} as const;

type ToastVariantStyle = {
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  borderColor: string;
  iconBackgroundColor: string;
  iconColor: string;
  textColor: string;
};

const toastStyles: Record<
  "appSuccess" | "appError" | "appInfo" | "appWarning",
  ToastVariantStyle
> = {
  appSuccess: {
    icon: "checkmark",
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.successBorder,
    iconBackgroundColor: COLORS.successIconBg,
    iconColor: COLORS.successIcon,
    textColor: COLORS.successText,
  },
  appError: {
    icon: "close",
    backgroundColor: COLORS.errorBg,
    borderColor: COLORS.errorBorder,
    iconBackgroundColor: COLORS.errorIconBg,
    iconColor: COLORS.errorIcon,
    textColor: COLORS.errorText,
  },
  appInfo: {
    icon: "information",
    backgroundColor: COLORS.infoBg,
    borderColor: COLORS.infoBorder,
    iconBackgroundColor: COLORS.infoIconBg,
    iconColor: COLORS.infoIcon,
    textColor: COLORS.infoText,
  },
  appWarning: {
    icon: "alert",
    backgroundColor: COLORS.warningBg,
    borderColor: COLORS.warningBorder,
    iconBackgroundColor: COLORS.warningIconBg,
    iconColor: COLORS.warningIcon,
    textColor: COLORS.warningText,
  },
};

function AppToast({
  text1,
  text2,
  variant,
}: BaseToastProps & {
  variant: keyof typeof toastStyles;
}) {
  const style = toastStyles[variant];

  return (
    <View className="w-full items-center px-6">
      <View
        className="w-full max-w-[340px] flex-row items-center gap-3 rounded-[10px] border px-4 py-3"
        style={{
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        <View
          className="h-6 w-6 items-center justify-center rounded-full"
          style={{
            backgroundColor: style.iconBackgroundColor,
          }}
        >
          <Ionicons name={style.icon} size={13} color={style.iconColor} />
        </View>

        <View className="flex-1">
          <Text
            className="font-atkinson-bold text-[12px] leading-4"
            style={{ color: style.textColor }}
            numberOfLines={1}
          >
            {text1}
          </Text>

          {text2 ? (
            <Text
              className="mt-0.5 font-atkinson text-[11px] leading-4"
              style={{ color: COLORS.muted }}
              numberOfLines={2}
            >
              {text2}
            </Text>
          ) : null}
        </View>

        <Ionicons name="close" size={14} color={COLORS.muted} />
      </View>
    </View>
  );
}

const toastConfig: ToastConfig = {
  appSuccess: (props) => <AppToast {...props} variant="appSuccess" />,
  appError: (props) => <AppToast {...props} variant="appError" />,
  appInfo: (props) => <AppToast {...props} variant="appInfo" />,
  appWarning: (props) => <AppToast {...props} variant="appWarning" />,
};

export const ToastProviderWithViewport: React.FC<ToastProps> = ({
  children,
}) => {
  return (
    <>
      {children}
      <ToastMessage config={toastConfig} />
    </>
  );
};

function normalizeToastVariant(options?: ToastOptions): AppToastVariant {
  const variant =
    (options as { variant?: AppToastVariant; type?: AppToastVariant } | undefined)
      ?.variant ??
    (options as { variant?: AppToastVariant; type?: AppToastVariant } | undefined)
      ?.type ??
    "info";

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

function getToastDescription(options?: ToastOptions) {
  return (
    (options as { description?: string; message?: string } | undefined)
      ?.description ??
    (options as { description?: string; message?: string } | undefined)?.message
  );
}

function getToastDuration(options?: ToastOptions) {
  return (options as { duration?: number } | undefined)?.duration;
}

export const Toast = {
  show: (content: React.ReactNode | string, options?: ToastOptions): string => {
    showAppToast({
      variant: normalizeToastVariant(options),
      title: typeof content === "string" ? content : "Notificação",
      description: getToastDescription(options),
      duration: getToastDuration(options),
    });

    return String(Date.now());
  },

  update: (
    _id: string,
    content: React.ReactNode | string,
    options?: ToastOptions,
  ): void => {
    showAppToast({
      variant: normalizeToastVariant(options),
      title: typeof content === "string" ? content : "Notificação",
      description: getToastDescription(options),
      duration: getToastDuration(options),
    });
  },

  dismiss: (_id: string): void => {
    ToastMessage.hide();
  },

  dismissAll: (): void => {
    ToastMessage.hide();
  },
};

export { showAppToast };
export type { ToastOptions, ToastProps, AppToastOptions, AppToastVariant };