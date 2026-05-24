import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import type { ProjectSummary } from "../project.types";

type ProjectCardProps = Pick<ProjectSummary, "title" | "subtitle">;

export default function ProjectCard({ title, subtitle }: ProjectCardProps) {
  return (
    <TouchableOpacity className="flex-row items-center bg-[#F8F9FA] p-4 rounded-2xl border border-[#F1F3F5] mb-4">
      <View className="w-[50px] h-[50px] bg-[#E9ECEF] rounded-xl justify-center items-center">
        <Ionicons name="logo-codepen" size={32} color="#002B5B" />
      </View>

      <View className="flex-1 ml-4">
        <Text className="font-bold text-base">{title}</Text>
        <Text className="text-xs text-gray-500 mt-1">{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );
}
