import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { isValidCreateProjectForm } from "../project.schema";
import { createProject } from "../project.service";
import type { CreateProjectForm } from "../project.types";

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

export default function CreateProjectScreen() {
  const [form, setForm] = useState<CreateProjectForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleChange(field: ProjectField, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    if (!isValidCreateProjectForm(form)) {
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

      await createProject(form);

      setForm(initialForm);
      setSuccessMessage("Projeto cadastrado e enviado para análise.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o projeto.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-100"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
          <Text className="text-base font-atkinson-bold text-[#2f3b69]">
            Voltar
          </Text>
        </TouchableOpacity>

        <View className="mt-6">
          <Text className="text-3xl font-atkinson-bold text-zinc-900">
            Cadastrar projeto
          </Text>
          <Text className="mt-2 text-base font-atkinson text-zinc-600">
            Preencha os dados do seu projeto acadêmico para enviar para análise.
          </Text>
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

          <ProjectTextField
            label="Categoria"
            placeholder="Ex: Tecnologia, Saúde, Educação"
            value={form.category}
            onChangeText={(value) => handleChange("category", value)}
          />

          <ProjectTextField
            label="Curso"
            placeholder="Ex: Análise e Desenvolvimento de Sistemas"
            value={form.courseName}
            onChangeText={(value) => handleChange("courseName", value)}
          />

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

          <Text className="-mt-2 text-xs font-atkinson text-zinc-500">
            O autor será registrado automaticamente como integrante principal do projeto.
          </Text>

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
          <Text className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-center text-sm font-atkinson text-red-700">
            {errorMessage}
          </Text>
        ) : null}

        {successMessage ? (
          <Text className="mt-5 rounded-xl bg-emerald-100 px-4 py-3 text-center text-sm font-atkinson text-emerald-700">
            {successMessage}
          </Text>
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
            <Text className="text-center text-xl font-atkinson-bold text-white">
              {isSubmitting ? "Enviando..." : "Cadastrar projeto"}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
  return (
    <View>
      <Text className="mb-2 text-base font-atkinson-bold text-zinc-800">
        {label}
      </Text>
      <TextInput
        className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base font-atkinson text-zinc-900"
        style={minHeight ? { minHeight, textAlignVertical: "top" } : undefined}
        placeholder={placeholder}
        placeholderTextColor="#a1a1aa"
        value={value}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
      />
    </View>
  );
}