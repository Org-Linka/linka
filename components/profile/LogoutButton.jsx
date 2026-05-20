import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

export default function LogoutButton() {

  return (
    <TouchableOpacity
      onPress={() => router.push("/login")}
      className="mt-6 mb-10 flex-row items-center justify-center bg-zinc-100 p-4 rounded-2xl border border-zinc-200"
    >

      <Ionicons name="log-out-outline" size={20} color="#ef4444" />

      <Text className="ml-2 text-red-500 font-bold">
        Sair da Conta
      </Text>

    </TouchableOpacity>
  );
}