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
} from "@/features/company/components/CompanyCreationFormParts";
import {
  createCompanyEvent,
  type CourseModality,
  type CreateCompanyEventInput,
} from "@/features/company/company-content.service";
import { showAppToast } from "@/shared/components/ui/molecules/Toast/showAppToast";

const modalityOptions: { label: string; value: CourseModality }[] = [
  { label: "Online", value: "online" },
  { label: "Presencial", value: "onsite" },
  { label: "Híbrido", value: "hybrid" },
];

const initialForm = {
  title: "",
  description: "",
  location: "",
  modality: "online" as CourseModality,
  startsAt: "",
  endsAt: "",
  price: "0",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível criar o evento.";
}

function parseMoney(value: string) {
  const normalizedValue = value.replace("R$", "").replace(",", ".").trim();
  const parsedValue = Number(normalizedValue || 0);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

function buildPayload(form: typeof initialForm): CreateCompanyEventInput {
  const title = form.title.trim();
  const description = form.description.trim();

  if (!title) {
    throw new Error("Informe o título do evento.");
  }

  if (!description) {
    throw new Error("Informe uma descrição para o evento.");
  }

  return {
    title,
    description,
    location: form.location,
    modality: form.modality,
    startsAt: form.startsAt,
    endsAt: form.endsAt,
    price: parseMoney(form.price),
  };
}

export default function CompanyEventCreateScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingPayload, setPendingPayload] =
    useState<CreateCompanyEventInput | null>(null);

  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT + 28;

  async function saveEvent(payload: CreateCompanyEventInput) {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await createCompanyEvent(payload);

      const message = payload.price > 0
        ? "Checkout fictício aprovado e evento pago publicado."
        : "Evento gratuito publicado com sucesso.";

      setForm(initialForm);
      setPendingPayload(null);
      setSuccessMessage(message);
      showAppToast({
        title: "Evento criado",
        description: message,
        variant: "success",
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showAppToast({
        title: "Erro ao criar evento",
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

      void saveEvent(payload);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      Alert.alert("Atenção", message);
    }
  }

  return (
    <>
      <CompanyCreationLayout
        title="Criar evento"
        subtitle="Publique eventos gratuitos ou pagos. Em eventos pagos, o app abre um checkout fictício antes de salvar."
        icon="calendar-outline"
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
          placeholder="Ex: Feira de carreiras Linka"
          value={form.title}
          onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))}
        />

        <FormField
          label="Descrição"
          placeholder="Explique o tema, convidados e objetivo do evento"
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

        <FormField
          label="Local ou link"
          placeholder="Ex: Auditório central ou link da transmissão"
          value={form.location}
          onChangeText={(value) => setForm((prev) => ({ ...prev, location: value }))}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField
              label="Início"
              placeholder="2026-07-20 19:00"
              value={form.startsAt}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, startsAt: value }))
              }
            />
          </View>

          <View className="flex-1">
            <FormField
              label="Fim"
              placeholder="2026-07-20 21:00"
              value={form.endsAt}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, endsAt: value }))
              }
            />
          </View>
        </View>

        <FormField
          label="Preço"
          placeholder="0 ou 29,90"
          keyboardType="decimal-pad"
          value={form.price}
          onChangeText={(value) => setForm((prev) => ({ ...prev, price: value }))}
        />

        <SubmitButton
          label={isSaving ? "Publicando..." : "Publicar evento"}
          isLoading={isSaving}
          onPress={handleSubmit}
        />
      </CompanyCreationLayout>

      <FakeCheckoutModal
        visible={Boolean(pendingPayload)}
        productLabel={pendingPayload?.title ?? "Evento pago"}
        amount={pendingPayload?.price ?? 0}
        isLoading={isSaving}
        onCancel={() => setPendingPayload(null)}
        onConfirm={() => {
          if (pendingPayload) {
            void saveEvent(pendingPayload);
          }
        }}
      />
    </>
  );
}
