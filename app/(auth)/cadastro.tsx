import { Link, router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
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
  type TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import logoLight from "../../assets/images/logoLight.png";

type FocusedInput = "nome" | "email" | "senha" | null;
type RegisterForm = {
  nome: string;
  email: string;
  senha: string;
};

const inputResetStyle = {
  outlineStyle: "none",
  boxShadow: "none",
  borderWidth: 0,
} as unknown as TextStyle;

export default function RegisterScreen() {
  const { width, height } = useWindowDimensions();

  const containerPaddingClassName = width < 360 ? "px-5" : "px-6";
  const heroHeightClassName = height < 700 ? "min-h-[260px]" : "min-h-[300px]";

  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState<RegisterForm>({
    nome: "",
    email: "",
    senha: "",
  });

  function handleChange(field: keyof RegisterForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleRegister() {
    router.replace("/home");
  }

  return (
    <SafeAreaView className="flex-1 bg-[#2f3b69]" edges={["top"]}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 bg-white"
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 bg-white">
            <View
              className={`w-full items-center justify-center rounded-b-[110px] bg-[#2f3b69] pt-7 pb-8 ${containerPaddingClassName} ${heroHeightClassName}`}
            >
              <View className="w-full max-w-[420px] items-center gap-6">
                <View className="flex flex-row items-center justify-center">
                  <Image
                    source={logoLight}
                    style={{ width: 60, height: 60 }}
                    resizeMode="contain"
                  />
                  <Text className="text-6xl text-white font-atkinson-bold">
                    Linka
                  </Text>
                </View>

                <Text className="mt-2 text-center text-4xl font-atkinson-bold text-white">
                  Criar conta
                </Text>
              </View>
            </View>

            <View
              className={`w-full max-w-[420px] flex-1 self-center py-7 ${containerPaddingClassName}`}
            >
              <View className="items-start">
                <Text className="text-4xl font-atkinson-bold text-[#2f3b69]">
                  Cadastro
                </Text>
                <View className="mt-1 h-[4px] w-10 rounded-full bg-[#ffde59]" />
              </View>

              <Text className="mt-4 text-lg leading-6 text-zinc-500 font-atkinson">
                Informe seus dados para continuar.
              </Text>

              <View className="mt-6 gap-4">
                <View
                  className={`rounded-2xl border bg-white px-4 ${
                    focusedInput === "nome"
                      ? "border-[#2f3b69]/40 bg-[#2f3b69]/5"
                      : "border-zinc-200"
                  }`}
                >
                  <TextInput
                    placeholder="Nome"
                    placeholderTextColor="#71717a"
                    value={form.nome}
                    onChangeText={(value) => handleChange("nome", value)}
                    onFocus={() => setFocusedInput("nome")}
                    onBlur={() => setFocusedInput(null)}
                    className="py-4 text-base text-zinc-900"
                    style={inputResetStyle}
                  />
                </View>

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
                    style={inputResetStyle}
                  />
                </View>

                <View
                  className={`flex-row items-center rounded-2xl border bg-white px-4 ${
                    focusedInput === "senha"
                      ? "border-[#2f3b69]/40 bg-[#2f3b69]/5"
                      : "border-zinc-200"
                  }`}
                >
                  <TextInput
                    placeholder="Senha"
                    placeholderTextColor="#71717a"
                    secureTextEntry={!showPassword}
                    value={form.senha}
                    onChangeText={(value) => handleChange("senha", value)}
                    onFocus={() => setFocusedInput("senha")}
                    onBlur={() => setFocusedInput(null)}
                    className="flex-1 bg-transparent py-4 text-base text-zinc-900"
                    style={inputResetStyle}
                  />

                  <TouchableOpacity
                    className="ml-3"
                    activeOpacity={0.7}
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    <FontAwesome
                      name={showPassword ? "eye-slash" : "eye"}
                      size={18}
                      color="#71717a"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className="mt-8 rounded-xl bg-[#2f3b69] py-4"
                activeOpacity={0.8}
                onPress={handleRegister}
              >
                <Text className="text-center text-2xl font-atkinson-bold text-white">
                  Cadastrar
                </Text>
              </TouchableOpacity>

              <Text className="mt-8 text-center text-zinc-600 text-lg">
                Já tem conta?{" "}
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
