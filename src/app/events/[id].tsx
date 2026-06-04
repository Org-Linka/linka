import { router, useLocalSearchParams } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

export default function EventDetailsPlaceholderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
      <View className="flex-1 justify-center gap-4 px-6">
        <AccessibleText className="text-2xl font-bold text-[#002B5B] dark:text-blue-100">
          Detalhe do evento
        </AccessibleText>
        <AccessibleText className="text-base leading-6 text-zinc-600 dark:text-zinc-300">
          A navegação para o evento já está pronta. A tela completa de detalhes e
          inscrição deve ser implementada na próxima issue.
        </AccessibleText>
        <AccessibleText className="text-sm text-zinc-500 dark:text-zinc-400">ID do evento: {id}</AccessibleText>

        <TouchableOpacity
          activeOpacity={0.85}
          className="self-start rounded-xl bg-[#002B5B] px-5 py-3"
          onPress={() => router.back()}
        >
          <AccessibleText className="font-bold text-white">Voltar</AccessibleText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
