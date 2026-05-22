import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

import { Button } from "@/shared/components/ui/base/button";
import { Toast } from "@/shared/components/ui/molecules/Toast";

import { signInCompanyWithCnpj, signInWithEmail } from "../auth.service";
import type { LoginForm, UserType } from "../auth.types";
import { AuthFormTitle } from "../components/AuthFormTitle";
import { AuthScreenLayout } from "../components/AuthScreenLayout";
import { AuthTextField } from "../components/AuthTextField";

type FocusedInput = "email" | "senha" | "cnpj" | null;

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCompactWidth = width < 380;
  const roleButtonsClassName = isCompactWidth ? "flex-col" : "flex-row";
  const submitButtonWidth = isCompactWidth ? 220 : 240;

  const [userType, setUserType] = useState<UserType>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
  const [form, setForm] = useState<LoginForm>({
    email: "",
    senha: "",
    cnpj: "",
    idEmpresa: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    };
  }, []);

  function handleChange(name: keyof LoginForm, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectType(type: UserType) {
    setUserType(type);
    setErrorMessage(null);

    setForm((prev) => ({
      ...prev,
      email: type === "student" ? prev.email : "",
      cnpj: type === "company" ? prev.cnpj : "",
      idEmpresa: "",
    }));
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      if (userType === "company") {
        await signInCompanyWithCnpj({
          cnpj: form.cnpj,
          senha: form.senha,
        });
      } else {
        await signInWithEmail(form);
      }

      Toast.show(
        <View>
          <Text className="font-atkinson-bold text-base text-white">Sucesso</Text>
          <Text className="mt-1 font-atkinson text-sm text-slate-100">
            Login realizado com sucesso.
          </Text>
        </View>,
        {
          type: "success",
          position: "top",
          backgroundColor: "#2f3b69",
          duration: 2200,
        },
      );

      submitTimeoutRef.current = setTimeout(() => router.push("/home"), 700);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login.";

      setErrorMessage(message);

      Toast.show(
        <View>
          <Text className="font-atkinson-bold text-base text-white">Erro no login</Text>
          <Text className="mt-1 font-atkinson text-sm text-slate-100">
            {message}
          </Text>
        </View>,
        {
          type: "error",
          position: "top",
          backgroundColor: "#dc2626",
          duration: 2600,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout heroTitle="Bem-vindo(a)">
      <AuthFormTitle
        title="Login"
        description="Escolha seu perfil e preencha seus dados para entrar."
      />

      <View className={`mt-6 gap-3 ${roleButtonsClassName}`}>
        <RoleButton
          icon="user-o"
          label="Aluno"
          selected={userType === "student"}
          onPress={() => handleSelectType("student")}
        />

        <RoleButton
          icon="building-o"
          label="Empresa"
          selected={userType === "company"}
          onPress={() => handleSelectType("company")}
        />
      </View>

      <View className="mt-6 gap-4">
        {userType === "company" ? (
          <AuthTextField
            placeholder="CNPJ"
            value={form.cnpj}
            keyboardType="numeric"
            focused={focusedInput === "cnpj"}
            onChangeText={(value) => handleChange("cnpj", value)}
            onFocus={() => setFocusedInput("cnpj")}
            onBlur={() => setFocusedInput(null)}
          />
        ) : (
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
        )}

        <AuthTextField
          placeholder="Senha"
          value={form.senha}
          secureTextEntry
          focused={focusedInput === "senha"}
          onChangeText={(value) => handleChange("senha", value)}
          onFocus={() => setFocusedInput("senha")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      {errorMessage ? (
        <Text className="mt-4 text-center text-sm text-red-500">
          {errorMessage}
        </Text>
      ) : null}

      <TouchableOpacity
        className="mt-4 self-end"
        activeOpacity={0.7}
        onPress={() => router.push("/(auth)/redefinir-senha")}
      >
        <Text className="text-sm font-medium text-[#2f3b69]">Esqueceu a senha?</Text>
      </TouchableOpacity>

      <View className="w-full flex-row justify-center">
        <View className="mt-8">
          <Button
            width={submitButtonWidth}
            height={58}
            borderRadius={12}
            backgroundColor="#2f3b69"
            loadingTextBackgroundColor="#27272a"
            isLoading={isSubmitting}
            onPress={handleSubmit}
            loadingText="Entrando..."
            loadingTextColor="#ffffff"
            loadingTextSize={30}
            showLoadingIndicator
            renderLoadingIndicator={() => (
              <View className="mr-2">
                <ActivityIndicator color="#ffffff" size="small" />
              </View>
            )}
          >
            <View className="items-center justify-center">
              <Text className="text-center text-2xl font-atkinson-bold text-white">Entrar</Text>
            </View>
          </Button>
        </View>
      </View>

      <Text className="mt-8 text-center text-lg text-zinc-600">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-[#2f3b69]">
          Cadastre-se
        </Link>
      </Text>
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
      className={`flex-1 rounded-xl border border-[#2f3b69] px-4 py-4 ${
        selected ? "bg-[#2f3b69]" : "bg-zinc-200"
      }`}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-center gap-3">
        <FontAwesome name={icon} size={18} color={selected ? "#fff" : "#3f3f46"} />
        <Text
          className={`text-base font-atkinson-bold ${
            selected ? "text-white" : "text-zinc-700"
          }`}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}