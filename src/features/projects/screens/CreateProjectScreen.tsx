import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, View } from "react-native";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";
import useAccessibilitySettings from "@/features/accessibility/useAccessibilitySettings";

import { AnimatedScreenScrollView } from "@/shared/components/layout/AnimatedScreenScrollView";
import { isValidCreateProjectForm } from "../project.schema";
import {
  createProject,
  getOrCreateProjectCategory,
  listAcademicCourses,
  listProjectCategories,
} from "../project.service";
import type {
  AcademicCourse,
  CreateProjectForm,
  ProjectCategory,
} from "../project.types";

type ProjectField = keyof CreateProjectForm;

const initialForm: CreateProjectForm = {
  title: "",
  summary: "",
  description: "",
  category: "",
  courseName: "",
  university: "",
  technologies: "",
  repositoryUrl: "",
  demoUrl: "",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível cadastrar o projeto.";
}

export default function CreateProjectScreen() {
  const [form, setForm] = useState<CreateProjectForm>(initialForm);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ProjectCategory | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<AcademicCourse | null>(
    null,
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleChange(field: ProjectField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelectCategory(category: ProjectCategory) {
    setSelectedCategory(category);
    setCategorySearch(category.name);
    handleChange("category", category.name);
  }

  function handleSelectCourse(course: AcademicCourse) {
    setSelectedCourse(course);
    setCourseSearch(course.name);
    handleChange("courseName", course.name);
  }

  async function handleCreateCategory() {
    const name = categorySearch.trim();

    if (!name || isCreatingCategory) {
      return;
    }

    try {
      setIsCreatingCategory(true);
      setErrorMessage(null);

      const category = await getOrCreateProjectCategory(name);

      handleSelectCategory(category);
      setCategories((prev) => {
        const alreadyExists = prev.some((item) => item.id === category.id);

        return alreadyExists ? prev : [category, ...prev];
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    if (!selectedCategory) {
      setErrorMessage("Selecione uma categoria.");
      setSuccessMessage(null);
      return;
    }

    if (!selectedCourse) {
      setErrorMessage("Selecione um curso.");
      setSuccessMessage(null);
      return;
    }

    const payload = {
      ...form,
      category: selectedCategory.name,
      courseName: selectedCourse.name,
    };

    if (!isValidCreateProjectForm(payload)) {
      setErrorMessage(
        "Preencha título, resumo, descrição, categoria, curso e tecnologias.",
      );
      setSuccessMessage(null);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await createProject(payload);

      setForm(initialForm);
      setCategorySearch("");
      setCourseSearch("");
      setSelectedCategory(null);
      setSelectedCourse(null);
      setSuccessMessage("Projeto cadastrado e enviado para análise.");
    } catch (error) {
      const message = getErrorMessage(error);

      setErrorMessage(message);
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setIsLoadingCategories(true);

        const data = await listProjectCategories(categorySearch);

        if (isMounted) {
          setCategories(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [categorySearch]);

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        setIsLoadingCourses(true);

        const data = await listAcademicCourses(courseSearch);

        if (isMounted) {
          setCourses(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoadingCourses(false);
        }
      }
    }

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, [courseSearch]);

  const canCreateCategory =
    categorySearch.trim().length > 1 &&
    !categories.some(
      (category) =>
        category.name.toLowerCase() === categorySearch.trim().toLowerCase(),
    );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-100 dark:bg-zinc-800"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AnimatedScreenScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
          <AccessibleText className="text-base font-atkinson-bold text-[#2f3b69] dark:text-blue-100">
            Voltar
          </AccessibleText>
        </TouchableOpacity>

        <View className="mt-6">
          <AccessibleText className="text-3xl font-atkinson-bold text-zinc-900 dark:text-white">
            Cadastrar projeto
          </AccessibleText>
          <AccessibleText className="mt-2 text-base font-atkinson text-zinc-600 dark:text-zinc-300">
            Preencha os dados do seu projeto acadêmico para enviar para análise.
          </AccessibleText>
        </View>

        <View className="mt-8 gap-4">
          <ProjectTextField
            label="Título"
            placeholder="Ex: Aplicativo para gestão de estudos"
            value={form.title}
            onChangeText={(value) => handleChange("title", value)}
          />

          <ProjectTextField
            label="Resumo"
            placeholder="Descreva o projeto em poucas palavras"
            value={form.summary}
            onChangeText={(value) => handleChange("summary", value)}
          />

          <ProjectTextField
            label="Descrição"
            placeholder="Explique o problema, solução e objetivos do projeto"
            value={form.description}
            onChangeText={(value) => handleChange("description", value)}
            multiline
            minHeight={120}
          />

          <SearchableSelect
            label="Categoria"
            placeholder="Pesquise uma categoria"
            value={categorySearch}
            isLoading={isLoadingCategories}
            selectedLabel={selectedCategory?.name ?? null}
            emptyText="Nenhuma categoria encontrada."
            onChangeText={(value) => {
              setCategorySearch(value);
              setSelectedCategory(null);
              handleChange("category", "");
            }}
          >
            {categories.map((category) => (
              <SelectOption
                key={category.id}
                label={category.name}
                isSelected={selectedCategory?.id === category.id}
                onPress={() => handleSelectCategory(category)}
              />
            ))}

            {canCreateCategory ? (
              <TouchableOpacity
                className="mt-2 rounded-xl border border-dashed border-[#2f3b69] px-4 py-3"
                activeOpacity={0.8}
                disabled={isCreatingCategory}
                onPress={handleCreateCategory}
              >
                <AccessibleText className="text-sm font-atkinson-bold text-[#2f3b69] dark:text-blue-100">
                  {isCreatingCategory
                    ? "Criando categoria..."
                    : `Criar categoria "${categorySearch.trim()}"`}
                </AccessibleText>
              </TouchableOpacity>
            ) : null}
          </SearchableSelect>

          <SearchableSelect
            label="Curso"
            placeholder="Pesquise seu curso"
            value={courseSearch}
            isLoading={isLoadingCourses}
            selectedLabel={selectedCourse?.name ?? null}
            emptyText="Nenhum curso encontrado."
            onChangeText={(value) => {
              setCourseSearch(value);
              setSelectedCourse(null);
              handleChange("courseName", "");
            }}
          >
            {courses.map((course) => (
              <SelectOption
                key={course.id}
                label={course.name}
                isSelected={selectedCourse?.id === course.id}
                onPress={() => handleSelectCourse(course)}
              />
            ))}
          </SearchableSelect>

          <ProjectTextField
            label="Universidade"
            placeholder="Ex: Estácio"
            value={form.university}
            onChangeText={(value) => handleChange("university", value)}
          />

          <ProjectTextField
            label="Tecnologias"
            placeholder="Separe por vírgula. Ex: React Native, Supabase, TypeScript"
            value={form.technologies}
            onChangeText={(value) => handleChange("technologies", value)}
          />

          <AccessibleText className="-mt-2 text-xs font-atkinson text-zinc-500 dark:text-zinc-400">
            O autor será registrado automaticamente como integrante principal do projeto.
          </AccessibleText>

          <ProjectTextField
            label="URL do repositório"
            placeholder="https://github.com/..."
            value={form.repositoryUrl}
            autoCapitalize="none"
            keyboardType="url"
            onChangeText={(value) => handleChange("repositoryUrl", value)}
          />

          <ProjectTextField
            label="URL de demonstração"
            placeholder="https://..."
            value={form.demoUrl}
            autoCapitalize="none"
            keyboardType="url"
            onChangeText={(value) => handleChange("demoUrl", value)}
          />
        </View>

        {errorMessage ? (
          <AccessibleText className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-center text-sm font-atkinson text-red-700">
            {errorMessage}
          </AccessibleText>
        ) : null}

        {successMessage ? (
          <AccessibleText className="mt-5 rounded-xl bg-emerald-100 px-4 py-3 text-center text-sm font-atkinson text-emerald-700">
            {successMessage}
          </AccessibleText>
        ) : null}

        <TouchableOpacity
          className={`mt-8 rounded-xl py-4 ${
            isSubmitting ? "bg-zinc-400" : "bg-[#2f3b69]"
          }`}
          activeOpacity={0.85}
          disabled={isSubmitting}
          onPress={handleSubmit}
        >
          <View className="flex-row items-center justify-center gap-2">
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : null}
            <AccessibleText className="text-center text-xl font-atkinson-bold text-white">
              {isSubmitting ? "Enviando..." : "Cadastrar projeto"}
            </AccessibleText>
          </View>
        </TouchableOpacity>
      </AnimatedScreenScrollView>
    </KeyboardAvoidingView>
  );
}

type ProjectTextFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  multiline?: boolean;
  minHeight?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "url";
  onChangeText: (value: string) => void;
};

function ProjectTextField({
  label,
  placeholder,
  value,
  multiline,
  minHeight,
  autoCapitalize = "sentences",
  keyboardType = "default",
  onChangeText,
}: ProjectTextFieldProps) {
  const { fontScale, isDarkMode } = useAccessibilitySettings();

  return (
    <View>
      <AccessibleText className="mb-2 text-base font-atkinson-bold text-zinc-800 dark:text-zinc-100">
        {label}
      </AccessibleText>
      <TextInput
        className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 font-atkinson text-zinc-900 dark:text-white"
        style={[{ fontSize: 16 * fontScale }, minHeight ? { minHeight, textAlignVertical: "top" } : undefined]}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? "#a1a1aa" : "#71717a"}
        value={value}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
      />
    </View>
  );
}

type SearchableSelectProps = {
  label: string;
  placeholder: string;
  value: string;
  isLoading: boolean;
  selectedLabel: string | null;
  emptyText: string;
  children: React.ReactNode;
  onChangeText: (value: string) => void;
};

function SearchableSelect({
  label,
  placeholder,
  value,
  isLoading,
  selectedLabel,
  emptyText,
  children,
  onChangeText,
}: SearchableSelectProps) {
  const { fontScale, isDarkMode } = useAccessibilitySettings();
  const hasChildren =
    Array.isArray(children) ? children.some(Boolean) : Boolean(children);

  return (
    <View>
      <AccessibleText className="mb-2 text-base font-atkinson-bold text-zinc-800 dark:text-zinc-100">
        {label}
      </AccessibleText>

      <TextInput
        className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 font-atkinson text-zinc-900 dark:text-white"
        style={{ fontSize: 16 * fontScale }}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? "#a1a1aa" : "#71717a"}
        value={value}
        onChangeText={onChangeText}
      />

      {selectedLabel ? (
        <AccessibleText className="mt-2 text-xs font-atkinson-bold text-emerald-700">
          Selecionado: {selectedLabel}
        </AccessibleText>
      ) : null}

      <View className="mt-2 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2">
        {isLoading ? (
          <View className="py-4">
            <ActivityIndicator color="#2f3b69" />
          </View>
        ) : hasChildren ? (
          children
        ) : (
          <AccessibleText className="px-3 py-3 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
            {emptyText}
          </AccessibleText>
        )}
      </View>
    </View>
  );
}

type SelectOptionProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

function SelectOption({ label, isSelected, onPress }: SelectOptionProps) {
  return (
    <TouchableOpacity
      className={`mb-2 rounded-xl px-4 py-3 ${
        isSelected ? "bg-[#2f3b69]" : "bg-zinc-100 dark:bg-zinc-800"
      }`}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <AccessibleText
        className={`text-sm font-atkinson-bold ${
          isSelected ? "text-white" : "text-zinc-700 dark:text-zinc-200"
        }`}
      >
        {label}
      </AccessibleText>
    </TouchableOpacity>
  );
}
