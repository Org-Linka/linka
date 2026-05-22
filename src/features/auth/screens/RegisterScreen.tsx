import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { signUpWithEmail } from "../auth.service";
import type { RegisterForm } from "../auth.types";
import { AuthFormTitle } from "../components/AuthFormTitle";
import { AuthScreenLayout } from "../components/AuthScreenLayout";
import { AuthTextField } from "../components/AuthTextField";

type FocusedInput = "nome" | "email" | "senha" | null;

export default function RegisterScreen() {
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<RegisterForm>({ nome: "", email: "", senha: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleChange(field: keyof RegisterForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      await signUpWithEmail(form);

      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreenLayout heroTitle="Criar conta">
      <AuthFormTitle title="Cadastro" description="Informe seus dados para continuar." />

      <View className="mt-6 gap-4">
        <AuthTextField
          placeholder="Nome"
          value={form.nome}
          focused={focusedInput === "nome"}
          onChangeText={(value) => handleChange("nome", value)}
          onFocus={() => setFocusedInput("nome")}
          onBlur={() => setFocusedInput(null)}
        />
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
        className={`mt-8 rounded-xl py-4 ${isLoading ? "bg-zinc-400" : "bg-[#2f3b69]"}`}
        activeOpacity={0.8}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text className="text-center text-2xl font-atkinson-bold text-white">
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>

      <Text className="mt-8 text-center text-lg text-zinc-600">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-[#2f3b69]">
          Entrar
        </Link>
      </Text>
    </AuthScreenLayout>
  );
}