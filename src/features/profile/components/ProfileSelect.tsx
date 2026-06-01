import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
      <Text className="mb-2 text-sm font-semibold text-zinc-700">
        {label}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={handleOpen}
        className={`min-h-[52px] flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
          disabled
            ? "border-zinc-200 bg-zinc-100"
            : "border-zinc-200 bg-white"
        }`}
      >
        <Text
          className={`flex-1 text-base ${
            selectedOption ? "text-zinc-900" : "text-zinc-400"
          }`}
        >
          {selectedOption?.label ?? placeholder}
        </Text>

        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? "#A1A1AA" : "#002B5B"}
        />
      </TouchableOpacity>

      {helperText ? (
        <Text className="mt-2 text-xs text-zinc-500">{helperText}</Text>
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
          <Pressable className="max-h-[75%] rounded-t-[32px] bg-white px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-[#002B5B]">
                {label}
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsModalVisible(false)}
              >
                <Text className="text-sm font-bold text-[#002B5B]">
                  Fechar
                </Text>
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
                        ? "border-[#002B5B] bg-[#EAF2FB]"
                        : "border-zinc-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`flex-1 text-base ${
                        isSelected
                          ? "font-bold text-[#002B5B]"
                          : "text-zinc-700"
                      }`}
                    >
                      {option.label}
                    </Text>

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
                <View className="rounded-2xl bg-zinc-100 px-4 py-5">
                  <Text className="text-center text-sm text-zinc-500">
                    Nenhuma opção disponível.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}