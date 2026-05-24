import { Text, View } from "react-native";

import ProjectCard from "@/features/projects/components/ProjectCard";

import type { ProjectSectionProps } from "../profile.types";
import { InfoCard } from "./InfoCard";

export function ProjectSection({
  projects,
  title = "Meus Projetos",
  icon = "folder-open-outline",
  emptyMessage = "Nenhum projeto publicado ainda.",
}: ProjectSectionProps) {
  return (
    <InfoCard title={title} icon={icon}>
      <View className="pt-1">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              subtitle={project.subtitle}
            />
          ))
        ) : (
          <Text className="py-2 text-center text-sm italic text-zinc-400">
            {emptyMessage}
          </Text>
        )}
      </View>
    </InfoCard>
  );
}
