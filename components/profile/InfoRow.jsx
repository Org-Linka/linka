import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InfoRow({
    label,
    value,
    isLast,
    isAction,
    statusColor = "text-zinc-800",
}) {
    return (
        <View
            className={`flex-row justify-between py-3 
            ${!isLast ? "border-b border-zinc-200/50" : ""}`}
        >
            <Text className="text-zinc-500 text-sm">
                {label}
            </Text>

            <View className="flex-row items-center flex-1 justify-end ml-4">

                <Text
                    numberOfLines={1}
                    className={`font-semibold text-sm text-right ${statusColor}`}
                >
                    {value}
                </Text>

                {isAction && (
                    <Ionicons name="chevron-forward" size={16} color="#bdc3c7" />
                )}
            </View>
        </View>
    );
}