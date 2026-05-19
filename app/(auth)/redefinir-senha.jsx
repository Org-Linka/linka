import { Link, router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import logoLight from "../../assets/images/logoLight.png";

export default function ResetPasswordScreen() {
  const { width, height } = useWindowDimensions();

  const containerPaddingClassName = width < 360 ? "px-5" : "px-6";
  const heroHeightClassName = height < 700 ? "min-h-[220px]" : "min-h-[300px]";
  const submitButtonWidth = width < 380 ? 220 : 240;

  const [step, setStep] = useState(1);
  const [focusedInput, setFocusedInput] = useState(null);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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

    Alert.alert("Sucesso", "Senha redefinida com sucesso.");
    router.replace("/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-[#2f3b69]" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 90,
          }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 bg-white">
            <View
              className={`w-full items-center justify-center rounded-b-[110px] bg-[#2f3b69] pt-7 pb-8 ${containerPaddingClassName} ${heroHeightClassName}`}
            >
              <View className="w-full max-w-[420px] items-center gap-6">
                <View className="flex-row items-center justify-center">
                  <Image
                    source={logoLight}
                    style={{ width: 60, height: 60 }}
                    resizeMode="contain"
                  />
                  <Text className="text-6xl font-atkinson-bold text-white">
                    Linka
                  </Text>
                </View>
              </View>
            </View>

            <View
              className={`w-full max-w-[420px] flex-1 self-center py-7 ${containerPaddingClassName}`}
            >
              <View className="items-start">
                <Text className="text-4xl font-atkinson-bold text-[#2f3b69]">
                  {step === 1 ? "Redefinir senha" : "Nova senha"}
                </Text>
                <View className="mt-1 h-[4px] w-12 rounded-full bg-[#ffde59]" />
              </View>

              <Text className="mt-4 text-lg leading-6 text-zinc-500 font-atkinson">
                {step === 1
                  ? "Informe seu e-mail para continuar com a redefinição de senha."
                  : "Digite sua nova senha e confirme para concluir."}
              </Text>

              <View className="mt-6 gap-4">
                {step === 1 && (
                  <View
                    className={`rounded-2xl border bg-white px-4 ${
                      focusedInput === "email"
                        ? "border-[#2f3b69]/40 bg-[#2f3b69]/5"
                        : "border-zinc-200"
                    }`}
                  >
                    <TextInput
                      placeholder="E-mail"
                      placeholderTextColor="#71717a"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={form.email}
                      onChangeText={(value) => handleChange("email", value)}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                      className="py-4 text-base text-zinc-900"
                      style={{
                        outlineStyle: "none",
                        boxShadow: "none",
                        borderWidth: 0,
                      }}
                    />
                  </View>
                )}

                {step === 2 && (
                  <>
                    <View
                      className={`flex-row items-center rounded-2xl bg-white px-4 border ${
                        focusedInput === "novaSenha"
                          ? "border-[#2f3b69]/40 bg-[#2f3b69]/5"
                          : "border-zinc-200"
                      }`}
                    >
                      <TextInput
                        placeholder="Nova senha"
                        placeholderTextColor="#71717a"
                        secureTextEntry={!showNewPassword}
                        value={form.novaSenha}
                        onChangeText={(value) =>
                          handleChange("novaSenha", value)
                        }
                        onFocus={() => setFocusedInput("novaSenha")}
                        onBlur={() => setFocusedInput(null)}
                        className="flex-1 bg-transparent py-4 text-base text-zinc-900"
                        style={{
                          outlineStyle: "none",
                          boxShadow: "none",
                          borderWidth: 0,
                        }}
                      />

                      <TouchableOpacity
                        className="ml-3"
                        onPress={() => setShowNewPassword((prev) => !prev)}
                      >
                        <FontAwesome
                          name={showNewPassword ? "eye-slash" : "eye"}
                          size={18}
                          color="#71717a"
                        />
                      </TouchableOpacity>
                    </View>

                    <View
                      className={`flex-row items-center rounded-2xl bg-white px-4 border ${
                        focusedInput === "confirmarSenha"
                          ? "border-[#2f3b69]/40 bg-[#2f3b69]/5"
                          : "border-zinc-200"
                      }`}
                    >
                      <TextInput
                        placeholder="Confirmar senha"
                        placeholderTextColor="#71717a"
                        secureTextEntry={!showConfirmPassword}
                        value={form.confirmarSenha}
                        onChangeText={(value) =>
                          handleChange("confirmarSenha", value)
                        }
                        onFocus={() => setFocusedInput("confirmarSenha")}
                        onBlur={() => setFocusedInput(null)}
                        className="flex-1 bg-transparent py-4 text-base text-zinc-900"
                        style={{
                          outlineStyle: "none",
                          boxShadow: "none",
                          borderWidth: 0,
                        }}
                      />

                      <TouchableOpacity
                        className="ml-3"
                        onPress={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        <FontAwesome
                          name={showConfirmPassword ? "eye-slash" : "eye"}
                          size={18}
                          color="#71717a"
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>

              <View className="w-full flex-row justify-center">
                <TouchableOpacity
                  className="mt-8 items-center justify-center rounded-xl bg-[#2f3b69]"
                  style={{
                    width: submitButtonWidth,
                    height: 58,
                  }}
                  activeOpacity={0.8}
                  onPress={step === 1 ? handleContinue : handleResetPassword}
                >
                  <Text className="text-center text-2xl font-atkinson-bold text-white">
                    {step === 1 ? "Continuar" : "Salvar"}
                  </Text>
                </TouchableOpacity>
              </View>

              {step === 2 && (
                <TouchableOpacity className="mt-4" onPress={() => setStep(1)}>
                  <Text className="text-center text-lg text-[#2f3b69] font-atkinson">
                    Voltar
                  </Text>
                </TouchableOpacity>
              )}

              <Text className="mt-8 text-center text-lg text-zinc-600">
                Lembrou sua senha?{" "}
                <Link href="/login" className="font-semibold text-[#2f3b69]">
                  Entrar
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}