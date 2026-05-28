import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { showAppToast } from "@/shared/components/ui/molecules/Toast/showAppToast";

import {
  sendPasswordResetOtp,
  signOut,
  updatePassword,
  verifyPasswordResetOtp,
} from "../auth.service";
import type { ResetPasswordForm } from "../auth.types";
import { AuthFormTitle } from "../components/AuthFormTitle";
import { AuthScreenLayout } from "../components/AuthScreenLayout";
import { AuthTextField } from "../components/AuthTextField";
import { OtpVerificationModal } from "../components/OtpVerificationModal";

type FocusedInput = "email" | "novaSenha" | "confirmarSenha" | null;

const OTP_LENGTH = 6;

function validatePassword(password: string) {
  if (password.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }

  if (password.length > 32) {
    return "A senha deve ter no máximo 32 caracteres.";
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra maiúscula.";
  }

  if (!/[a-z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra minúscula.";
  }

  if (!/[0-9]/.test(password)) {
    return "A senha deve conter pelo menos um número.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "A senha deve conter pelo menos um caractere especial.";
  }

  return null;
}

export default function ResetPasswordScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const [passwordValidationMessage, setPasswordValidationMessage] =
    useState("");

  const [form, setForm] = useState<ResetPasswordForm>({
    email: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  function handleChange(field: keyof ResetPasswordForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "novaSenha") {
      setPasswordValidationMessage("");
    }
  }

  function closeOtpModal() {
    setIsOtpModalVisible(false);
    setOtpCode("");
  }

  async function handleContinue() {
    const email = form.email.trim();

    if (!email) {
      showAppToast({
        variant: "error",
        title: "Campo obrigatório",
        description: "Digite seu e-mail para continuar.",
      });
      return;
    }

    try {
      setIsSendingEmail(true);

      await sendPasswordResetOtp({ email });

      setOtpCode("");
      setIsOtpModalVisible(true);

      showAppToast({
        variant: "success",
        title: "Código enviado",
        description: "Enviamos o código de verificação para o seu e-mail.",
        duration: 4500,
      });
    } catch {
      showAppToast({
        variant: "error",
        title: "Erro ao enviar código",
        description:
          "Não foi possível enviar o código de verificação. Confira o e-mail e tente novamente.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  }

  async function handleResendOtp() {
    const email = form.email.trim();

    if (!email) {
      showAppToast({
        variant: "error",
        title: "Campo obrigatório",
        description: "Digite seu e-mail para reenviar o código.",
      });
      return;
    }

    try {
      setIsResendingOtp(true);

      await sendPasswordResetOtp({ email });

      setOtpCode("");

      showAppToast({
        variant: "success",
        title: "Código reenviado",
        description: "Enviamos um novo código para o seu e-mail.",
      });
    } catch {
      showAppToast({
        variant: "error",
        title: "Erro ao reenviar código",
        description: "Não foi possível reenviar o código. Tente novamente.",
      });
    } finally {
      setIsResendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    const email = form.email.trim();
    const token = otpCode.trim();

    if (!email) {
      showAppToast({
        variant: "error",
        title: "Campo obrigatório",
        description: "Digite seu e-mail para continuar.",
      });
      return;
    }

    if (token.length !== OTP_LENGTH) {
      showAppToast({
        variant: "warning",
        title: "Código incompleto",
        description: `Digite o código de ${OTP_LENGTH} dígitos enviado para o seu e-mail.`,
      });
      return;
    }

    try {
      setIsVerifyingOtp(true);

      await verifyPasswordResetOtp({
        email,
        token,
      });

      setIsOtpModalVisible(false);
      setOtpCode("");
      setPasswordValidationMessage("");
      setStep(2);

      showAppToast({
        variant: "success",
        title: "Código validado",
        description: "Agora você pode criar uma nova senha.",
      });
    } catch {
      showAppToast({
        variant: "error",
        title: "Código inválido",
        description: "Confira os 6 números enviados para o seu e-mail.",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleResetPassword() {
    const novaSenha = form.novaSenha.trim();
    const confirmarSenha = form.confirmarSenha.trim();

    if (!novaSenha || !confirmarSenha) {
      showAppToast({
        variant: "error",
        title: "Campos obrigatórios",
        description: "Preencha os dois campos de senha.",
      });
      return;
    }

    const passwordError = validatePassword(novaSenha);

    if (passwordError) {
      setPasswordValidationMessage(passwordError);

      showAppToast({
        variant: "error",
        title: "Senha inválida",
        description: passwordError,
      });
      return;
    }

    setPasswordValidationMessage("");

    if (novaSenha !== confirmarSenha) {
      showAppToast({
        variant: "error",
        title: "Senhas diferentes",
        description: "As senhas não coincidem.",
      });
      return;
    }

    try {
      setIsUpdatingPassword(true);

      await updatePassword({
        ...form,
        novaSenha,
        confirmarSenha,
      });

      await signOut();

      showAppToast({
        variant: "success",
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });

      router.replace("/login");
    } catch {
      showAppToast({
        variant: "error",
        title: "Erro ao alterar senha",
        description:
          "Não foi possível alterar sua senha. Valide o código enviado por e-mail e tente novamente.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  return (
    <AuthScreenLayout heroTitle="">
      <AuthFormTitle
        title={step === 1 ? "Redefinir senha" : "Nova senha"}
        description={
          step === 1
            ? "Informe seu e-mail para receber o código de verificação."
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
                <FontAwesome
                  name={showNewPassword ? "eye-slash" : "eye"}
                  size={18}
                  color="#71717a"
                />
              }
              onRightPress={() => setShowNewPassword((prev) => !prev)}
            />

            <AuthTextField
              placeholder="Confirmar senha"
              value={form.confirmarSenha}
              secureTextEntry={!showConfirmPassword}
              focused={focusedInput === "confirmarSenha"}
              onChangeText={(value) => handleChange("confirmarSenha", value)}
              onFocus={() => setFocusedInput("confirmarSenha")}
              onBlur={() => setFocusedInput(null)}
              rightElement={
                <FontAwesome
                  name={showConfirmPassword ? "eye-slash" : "eye"}
                  size={18}
                  color="#71717a"
                />
              }
              onRightPress={() => setShowConfirmPassword((prev) => !prev)}
            />

            {passwordValidationMessage ? (
              <Text className="font-atkinson text-sm text-red-500">
                {passwordValidationMessage}
              </Text>
            ) : null}
          </>
        )}
      </View>

      <TouchableOpacity
        className="mt-8 rounded-xl bg-[#2f3b69] py-4"
        disabled={isSendingEmail || isUpdatingPassword}
        onPress={step === 1 ? handleContinue : handleResetPassword}
      >
        <Text className="text-center text-2xl font-atkinson-bold text-white">
          {step === 1
            ? isSendingEmail
              ? "Enviando..."
              : "Continuar"
            : isUpdatingPassword
              ? "Salvando..."
              : "Salvar"}
        </Text>
      </TouchableOpacity>

      {step === 2 ? (
        <TouchableOpacity className="mt-4" onPress={() => setStep(1)}>
          <Text className="text-center text-lg font-atkinson text-[#2f3b69]">
            Voltar
          </Text>
        </TouchableOpacity>
      ) : null}

      <Text className="mt-8 text-center text-lg text-zinc-600">
        Lembrou sua senha?{" "}
        <Link href="/login" className="font-semibold text-[#2f3b69]">
          Entrar
        </Link>
      </Text>

      <OtpVerificationModal
        visible={isOtpModalVisible}
        code={otpCode}
        isLoading={isVerifyingOtp}
        isResending={isResendingOtp}
        onChangeCode={setOtpCode}
        onConfirm={handleVerifyOtp}
        onResend={handleResendOtp}
        onClose={closeOtpModal}
      />
    </AuthScreenLayout>
  );
}