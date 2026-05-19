import { Link, router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/base/button";
import { Toast } from "@/components/ui/molecules/Toast";

import logoLogin from "../../assets/images/logoLight.png";

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const submitTimeoutRef = useRef(null);

  const isCompactWidth = width < 380;
  const containerPaddingClassName = width < 360 ? "px-5" : "px-6";
  const heroHeightClassName = height < 700 ? "min-h-[220px]" : "min-h-[300px]";
  const roleButtonsClassName = isCompactWidth ? "flex-col" : "flex-row";
  const submitButtonWidth = isCompactWidth ? 220 : 240;

  const [userType, setUserType] = useState("aluno");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const [form, setForm] = useState({
    email: "",
    senha: "",
    cnpj: "",
    idEmpresa: "",
  });

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  function handleChange(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSelectType(type) {
    setUserType(type);

    setForm((prev) => ({
      ...prev,
      cnpj: type === "empresa" ? prev.cnpj : "",
      idEmpresa: type === "empresa" ? prev.idEmpresa : "",
    }));
  }

  function handleLogin() {
    let payload;

    if (userType === "aluno") {
      payload = {
        tipo: "aluno",
        email: form.email,
        senha: form.senha,
      };
    } else {
      payload = {
        tipo: "empresa",
        email: form.email,
        senha: form.senha,
        cnpj: form.cnpj,
        id: form.idEmpresa,
      };
    }

    console.log("Dados enviados ao login: ", payload);
  }

  function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    handleLogin();
    setIsSubmitting(true);

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
      }
    );

    submitTimeoutRef.current = setTimeout(() => {
      router.push("/home");
    }, 700);
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
                <View className="flex flex-row items-center justify-center">
                  <Image
                    source={logoLogin}
                    style={{ width: 60, height: 60 }}
                    resizeMode="contain"
                  />
                  <Text className="text-6xl text-white font-atkinson-bold">
                    Linka
                  </Text>
                </View>

                <Text className="mt-2 text-center text-4xl font-atkinson-bold text-white">
                  Bem-vindo(a)
                </Text>
              </View>
            </View>

            <View
              className={`w-full max-w-[420px] flex-1 self-center py-7 ${containerPaddingClassName}`}
            >
              <View className="items-start">
                <Text className="text-4xl font-atkinson-bold text-[#2f3b69]">
                  Login
                </Text>
                <View className="mt-1 h-[4px] w-10 rounded-full bg-[#ffde59]" />
              </View>

              <Text className="mt-4 text-lg leading-6 text-zinc-500 font-atkinson">
                Escolha seu perfil e preencha seus dados para entrar.
              </Text>

              <View className={`mt-6 gap-3 ${roleButtonsClassName}`}>
                <TouchableOpacity
                  className={`flex-1 rounded-xl border border-[#2f3b69] px-4 py-4 ${
                    userType === "aluno" ? "bg-[#2f3b69]" : "bg-zinc-200"
                  }`}
                  activeOpacity={0.9}
                  onPress={() => handleSelectType("aluno")}
                >
                  <View className="flex-row items-center justify-center gap-3">
                    <FontAwesome
                      name="user-o"
                      size={18}
                      color={userType === "aluno" ? "#fff" : "#3f3f46"}
                    />
                    <Text
                      className={`text-base font-atkinson-bold ${
                        userType === "aluno" ? "text-white" : "text-zinc-700"
                      }`}
                    >
                      Aluno
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 rounded-xl border border-[#2f3b69] px-4 py-4 ${
                    userType === "empresa" ? "bg-[#2f3b69]" : "bg-zinc-200"
                  }`}
                  activeOpacity={0.9}
                  onPress={() => handleSelectType("empresa")}
                >
                  <View className="flex-row items-center justify-center gap-3">
                    <FontAwesome
                      name="building-o"
                      size={18}
                      color={userType === "empresa" ? "#fff" : "#3f3f46"}
                    />
                    <Text
                      className={`text-base font-atkinson-bold ${
                        userType === "empresa" ? "text-white" : "text-zinc-700"
                      }`}
                    >
                      Empresa
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View className="mt-6 gap-4">
                {userType !== "empresa" && (
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

                {userType === "empresa" && (
                  <View
                    className={`rounded-2xl border bg-white px-4 ${
                      focusedInput === "cnpj"
                        ? "border-[#2f3b69]/40 bg-[#2f3b69]/5"
                        : "border-zinc-200"
                    }`}
                  >
                    <TextInput
                      placeholder="CNPJ"
                      placeholderTextColor="#71717a"
                      value={form.cnpj}
                      onChangeText={(value) => handleChange("cnpj", value)}
                      onFocus={() => setFocusedInput("cnpj")}
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

                <View
                  className={`rounded-2xl border bg-white px-4 ${
                    focusedInput === "senha"
                      ? "border-[#2f3b69]/40 bg-[#2f3b69]/5"
                      : "border-zinc-200"
                  }`}
                >
                  <TextInput
                    placeholder="Senha"
                    placeholderTextColor="#71717a"
                    secureTextEntry
                    value={form.senha}
                    onChangeText={(value) => handleChange("senha", value)}
                    onFocus={() => setFocusedInput("senha")}
                    onBlur={() => setFocusedInput(null)}
                    className="py-4 text-base text-zinc-900"
                    style={{
                      outlineStyle: "none",
                      boxShadow: "none",
                      borderWidth: 0,
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity
                className="mt-4 self-end"
                activeOpacity={0.7}
                onPress={() => router.push("/(auth)/redefinir-senha")}
              >
                <Text className="text-sm font-medium text-[#2f3b69]">
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>

              <View className="w-full flex justify-center flex-row">
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
                      <Text className="text-center text-2xl font-atkinson-bold text-white">
                        Entrar
                      </Text>
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
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}