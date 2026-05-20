import { TouchableOpacity, View, Text, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LinkRow({
  label,
  icon,
  url,
  isLast
}) {

  const handleOpenLink = async () => {
    if (!url) return;

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  };

  const hasLink = !!url;

  return (
    <TouchableOpacity
      onPress={handleOpenLink}
      disabled={!hasLink}
      className={`flex-row justify-between items-center py-3 ${
        !isLast ? "border-b border-zinc-200/50" : ""
      }`}
    >

      <View className="flex-row items-center">

        <Ionicons
          name={icon}
          size={20}
          color={hasLink ? "#002b5b" : "#bdc3c7"}
        />

        <Text className="text-zinc-500 text-sm ml-2">
          {label}
        </Text>

      </View>

      <View className="flex-row items-center">

        <Text
          className={`font-semibold text-sm ${hasLink ? "text-blue-600" : "text-zinc-400"}`}
        >
          {hasLink ? "Acessar perfil" : "Não informado"}
        </Text>

        {hasLink && (
          <Ionicons name="open-outline" size={14} color="#2563eb" />
        )}

      </View>

    </TouchableOpacity>
  );
}