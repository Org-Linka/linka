import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import { buildResetPasswordPayload } from "../auth.service";
import type { ResetPasswordForm } from "../auth.types";
import { AuthFormTitle } from "../components/AuthFormTitle";
import { AuthScreenLayout } from "../components/AuthScreenLayout";
import { AuthTextField } from "../components/AuthTextField";
import { PasswordStrengthBar } from "../components/PasswordStrengthBar";

type FocusedInput = "email" | "novaSenha" | "confirmarSenha" | null;

export default function ResetPasswordScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState<ResetPasswordForm>({
    email: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  function handleChange(field: keyof ResetPasswordForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleContinue() {
    if (!form.email.trim()) {
      Alert.alert("Campo obrigatório", "Digite seu e-mail para continuar.");
      return;
    }
    setStep(2);
  }

  function handleResetPassword() {
    if (!form.novaSenha.trim() || !form.confirmarSenha.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha os dois campos de senha.");
      return;
    }

    if (form.novaSenha !== form.confirmarSenha) {
      Alert.alert("Senhas diferentes", "As senhas não coincidem.");
      return;
    }

    console.log("Dados enviados para redefinir senha: ", buildResetPasswordPayload(form));
    Alert.alert("Sucesso", "Senha redefinida com sucesso.");
    router.replace("/login");
  }

  return (
    <AuthScreenLayout heroTitle="Recuperar acesso">
      <AuthFormTitle
        title={step === 1 ? "Redefinir senha" : "Nova senha"}
        description={
          step === 1
            ? "Informe seu e-mail para continuar com a redefinição de senha."
            : "Digite sua nova senha e confirme para concluir."
        }
      />

      <View className="mt-6 gap-4">
        {step === 1 ? (
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
        ) : (
          <>
            <AuthTextField
              placeholder="Nova senha"
              value={form.novaSenha}
              secureTextEntry={!showNewPassword}
              focused={focusedInput === "novaSenha"}
              onChangeText={(value) => handleChange("novaSenha", value)}
              onFocus={() => setFocusedInput("novaSenha")}
              onBlur={() => setFocusedInput(null)}
              rightElement={
                <FontAwesome name={showNewPassword ? "eye-slash" : "eye"} size={18} color="#71717a" />
              }
              onRightPress={() => setShowNewPassword((prev) => !prev)}
            />

            <PasswordStrengthBar password={form.novaSenha} />

            <AuthTextField
              placeholder="Confirmar senha"
              value={form.confirmarSenha}
              secureTextEntry={!showConfirmPassword}
              focused={focusedInput === "confirmarSenha"}
              onChangeText={(value) => handleChange("confirmarSenha", value)}
              onFocus={() => setFocusedInput("confirmarSenha")}
              onBlur={() => setFocusedInput(null)}
              rightElement={
                <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={18} color="#71717a" />
              }
              onRightPress={() => setShowConfirmPassword((prev) => !prev)}
            />
          </>
        )}
      </View>

      <TouchableOpacity
        className="mt-8 rounded-xl bg-[#2f3b69] py-4"
        onPress={step === 1 ? handleContinue : handleResetPassword}
      >
        <Text className="text-center text-2xl font-atkinson-bold text-white">
          {step === 1 ? "Continuar" : "Salvar"}
        </Text>
      </TouchableOpacity>

      {step === 2 ? (
        <TouchableOpacity className="mt-4" onPress={() => setStep(1)}>
          <Text className="text-center text-lg text-[#2f3b69] font-atkinson">Voltar</Text>
        </TouchableOpacity>
      ) : null}

      <Text className="mt-8 text-center text-lg text-zinc-600">
        Lembrou sua senha? {" "}
        <Link href="/login" className="font-semibold text-[#2f3b69]">Entrar</Link>
      </Text>
    </AuthScreenLayout>
  );
}
