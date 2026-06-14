import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function formatCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `R$ ${safeValue.toFixed(2).replace(".", ",")}`;
}

type CompanyCreationLayoutProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  bottomPadding: number;
};

export function CompanyCreationLayout({
  title,
  subtitle,
  icon,
  children,
  bottomPadding,
}: CompanyCreationLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#2F3B69]" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-[#2F3B69] px-5 pb-20 pt-5">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Ionicons name={icon} size={28} color="#FFDE59" />
            </View>

            <Text className="mt-5 text-sm font-atkinson text-[#F6F7FB]">
              Área da empresa
            </Text>
            <Text className="mt-1 text-3xl font-atkinson-bold text-white">
              {title}
            </Text>
            <Text className="mt-2 text-base font-atkinson leading-6 text-[#F6F7FB]">
              {subtitle}
            </Text>
          </View>

          <View className="-mt-12 rounded-t-[50px] bg-white px-5 pt-8">
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
};

export function FormField({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType,
  multiline = false,
}: FormFieldProps) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-atkinson-bold text-[#2F3B69]">
        {label}
      </Text>
      <TextInput
        className={`rounded-2xl border border-[#E8EAF3] bg-[#F6F7FB] px-4 text-base font-atkinson text-[#2F3B69] ${
          multiline ? "min-h-[120px] py-4" : "py-4"
        }`}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#666"
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

type OptionChipProps<TValue extends string> = {
  label: string;
  value: TValue;
  selectedValue: TValue;
  onPress: (value: TValue) => void;
};

export function OptionChip<TValue extends string>({
  label,
  value,
  selectedValue,
  onPress,
}: OptionChipProps<TValue>) {
  const isSelected = selectedValue === value;

  return (
    <TouchableOpacity
      className={`rounded-full px-4 py-3 ${
        isSelected ? "bg-[#2F3B69]" : "bg-[#F6F7FB]"
      }`}
      activeOpacity={0.85}
      onPress={() => onPress(value)}
    >
      <Text
        className={`text-sm font-atkinson-bold ${
          isSelected ? "text-white" : "text-[#2F3B69]"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type OptionGroupProps<TValue extends string> = {
  label: string;
  options: { label: string; value: TValue }[];
  selectedValue: TValue;
  onChange: (value: TValue) => void;
};

export function OptionGroup<TValue extends string>({
  label,
  options,
  selectedValue,
  onChange,
}: OptionGroupProps<TValue>) {
  return (
    <View className="mb-5">
      <Text className="mb-3 text-sm font-atkinson-bold text-[#2F3B69]">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => (
          <OptionChip
            key={option.value}
            label={option.label}
            value={option.value}
            selectedValue={selectedValue}
            onPress={onChange}
          />
        ))}
      </View>
    </View>
  );
}

type ToggleRowProps = {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
};

export function ToggleRow({ label, description, value, onToggle }: ToggleRowProps) {
  return (
    <TouchableOpacity
      className="mb-5 flex-row items-center justify-between rounded-2xl bg-[#F6F7FB] p-4"
      activeOpacity={0.85}
      onPress={onToggle}
    >
      <View className="flex-1 pr-4">
        <Text className="text-base font-atkinson-bold text-[#2F3B69]">
          {label}
        </Text>
        <Text className="mt-1 text-sm font-atkinson text-[#666]">
          {description}
        </Text>
      </View>

      <View
        className={`h-8 w-14 justify-center rounded-full px-1 ${
          value ? "items-end bg-[#2F3B69]" : "items-start bg-[#D7DAE8]"
        }`}
      >
        <View className="h-6 w-6 rounded-full bg-white" />
      </View>
    </TouchableOpacity>
  );
}

type SubmitButtonProps = {
  label: string;
  isLoading: boolean;
  onPress: () => void;
};

export function SubmitButton({ label, isLoading, onPress }: SubmitButtonProps) {
  return (
    <TouchableOpacity
      className={`mt-2 rounded-2xl py-4 ${
        isLoading ? "bg-[#666]" : "bg-[#2F3B69]"
      }`}
      activeOpacity={0.85}
      disabled={isLoading}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-center text-base font-atkinson-bold text-white">
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

type FeedbackMessageProps = {
  message: string;
  variant: "error" | "success";
};

export function FeedbackMessage({ message, variant }: FeedbackMessageProps) {
  return (
    <View
      className={`mb-5 rounded-2xl px-4 py-3 ${
        variant === "error" ? "bg-red-50" : "bg-green-50"
      }`}
    >
      <Text
        className={`text-center text-sm font-atkinson-bold ${
          variant === "error" ? "text-red-700" : "text-green-700"
        }`}
      >
        {message}
      </Text>
    </View>
  );
}

type FakeCheckoutModalProps = {
  visible: boolean;
  productLabel: string;
  amount: number;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function FakeCheckoutModal({
  visible,
  productLabel,
  amount,
  isLoading,
  onCancel,
  onConfirm,
}: FakeCheckoutModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center bg-black/50 px-5">
        <View className="rounded-3xl bg-white p-5">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#F6F7FB]">
            <Ionicons name="card-outline" size={28} color="#2F3B69" />
          </View>

          <Text className="mt-5 text-2xl font-atkinson-bold text-[#2F3B69]">
            Checkout fictício
          </Text>
          <Text className="mt-2 text-base font-atkinson leading-6 text-[#666]">
            Este é apenas um fluxo simulado para validar a publicação de um
            conteúdo pago no app.
          </Text>

          <View className="mt-5 rounded-2xl bg-[#F6F7FB] p-4">
            <Text className="text-sm font-atkinson text-[#666]">Produto</Text>
            <Text className="mt-1 text-base font-atkinson-bold text-[#2F3B69]">
              {productLabel}
            </Text>

            <Text className="mt-4 text-sm font-atkinson text-[#666]">Valor</Text>
            <Text className="mt-1 text-xl font-atkinson-bold text-[#2F3B69]">
              {formatCurrency(amount)}
            </Text>
          </View>

          <View className="mt-5 flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl bg-[#F6F7FB] py-4"
              activeOpacity={0.85}
              disabled={isLoading}
              onPress={onCancel}
            >
              <Text className="text-center text-base font-atkinson-bold text-[#2F3B69]">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 rounded-xl py-4 ${
                isLoading ? "bg-[#666]" : "bg-[#2F3B69]"
              }`}
              activeOpacity={0.85}
              disabled={isLoading}
              onPress={onConfirm}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-base font-atkinson-bold text-white">
                  Aprovar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
