import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_HEIGHT } from "@/config/layout";
import {
  CompanyCreationLayout,
  DateTimeSelect,
  FakeCheckoutModal,
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

type EventPublicationDraft = CreateCompanyEventInput;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível criar o evento.";
}

function parseMoney(value: string) {
  const normalizedValue = value.replace("R$", "").replace(",", ".").trim();
  const parsedValue = Number(normalizedValue || 0);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

function buildPayload(form: typeof initialForm): EventPublicationDraft {
  const title = form.title.trim();
  const description = form.description.trim();

  if (!title) {
    throw new Error("Informe o título do evento.");
  }

  if (!description) {
    throw new Error("Informe uma descrição para o evento.");
  }

  if (!form.startsAt) {
    throw new Error("Selecione a data e hora de início do evento.");
  }

  if (!form.endsAt) {
    throw new Error("Selecione a data e hora de fim do evento.");
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
  const [pendingPayload, setPendingPayload] =
    useState<EventPublicationDraft | null>(null);
  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT + 28;

  async function saveEvent(payload: EventPublicationDraft) {
    try {
      setIsSaving(true);
      await createCompanyEvent(payload);

      const message = payload.price > 0
        ? "Checkout fictício aprovado e evento publicado."
        : "Evento publicado com sucesso.";

      setForm(initialForm);
      setPendingPayload(null);
      showAppToast({
        title: "Evento criado",
        description: message,
        variant: "success",
      });
    } catch (error) {
      const message = getErrorMessage(error);
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
      showAppToast({
        title: "Atenção",
        description: message,
        variant: "error",
      });
    }
  }

  return (
    <>
      <CompanyCreationLayout
        title="Criar evento"
        subtitle="Publique eventos gratuitos ou simule o checkout de eventos pagos antes da publicação."
        icon="calendar-outline"
        bottomPadding={bottomPadding}
      >
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

        <FormField
          label="Preço fictício"
          placeholder="0 ou 29,90"
          keyboardType="decimal-pad"
          value={form.price}
          onChangeText={(value) => setForm((prev) => ({ ...prev, price: value }))}
        />

        <DateTimeSelect
          label="Início"
          placeholder="Selecionar data e hora de início"
          value={form.startsAt}
          onChange={(value) => setForm((prev) => ({ ...prev, startsAt: value }))}
        />

        <DateTimeSelect
          label="Fim"
          placeholder="Selecionar data e hora de fim"
          value={form.endsAt}
          onChange={(value) => setForm((prev) => ({ ...prev, endsAt: value }))}
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
