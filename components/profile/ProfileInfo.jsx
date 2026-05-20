import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";


export default function ProfileInfo({ user, onPickImage }) {
    return (
        <View className="px-5 pb-20 pt-6 bg-[#002b5b] items-center">

            <TouchableOpacity onPress={onPickImage} className="relative">

                <View className="w-28 h-28 rounded-full border-4 border-white/20 overflow-hidden bg-zinc-300 justify-center items-center">
                    {user.avatarUrl ? (
                        <Image 
                            source={{ uri: user.avatarUrl }}
                            className="w-full h-full"
                        />
                    ) : (
                        <Ionicons name="person" size={50} color="#666" />
                    )}

                </View>

                <View className="absolute bottom-0 right-0 bg-[#ffd700] p-2 rounded-full shadow-sm">
                    <Ionicons name="camera" size={18} color="#000" />
                </View>

            </TouchableOpacity>

            <Text className="text-white text-2xl font-bold font-atkinson-bold mt-4">
                {user.name}
            </Text>

            <Text className="text-[#bdc3c7] text-base">
                {user.course}
            </Text>

        </View>
    );
}