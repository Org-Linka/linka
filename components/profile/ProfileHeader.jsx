import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Logo from "@/assets/images/logoLight.png";

export default function ProfileHeader({ title = "Meu Perfil" }) {
    return (
        <View className="flex-row justify-between bg-[#002b5b] items-center px-5 py-4">

            <View className="flex-row items-center gap-4">
                <View className="bg-black/40 rounded-xl p-1">
                    <Image 
                        source={Logo}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                    />
                </View>

                <Text className="text-white text-xl font-bold font-atkinson-bold">
                    {title}
                </Text>
            </View>

            <TouchableOpacity>
                <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}