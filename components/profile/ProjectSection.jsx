import { View, Text } from "react-native";

import InfoCard from "./InfoCard";
import ProjectCard from "@/components/home/ProjectCard";

export default function ProjectsSection({ projects }) {

  return (
    <InfoCard
      title="Meus Projetos"
      icon="folder-open-outline"
    >

      <View className="gap-y-3 pt-1">

        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              subtitle={project.subtitle}
            />
          ))
        ) : (
          <Text className="text-zinc-400 text-sm italic py-2 text-center">
            Nenhum projeto publicado ainda.
          </Text>
        )}

      </View>

    </InfoCard>
  );
}