import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

import { Button } from "@/shared/components/ui/base/button";
import { Toast } from "@/shared/components/ui/molecules/Toast";

import { isValidLoginPayload } from "../auth.schema";
import { useAuth } from "../auth.context";
import type { LoginForm } from "../auth.types";
import { AuthFormTitle } from "../components/AuthFormTitle";
import { AuthScreenLayout } from "../components/AuthScreenLayout";
import { AuthSocialSection } from "../components/AuthSocialSection";
import { AuthTextField } from "../components/AuthTextField";

type FocusedInput = "email" | "senha" | null;

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const { signIn } = useAuth();
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCompactWidth = width < 380;
  const submitButtonWidth = isCompactWidth ? 220 : 240;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
  const [showPassword, setShowPassword] = useState(false);
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

  function handleSocialLogin(provider: "Google" | "Apple") {
    Toast.show(
      <View>
        <Text className="font-atkinson-bold text-base text-white">
          {provider} em breve
        </Text>
        <Text className="mt-1 font-atkinson text-sm text-slate-100">
          Login com {provider} será liberado nas próximas versões.
        </Text>
      </View>,
      {
        type: "info",
        position: "top",
        backgroundColor: "#475569",
        duration: 2600,
      },
    );
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    if (!isValidLoginPayload(form)) {
      setErrorMessage("Preencha e-mail e senha para continuar.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await signIn(form);

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

      submitTimeoutRef.current = setTimeout(() => router.replace("/"), 700);
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
        description="Preencha seu e-mail e senha para entrar."
      />

      <View className="mt-6 gap-4">
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

      <AuthSocialSection
        actionLabel="Entrar"
        onGooglePress={() => handleSocialLogin("Google")}
        onApplePress={() => handleSocialLogin("Apple")}
      />
    </AuthScreenLayout>
  );
}
