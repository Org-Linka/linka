import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InfoCard({
    title,
    icon,
    children,
    onEdit
}) {
    return (
        <View className="bg-[#f8fafc] rounded-3xl p-5 mb-4 border border-zinc-100">

            <View className="flex-row justify-between items-center mb-4">

                <View className="flex-row items-center">

                    <View className="bg-[#002b5b]/10 p-2 rounded-xl">
                        <Ionicons name={icon} size={20} color="#002b5b" />
                    </View>

                    <Text className="ml-3 text-base font-bold text-[#002b5b]">
                        {title}
                    </Text>

                </View>

                {onEdit && (
                    <TouchableOpacity
                        onPress={onEdit}
                        className="border border-blue-600 px-3 py-1 rounded-lg"
                    >
                        <Text className="text-blue-600 font-medium text-xs">
                            Editar
                        </Text>
                    </TouchableOpacity>
                )}

            </View>

            {children}

        </View>
    );
}