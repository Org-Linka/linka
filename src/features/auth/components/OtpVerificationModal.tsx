import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type OtpVerificationModalProps = {
  visible: boolean;
  code: string;
  isLoading?: boolean;
  isResending?: boolean;
  emailLabel?: string;
  onChangeCode: (code: string) => void;
  onConfirm: () => void;
  onResend: () => void;
  onClose: () => void;
};

const OTP_LENGTH = 6;

const COLORS = {
  brand: "#2F3B69",
  brandDark: "#1F2A56",
  brandMuted: "#66708F",
  brandSoft: "#AAB3D1",
  cardBorder: "#E8ECF5",
  inputLine: "#C9D0E3",
  placeholder: "#B8C0D8",
  helper: "#8A93AD",
  white: "#FFFFFF",
} as const;

export function OtpVerificationModal({
  visible,
  code,
  isLoading = false,
  isResending = false,
  emailLabel,
  onChangeCode,
  onConfirm,
  onResend,
  onClose,
}: OtpVerificationModalProps) {
  const inputRef = useRef<TextInput>(null);

  function handleChangeCode(value: string) {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChangeCode(onlyNumbers);
  }

  const isConfirmDisabled =
    isLoading || isResending || code.length !== OTP_LENGTH;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center bg-black/45 px-4">
          <View className="relative w-full max-w-[390px] rounded-[32px] border border-[#E8ECF5] bg-white px-7 pb-7 pt-8">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              disabled={isLoading}
              className="absolute right-5 top-5 z-10 h-9 w-9 items-center justify-center rounded-full bg-[#F5F7FC]"
            >
              <Ionicons name="close" size={18} color={COLORS.brand} />
            </TouchableOpacity>

            <View className="items-center">
              <Ionicons name="mail-outline" size={42} color={COLORS.brand} />

              <Text className="mt-6 text-center text-[24px] leading-[29px] font-atkinson text-[#1F2A56]">
                Código de verificação
              </Text>

              <Text className="mt-3 max-w-[285px] text-center text-[14px] leading-5 font-atkinson text-[#66708F]">
                {emailLabel
                  ? `Digite o código de ${OTP_LENGTH} dígitos enviado para ${emailLabel}.`
                  : `Digite o código de ${OTP_LENGTH} dígitos enviado para o seu e-mail.`}
              </Text>
            </View>

            <View className="mt-8 items-center">
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={handleChangeCode}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                autoFocus={visible}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                placeholder="XXXXXX"
                placeholderTextColor={COLORS.placeholder}
                editable={!isLoading}
                selectionColor={COLORS.brand}
                className="w-[190px] bg-transparent pb-2 text-center text-[28px] tracking-[10px] font-atkinson text-[#1F2A56]"
                style={styles.codeInput}
              />

              <Text className="mt-3 text-center text-[12px] font-atkinson text-[#8A93AD]">
                Insira os 6 números recebidos no e-mail
              </Text>
            </View>

            <TouchableOpacity
              className={`mt-7 h-[56px] items-center justify-center rounded-[18px] ${
                isConfirmDisabled ? "bg-[#AAB3D1]" : "bg-[#2F3B69]"
              }`}
              disabled={isConfirmDisabled}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text className="text-[16px] font-atkinson-bold text-white">
                  Verificar código
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-5 items-center"
              disabled={isLoading || isResending}
              onPress={onResend}
              activeOpacity={0.7}
            >
              {isResending ? (
                <ActivityIndicator size="small" color={COLORS.brand} />
              ) : (
                <Text className="text-[14px] font-atkinson text-[#2F3B69]">
                  Enviar novamente
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  codeInput: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputLine,
    outlineStyle: "none",
    boxShadow: "none",
  } as any,
});