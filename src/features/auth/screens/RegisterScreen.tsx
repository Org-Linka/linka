import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { Toast } from "@/shared/components/ui/molecules/Toast";

import { isValidRegisterPayload } from "../auth.schema";
import { useAuth } from "../auth.context";
import { signUpWithEmail } from "../auth.service";
import type { RegisterForm, UserType } from "../auth.types";
import { AuthFormTitle } from "../components/AuthFormTitle";
import { AuthScreenLayout } from "../components/AuthScreenLayout";
import { AuthSocialSection } from "../components/AuthSocialSection";
import { AuthTextField } from "../components/AuthTextField";
import { PasswordStrengthBar } from "../components/PasswordStrengthBar";

type FocusedInput = "nome" | "email" | "senha" | "cnpj" | null;

export default function RegisterScreen() {
  const { signInWithSocial } = useAuth();

  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<RegisterForm>({
    userType: "student",
    nome: "",
    email: "",
    senha: "",
    cnpj: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCompany = form.userType === "company";

  function handleChange(field: keyof RegisterForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelectType(userType: UserType) {
    setErrorMessage(null);

    setForm((prev) => ({
      ...prev,
      userType,
      cnpj: userType === "company" ? prev.cnpj : "",
    }));
  }

  async function handleSocialRegister(provider: "google" | "apple") {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const profile = await signInWithSocial(provider, form.userType);

      Toast.show(
        <View>
          <AccessibleText className="font-atkinson-bold text-base text-white">
            Cadastro concluído
          </AccessibleText>
          <AccessibleText className="mt-1 font-atkinson text-sm text-slate-100">
            Conta criada com {provider === "google" ? "Google" : "Apple"}.
          </AccessibleText>
        </View>,
        {
          type: "success",
          position: "top",
          backgroundColor: "#14532d",
          duration: 2500,
        },
      );

      if (profile.userType === "company") {
        router.replace("/company");
        return;
      }

      if (profile.userType === "admin") {
        router.replace("/admin");
        return;
      }

      router.replace("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta com login social.";

      setErrorMessage(message);

      Toast.show(
        <View>
          <AccessibleText className="font-atkinson-bold text-base text-white">
            Falha no cadastro social
          </AccessibleText>
          <AccessibleText className="mt-1 font-atkinson text-sm text-slate-100">
            {message}
          </AccessibleText>
        </View>,
        {
          type: "error",
          position: "top",
          backgroundColor: "#7f1d1d",
          duration: 3000,
        },
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister() {
    if (!isValidRegisterPayload(form)) {
      setErrorMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      await signUpWithEmail(form);

      Toast.show(
        <View>
          <AccessibleText className="font-atkinson-bold text-base text-white">
            Cadastro concluído
          </AccessibleText>
          <AccessibleText className="mt-1 font-atkinson text-sm text-slate-100">
            Sua conta foi criada com sucesso.
          </AccessibleText>
        </View>,
        {
          type: "success",
          position: "top",
          backgroundColor: "#14532d",
          duration: 2500,
        },
      );

      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "Não foi possível criar sua conta.";

      setErrorMessage(message);

      Toast.show(
        <View>
          <AccessibleText className="font-atkinson-bold text-base text-white">
            Falha no cadastro
          </AccessibleText>
          <AccessibleText className="mt-1 font-atkinson text-sm text-slate-100">
            {message}
          </AccessibleText>
        </View>,
        {
          type: "error",
          position: "top",
          backgroundColor: "#7f1d1d",
          duration: 3000,
        },
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreenLayout heroTitle="Criar conta">
      <AuthFormTitle title="Cadastro" description="Informe seus dados para continuar." />

      <View className="mt-6 flex-row gap-3">
        <RoleButton
          icon="user-o"
          label="Aluno"
          selected={form.userType === "student"}
          onPress={() => handleSelectType("student")}
        />

        <RoleButton
          icon="building-o"
          label="Empresa"
          selected={form.userType === "company"}
          onPress={() => handleSelectType("company")}
        />
      </View>

      <View className="mt-6 gap-4">
        <AuthTextField
          placeholder={isCompany ? "Nome da empresa" : "Nome"}
          value={form.nome}
          focused={focusedInput === "nome"}
          onChangeText={(value) => handleChange("nome", value)}
          onFocus={() => setFocusedInput("nome")}
          onBlur={() => setFocusedInput(null)}
        />

        {isCompany ? (
          <AuthTextField
            placeholder="CNPJ"
            value={form.cnpj}
            keyboardType="numeric"
            focused={focusedInput === "cnpj"}
            onChangeText={(value) => handleChange("cnpj", value)}
            onFocus={() => setFocusedInput("cnpj")}
            onBlur={() => setFocusedInput(null)}
          />
        ) : null}

        <AuthTextField
          placeholder="E-mail"
          value={form.email}
          keyboardType="email-address"
          autoCapitalize="none"
          focused={focusedInput === "email"}
          onChangeText={(value) => handleChange("email", value)}
          onFocus={() => setFocusedInput("email")}
          onBlur={() => setFocusedInput(null)}
        />

        <AuthTextField
          placeholder="Senha"
          value={form.senha}
          secureTextEntry={!showPassword}
          focused={focusedInput === "senha"}
          onChangeText={(value) => handleChange("senha", value)}
          onFocus={() => setFocusedInput("senha")}
          onBlur={() => setFocusedInput(null)}
          rightElement={
            <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={18} color="#71717a" />
          }
          onRightPress={() => setShowPassword((prev) => !prev)}
        />

        <PasswordStrengthBar password={form.senha} />
      </View>

      {errorMessage ? (
        <AccessibleText className="mt-4 text-center text-sm text-red-500">
          {errorMessage}
        </AccessibleText>
      ) : null}

      <TouchableOpacity
        className={`mt-8 rounded-xl py-4 ${isLoading ? "bg-zinc-400" : "bg-[#2F3B69]"}`}
        activeOpacity={0.8}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <AccessibleText className="text-center text-2xl font-atkinson-bold text-white">
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </AccessibleText>
      </TouchableOpacity>

      <AccessibleText className="mt-8 text-center text-lg text-zinc-600 dark:text-zinc-300">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-[#2F3B69] dark:text-blue-100">
          Entrar
        </Link>
      </AccessibleText>

      <AuthSocialSection
        actionLabel="Cadastrar"
        onGooglePress={() => handleSocialRegister("google")}
        onApplePress={() => handleSocialRegister("apple")}
      />
    </AuthScreenLayout>
  );
}

type RoleButtonProps = {
  icon: keyof typeof FontAwesome.glyphMap;
  label: string;
  selected: boolean;
  onPress: () => void;
};

function RoleButton({ icon, label, selected, onPress }: RoleButtonProps) {
  return (
    <TouchableOpacity
      className={`flex-1 rounded-xl border border-[#2F3B69] px-4 py-4 ${
        selected ? "bg-[#ffde59]" : "bg-[#2F3B69]"
      }`}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-center gap-3">
        <FontAwesome name={icon} size={18} color={selected ? "#2F3B69" : "#fff"} />
        <AccessibleText
          className={`text-base font-atkinson-bold ${
            selected ? "text-[#2F3B69]" : "text-white"
          }`}
        >
          {label}
        </AccessibleText>
      </View>
    </TouchableOpacity>
  );
}