import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFont, useTheme } from "@/features/accessibility/hooks";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

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
        className="flex-1 bg-white dark:bg-zinc-900"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 bg-white dark:bg-zinc-900"
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-[#2F3B69] px-5 pb-20 pt-5">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Ionicons name={icon} size={28} color="#FFDE59" />
            </View>

            <AccessibleText className="mt-5 text-sm font-atkinson text-[#F6F7FB]">
              Área da empresa
            </AccessibleText>
            <AccessibleText className="mt-1 text-3xl font-atkinson-bold text-white">
              {title}
            </AccessibleText>
            <AccessibleText className="mt-2 text-base font-atkinson leading-6 text-[#F6F7FB]">
              {subtitle}
            </AccessibleText>
          </View>

          <View className="-mt-12 rounded-t-[50px] bg-white dark:bg-zinc-900 px-5 pt-8">
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
  const { fontScale } = useFont();
  const { isDarkMode } = useTheme();

  return (
    <View className="mb-5">
      <AccessibleText className="mb-2 text-sm font-atkinson-bold text-[#2F3B69] dark:text-white">
        {label}
      </AccessibleText>
      <TextInput
        className={`rounded-2xl border border-[#E8EAF3] dark:border-zinc-700 bg-[#F6F7FB] dark:bg-zinc-800 px-4 text-base font-atkinson text-[#2F3B69] dark:text-white ${
          multiline ? "min-h-[120px] py-4" : "py-4"
        }`}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? "#a1a1aa" : "#666"}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={{ fontSize: 16 * fontScale }}
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
        isSelected ? "bg-[#2F3B69]" : "bg-[#F6F7FB] dark:bg-zinc-800"
      }`}
      activeOpacity={0.85}
      onPress={() => onPress(value)}
    >
      <AccessibleText
        className={`text-sm font-atkinson-bold ${
          isSelected ? "text-white" : "text-[#2F3B69] dark:text-white"
        }`}
      >
        {label}
      </AccessibleText>
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
      <AccessibleText className="mb-3 text-sm font-atkinson-bold text-[#2F3B69] dark:text-white">
        {label}
      </AccessibleText>
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


type DateTimeSelectProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function getLocalDateValue(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function buildDateOptions() {
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    return {
      label: new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      value: getLocalDateValue(date),
    };
  });
}

function buildTimeOptions() {
  const options: string[] = [];

  for (let hour = 8; hour <= 22; hour += 1) {
    options.push(`${padDatePart(hour)}:00`);
    options.push(`${padDatePart(hour)}:30`);
  }

  return options;
}

function getDatePart(value: string) {
  return value ? value.slice(0, 10) : getLocalDateValue(new Date());
}

function getTimePart(value: string) {
  return value ? value.slice(11, 16) : "19:00";
}

function formatDateTimeValue(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function DateTimeSelect({
  label,
  value,
  placeholder,
  onChange,
}: DateTimeSelectProps) {
  const { isDarkMode } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getDatePart(value));
  const [selectedTime, setSelectedTime] = useState(getTimePart(value));
  const dateOptions = buildDateOptions();
  const timeOptions = buildTimeOptions();

  function openModal() {
    setSelectedDate(getDatePart(value));
    setSelectedTime(getTimePart(value));
    setIsModalVisible(true);
  }

  function confirmSelection() {
    onChange(`${selectedDate}T${selectedTime}:00`);
    setIsModalVisible(false);
  }

  return (
    <View className="mb-5">
      <AccessibleText className="mb-2 text-sm font-atkinson-bold text-[#2F3B69] dark:text-white">
        {label}
      </AccessibleText>

      <TouchableOpacity
        className="flex-row items-center justify-between rounded-2xl border border-[#E8EAF3] bg-[#F6F7FB] px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800"
        activeOpacity={0.85}
        onPress={openModal}
      >
        <AccessibleText
          className={`flex-1 text-base font-atkinson ${
            value ? "text-[#2F3B69] dark:text-white" : "text-[#666] dark:text-zinc-300"
          }`}
        >
          {value ? formatDateTimeValue(value) : placeholder}
        </AccessibleText>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={isDarkMode ? "#ffffff" : "#2F3B69"}
        />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/50 px-5">
          <View className="max-h-[85%] rounded-3xl bg-white p-5 dark:bg-zinc-900">
            <AccessibleText className="text-xl font-atkinson-bold text-[#2F3B69] dark:text-white">
              Selecionar data e hora
            </AccessibleText>

            <AccessibleText className="mt-5 text-sm font-atkinson-bold text-[#2F3B69] dark:text-white">
              Data
            </AccessibleText>
            <ScrollView
              horizontal
              className="mt-3"
              showsHorizontalScrollIndicator={false}
            >
              <View className="flex-row gap-2 pr-5">
                {dateOptions.map((option) => {
                  const isSelected = option.value === selectedDate;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      className={`rounded-full px-4 py-3 ${
                        isSelected ? "bg-[#2F3B69]" : "bg-[#F6F7FB] dark:bg-zinc-800"
                      }`}
                      activeOpacity={0.85}
                      onPress={() => setSelectedDate(option.value)}
                    >
                      <AccessibleText
                        className={`text-sm font-atkinson-bold ${
                          isSelected ? "text-white" : "text-[#2F3B69] dark:text-white"
                        }`}
                      >
                        {option.label}
                      </AccessibleText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <AccessibleText className="mt-5 text-sm font-atkinson-bold text-[#2F3B69] dark:text-white">
              Hora
            </AccessibleText>
            <ScrollView className="mt-3 max-h-56" showsVerticalScrollIndicator>
              <View className="flex-row flex-wrap gap-2 pb-2">
                {timeOptions.map((option) => {
                  const isSelected = option === selectedTime;

                  return (
                    <TouchableOpacity
                      key={option}
                      className={`rounded-full px-4 py-3 ${
                        isSelected ? "bg-[#2F3B69]" : "bg-[#F6F7FB] dark:bg-zinc-800"
                      }`}
                      activeOpacity={0.85}
                      onPress={() => setSelectedTime(option)}
                    >
                      <AccessibleText
                        className={`text-sm font-atkinson-bold ${
                          isSelected ? "text-white" : "text-[#2F3B69] dark:text-white"
                        }`}
                      >
                        {option}
                      </AccessibleText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View className="mt-5 flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-xl bg-[#F6F7FB] py-4 dark:bg-zinc-800"
                activeOpacity={0.85}
                onPress={() => setIsModalVisible(false)}
              >
                <AccessibleText className="text-center text-base font-atkinson-bold text-[#2F3B69] dark:text-white">
                  Cancelar
                </AccessibleText>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-xl bg-[#2F3B69] py-4"
                activeOpacity={0.85}
                onPress={confirmSelection}
              >
                <AccessibleText className="text-center text-base font-atkinson-bold text-white">
                  Confirmar
                </AccessibleText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
      className="mb-5 flex-row items-center justify-between rounded-2xl bg-[#F6F7FB] dark:bg-zinc-800 p-4"
      activeOpacity={0.85}
      onPress={onToggle}
    >
      <View className="flex-1 pr-4">
        <AccessibleText className="text-base font-atkinson-bold text-[#2F3B69] dark:text-white">
          {label}
        </AccessibleText>
        <AccessibleText className="mt-1 text-sm font-atkinson text-[#666] dark:text-zinc-300">
          {description}
        </AccessibleText>
      </View>

      <View
        className={`h-8 w-14 justify-center rounded-full px-1 ${
          value ? "items-end bg-[#2F3B69]" : "items-start bg-[#D7DAE8]"
        }`}
      >
        <View className="h-6 w-6 rounded-full bg-white dark:bg-zinc-900" />
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
        <AccessibleText className="text-center text-base font-atkinson-bold text-white">
          {label}
        </AccessibleText>
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
        variant === "error" ? "bg-red-50 dark:bg-red-950/40" : "bg-green-50 dark:bg-green-950/40"
      }`}
    >
      <AccessibleText
        className={`text-center text-sm font-atkinson-bold ${
          variant === "error" ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"
        }`}
      >
        {message}
      </AccessibleText>
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
        <View className="rounded-3xl bg-white p-5 dark:bg-zinc-900">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#F6F7FB] dark:bg-zinc-800">
            <Ionicons name="card-outline" size={28} color="#2F3B69" />
          </View>

          <AccessibleText className="mt-5 text-2xl font-atkinson-bold text-[#2F3B69] dark:text-white">
            Checkout fictício
          </AccessibleText>
          <AccessibleText className="mt-2 text-base leading-6 font-atkinson text-[#666] dark:text-zinc-300">
            Este é apenas um fluxo simulado para validar a publicação de um
            conteúdo pago no app. Nenhuma cobrança real será feita.
          </AccessibleText>

          <View className="mt-5 rounded-2xl bg-[#F6F7FB] p-4 dark:bg-zinc-800">
            <AccessibleText className="text-sm font-atkinson text-[#666] dark:text-zinc-300">
              Produto
            </AccessibleText>
            <AccessibleText className="mt-1 text-base font-atkinson-bold text-[#2F3B69] dark:text-white">
              {productLabel}
            </AccessibleText>

            <AccessibleText className="mt-4 text-sm font-atkinson text-[#666] dark:text-zinc-300">
              Valor fictício
            </AccessibleText>
            <AccessibleText className="mt-1 text-xl font-atkinson-bold text-[#2F3B69] dark:text-white">
              {formatCurrency(amount)}
            </AccessibleText>
          </View>

          <View className="mt-5 flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl bg-[#F6F7FB] py-4 dark:bg-zinc-800"
              activeOpacity={0.85}
              disabled={isLoading}
              onPress={onCancel}
            >
              <AccessibleText className="text-center text-base font-atkinson-bold text-[#2F3B69] dark:text-white">
                Cancelar
              </AccessibleText>
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
                <AccessibleText className="text-center text-base font-atkinson-bold text-white">
                  Aprovar
                </AccessibleText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

