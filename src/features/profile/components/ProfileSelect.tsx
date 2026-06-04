import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

export type ProfileSelectOption = {
  label: string;
  value: string;
};

type ProfileSelectProps = {
  label: string;
  placeholder: string;
  value: string;
  options: ProfileSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  helperText?: string;
};

export function ProfileSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  helperText,
}: ProfileSelectProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  function handleOpen() {
    if (disabled) {
      return;
    }

    setIsModalVisible(true);
  }

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setIsModalVisible(false);
  }

  return (
    <View className="mb-4">
      <AccessibleText 
        size={14}
        className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200"
      >
        {label}
      </AccessibleText>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={handleOpen}
        className={`min-h-[52px] flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
          disabled
            ? "border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
            : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
        }`}
      >
        <AccessibleText
          size={16}
          className={`flex-1 text-base ${
            selectedOption ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          {selectedOption?.label ?? placeholder}
        </AccessibleText>

        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? "#A1A1AA" : "#002B5B"}
        />
      </TouchableOpacity>

      {helperText ? (
        <AccessibleText size={12} className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {helperText}
        </AccessibleText>
      ) : null}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable className="max-h-[75%] rounded-t-[32px] bg-white px-5 pb-8 pt-5 dark:bg-zinc-950">
            <View className="mb-4 flex-row items-center justify-between">
              <AccessibleText size={20} className="text-xl font-bold text-[#002B5B] dark:text-white">
                {label}
              </AccessibleText>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsModalVisible(false)}
              >
                <AccessibleText size={14} className="text-sm font-bold text-[#002B5B]">
                  Fechar
                </AccessibleText>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.8}
                    onPress={() => handleSelect(option.value)}
                    className={`mb-2 flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
                      isSelected
                        ? "border-[#002B5B] bg-[#EAF2FB] dark:border-blue-400 dark:bg-blue-950"
                        : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                    }`}
                  >
                    <AccessibleText
                      size={16}
                      className={`flex-1 text-base ${
                        isSelected
                          ? "font-bold text-[#002B5B] dark:text-blue-200"
                          : "text-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {option.label}
                    </AccessibleText>

                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#002B5B"
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}

              {options.length === 0 ? (
                <View className="rounded-2xl bg-zinc-100 px-4 py-5 dark:bg-zinc-900">
                  <AccessibleText size={14} className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Nenhuma opção disponível.
                  </AccessibleText>
                </View>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}