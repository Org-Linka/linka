import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import ProjectCard from "@/features/projects/components/ProjectCard";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import type { ProjectSectionProps } from "../profile.types";
import { InfoCard } from "./InfoCard";

export function ProjectSection({
  projects,
  title = "Meus Projetos",
  icon = "folder-open-outline",
  emptyMessage = "Nenhum projeto publicado ainda.",
  maxVisibleProjects = 3,
}: ProjectSectionProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const visibleProjects = projects.slice(0, maxVisibleProjects);
  const hasMoreProjects = projects.length > maxVisibleProjects;

  return (
    <>
      <InfoCard title={title} icon={icon}>
        <View className="pt-1">
          {projects.length > 0 ? (
            <>
              {visibleProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  subtitle={project.subtitle}
                />
              ))}

              {hasMoreProjects ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setIsModalVisible(true)}
                  className="mt-1 rounded-2xl border border-[#002B5B]/15 bg-[#002B5B]/5 px-4 py-3 dark:border-blue-100/20 dark:bg-blue-100/10"
                >
                  <AccessibleText className="text-center text-sm font-atkinson-bold text-[#002B5B] dark:text-blue-100">
                    Ver todos os projetos ({projects.length})
                  </AccessibleText>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <AccessibleText
              size={14}
              className="py-2 text-center text-sm italic text-zinc-400 dark:text-zinc-500"
            >
              {emptyMessage}
            </AccessibleText>
          )}
        </View>
      </InfoCard>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable
            className="max-h-[80%] rounded-t-[32px] bg-white px-5 pb-8 pt-5 dark:bg-zinc-900"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <AccessibleText className="text-lg font-atkinson-bold text-[#002B5B] dark:text-blue-100">
                  Todos os projetos
                </AccessibleText>

                <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
                  {projects.length} projetos publicados
                </AccessibleText>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsModalVisible(false)}
                className="rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-800"
              >
                <AccessibleText className="text-sm font-atkinson-bold text-zinc-700 dark:text-zinc-200">
                  Fechar
                </AccessibleText>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  subtitle={project.subtitle}
                />
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
