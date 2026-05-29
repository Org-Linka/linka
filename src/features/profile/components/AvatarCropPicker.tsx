import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type CropAspect = [number, number] | null;

export type AvatarCropPreset = {
  id: "free" | "square" | "portrait" | "landscape";
  label: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  aspect: CropAspect;
};

export const AVATAR_CROP_PRESETS: AvatarCropPreset[] = [
  {
    id: "free",
    label: "Livre",
    description: "Você ajusta sem trava de proporção.",
    icon: "scan-outline",
    aspect: null,
  },
  {
    id: "square",
    label: "Quadrado 1:1",
    description: "Ideal para foto de perfil centralizada.",
    icon: "square-outline",
    aspect: [1, 1],
  },
  {
    id: "portrait",
    label: "Retrato 4:5",
    description: "Mais altura para enquadrar rosto e tronco.",
    icon: "phone-portrait-outline",
    aspect: [4, 5],
  },
  {
    id: "landscape",
    label: "Paisagem 16:9",
    description: "Mais largura para fotos abertas.",
    icon: "tablet-landscape-outline",
    aspect: [16, 9],
  },
];

type AvatarCropPickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (preset: AvatarCropPreset) => void;
};

export function AvatarCropPicker({
  visible,
  onClose,
  onSelect,
}: AvatarCropPickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/45" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-white px-5 pb-8 pt-5"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-zinc-200" />

          <Text className="text-lg font-atkinson-bold text-zinc-900">
            Como você quer recortar a foto?
          </Text>
          <Text className="mt-1 text-sm text-zinc-500">
            Escolha um modo e ajuste o recorte antes de salvar.
          </Text>

          <View className="mt-4 gap-3">
            {AVATAR_CROP_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                activeOpacity={0.8}
                onPress={() => onSelect(preset)}
                className="flex-row items-center rounded-2xl border border-zinc-200 px-4 py-3"
              >
                <View className="mr-3 rounded-xl bg-zinc-100 p-2.5">
                  <Ionicons name={preset.icon} size={18} color="#27272a" />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-bold text-zinc-900">
                    {preset.label}
                  </Text>
                  <Text className="mt-0.5 text-xs text-zinc-500">
                    {preset.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
