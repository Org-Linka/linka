import { useState } from "react";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_HEIGHT } from "@/config/layout";
import {
  CompanyCreationLayout,
  FakeCheckoutModal,
  FeedbackMessage,
  FormField,
  OptionGroup,
  SubmitButton,
  ToggleRow,
} from "@/features/company/components/CompanyCreationFormParts";
import {
  createCompanyCourse,
  type CourseLevel,
  type CourseModality,
  type CreateCompanyCourseInput,
} from "@/features/company/company-content.service";
import { showAppToast } from "@/shared/components/ui/molecules/Toast/showAppToast";

const modalityOptions: { label: string; value: CourseModality }[] = [
  { label: "Online", value: "online" },
  { label: "Presencial", value: "onsite" },
  { label: "Híbrido", value: "hybrid" },
];

const levelOptions: { label: string; value: CourseLevel }[] = [
  { label: "Iniciante", value: "beginner" },
  { label: "Intermediário", value: "intermediate" },
  { label: "Avançado", value: "advanced" },
];

const initialForm = {
  title: "",
  description: "",
  modality: "online" as CourseModality,
  level: "beginner" as CourseLevel,
  workloadMinutes: "60",
  price: "0",
  hasCertificate: true,
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível criar o curso.";
}

function parseMoney(value: string) {
  const normalizedValue = value.replace("R$", "").replace(",", ".").trim();
  const parsedValue = Number(normalizedValue || 0);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

function buildPayload(form: typeof initialForm): CreateCompanyCourseInput {
  const title = form.title.trim();
  const description = form.description.trim();

  if (!title) {
    throw new Error("Informe o título do curso.");
  }

  if (!description) {
    throw new Error("Informe uma descrição para o curso.");
  }

  return {
    title,
    description,
    modality: form.modality,
    level: form.level,
    workloadMinutes: Number(form.workloadMinutes || 0),
    hasCertificate: form.hasCertificate,
    price: parseMoney(form.price),
  };
}

export default function CompanyCourseCreateScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingPayload, setPendingPayload] =
    useState<CreateCompanyCourseInput | null>(null);

  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT + 28;

  async function saveCourse(payload: CreateCompanyCourseInput) {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await createCompanyCourse(payload);

      const message = payload.price > 0
        ? "Checkout fictício aprovado e curso pago publicado."
        : "Curso gratuito publicado com sucesso.";

      setForm(initialForm);
      setPendingPayload(null);
      setSuccessMessage(message);
      showAppToast({
        title: "Curso criado",
        description: message,
        variant: "success",
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showAppToast({
        title: "Erro ao criar curso",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit() {
    try {
      const payload = buildPayload(form);

      if (payload.price > 0) {
        setPendingPayload(payload);
        return;
      }

      void saveCourse(payload);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      Alert.alert("Atenção", message);
    }
  }

  return (
    <>
      <CompanyCreationLayout
        title="Criar curso"
        subtitle="Cadastre cursos gratuitos ou pagos. Conteúdos pagos passam por um checkout fictício antes da publicação."
        icon="book-outline"
        bottomPadding={bottomPadding}
      >
        {errorMessage ? (
          <FeedbackMessage message={errorMessage} variant="error" />
        ) : null}
        {successMessage ? (
          <FeedbackMessage message={successMessage} variant="success" />
        ) : null}

        <FormField
          label="Título"
          placeholder="Ex: Introdução a UX para estudantes"
          value={form.title}
          onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))}
        />

        <FormField
          label="Descrição"
          placeholder="Explique o conteúdo, objetivos e público-alvo"
          value={form.description}
          multiline
          onChangeText={(value) =>
            setForm((prev) => ({ ...prev, description: value }))
          }
        />

        <OptionGroup
          label="Modalidade"
          options={modalityOptions}
          selectedValue={form.modality}
          onChange={(value) => setForm((prev) => ({ ...prev, modality: value }))}
        />

        <OptionGroup
          label="Nível"
          options={levelOptions}
          selectedValue={form.level}
          onChange={(value) => setForm((prev) => ({ ...prev, level: value }))}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField
              label="Carga horária"
              placeholder="Minutos"
              keyboardType="number-pad"
              value={form.workloadMinutes}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, workloadMinutes: value }))
              }
            />
          </View>

          <View className="flex-1">
            <FormField
              label="Preço"
              placeholder="0 ou 49,90"
              keyboardType="decimal-pad"
              value={form.price}
              onChangeText={(value) => setForm((prev) => ({ ...prev, price: value }))}
            />
          </View>
        </View>

        <ToggleRow
          label="Emitir certificado"
          description="Marque se o curso oferece certificado ao aluno."
          value={form.hasCertificate}
          onToggle={() =>
            setForm((prev) => ({
              ...prev,
              hasCertificate: !prev.hasCertificate,
            }))
          }
        />

        <SubmitButton
          label={isSaving ? "Publicando..." : "Publicar curso"}
          isLoading={isSaving}
          onPress={handleSubmit}
        />
      </CompanyCreationLayout>

      <FakeCheckoutModal
        visible={Boolean(pendingPayload)}
        productLabel={pendingPayload?.title ?? "Curso pago"}
        amount={pendingPayload?.price ?? 0}
        isLoading={isSaving}
        onCancel={() => setPendingPayload(null)}
        onConfirm={() => {
          if (pendingPayload) {
            void saveCourse(pendingPayload);
          }
        }}
      />
    </>
  );
}
