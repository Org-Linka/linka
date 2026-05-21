import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Animated,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  StyleSheet,
  type ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type ComponentProps,
} from "react";
import { BlurView } from "expo-blur";

import logoLogin from "../../assets/images/logoLight.png";

type FontAwesomeName = ComponentProps<typeof FontAwesome>["name"];
type Member = {
  id: number;
  nome: string;
  descricao: string;
  descricaoCompleta: string;
  foto: ImageSourcePropType;
  linkedin: string;
  github: string;
  portfolio: string;
};
type SocialButtonProps = { icon: FontAwesomeName; label: string; url: string };
type MemberCardProps = { member: Member; onPress: (member: Member) => void };
type ProjectFeature = { icon: FontAwesomeName; title: string; desc: string };

const members: Member[] = [
  {
    id: 1,
    nome: "Yago Menezes",
    descricao: "Desenvolvimento FullStack",
    descricaoCompleta:
      "Atua no desenvolvimento fullstack da aplicação, sendo responsável pela implementação de funcionalidades, integração com APIs e construção da experiência do usuário. Tem foco em performance, organização de código e evolução contínua do produto.",
    foto: require("../../assets/images/members/membro2.jpeg"),
    linkedin: "https://linkedin.com/in/ten-menezes",
    github: "https://github.com/tenmenezes",
    portfolio: "https://tenmenezes.github.io",
  },
  {
    id: 2,
    nome: "Arthur Nery",
    descricao: "Desenvolvimento & Planejamento",
    descricaoCompleta:
      "Contribui tanto na parte técnica quanto no planejamento estratégico do projeto. Atua na definição de funcionalidades, estrutura do sistema e organização do desenvolvimento, garantindo alinhamento entre ideia, execução e propósito da aplicação.",
    foto: require("../../assets/images/members/membro1.png"),
    linkedin: "https://www.linkedin.com/in/luiz-arthur-nery-leite",
    github: "https://github.com/tutunery",
    portfolio: "https://example.com/",
  },
  {
    id: 3,
    nome: "Yasmim Mantovani",
    descricao: "Designer UX/UI & Interface",
    descricaoCompleta:
      "Responsável pelo design UX/UI e identidade visual do aplicativo. Trabalha na criação de interfaces intuitivas, organização da experiência do usuário e alinhamento visual da plataforma, buscando sempre clareza, estética e usabilidade.",
    foto: require("../../assets/images/members/membro3.png"),
    linkedin: "https://www.linkedin.com/in/yasmim-mantovani",
    github: "https://www.github.com/yasmimmantovani",
    portfolio: "https://example.com/",
  },
  {
    id: 4,
    nome: "Maria Clara Bastos",
    descricao: "Desenvolvimento FullStack",
    descricaoCompleta:
      "Atua no desenvolvimento fullstack e na construção da interface do aplicativo. Participa da estruturação visual e funcional do sistema, contribuindo para transformar ideias em soluções digitais bem organizadas e eficientes.",
    foto: require("../../assets/images/members/membro4.png"),
    linkedin: "https://www.linkedin.com/in/mclara-bastos/",
    github: "https://github.com/mclarabastos",
    portfolio: "https://example.com/",
  },
];

function SocialButton({ icon, label, url }: SocialButtonProps) {
  async function handleOpenLink() {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleOpenLink}
      className="flex-1 rounded-xl border border-[#2f3b69]/15 bg-white px-3 py-3"
      style={{ boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" }}
    >
      <View className="items-center justify-center gap-2">
        <FontAwesome name={icon} size={18} color="#2f3b69" />
        <Text className="text-center text-xs font-atkinson-bold text-[#2f3b69]">
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function MemberCard({ member, onPress }: MemberCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
      tension: 120,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 120,
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(member)}
        className="flex-row items-center rounded-[20px] border border-[#2f3b69]/10 bg-white px-4 py-4"
        style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.08)", gap: 14 }}
      >
        <View
          className="items-center justify-center rounded-full bg-[#2f3b69]/10"
          style={{ width: 68, height: 68, padding: 2 }}
        >
          <View
            className="rounded-full overflow-hidden bg-zinc-200"
            style={{ width: 64, height: 64 }}
          >
            <Image
              source={member.foto}
              resizeMode="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        </View>

        <View className="flex-1">
          <Text className="text-[17px] font-atkinson-bold text-[#2f3b69]">
            {member.nome}
          </Text>
          <Text className="mt-[2px] text-[13px] text-zinc-400 font-atkinson">
            {member.descricao}
          </Text>
        </View>

        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#2f3b69]/6">
          <FontAwesome name="angle-right" size={16} color="#2f3b69" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ProjectSection() {
  return (
    <View
      className="mt-7 overflow-hidden rounded-[26px] border border-[#2f3b69]/10 bg-[#f8f8fb]"
      style={{ boxShadow: "0px 3px 8px rgba(0,0,0,0.12)" }}
    >
      <View className="px-5 py-5">
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#3E829A]">
            <Image
              source={logoLogin}
              style={{ width: 26, height: 26 }}
              resizeMode="contain"
            />
          </View>
          <Text className="ml-3 text-xl font-atkinson-bold text-[#2f3b69]">
            Sobre o projeto
          </Text>
        </View>

        <Text className="mt-5 text-[15px] leading-7 text-zinc-600 font-atkinson">
          A Linka é um aplicativo pensado para conectar estudantes, projetos,
          empresas, mentores e oportunidades em um único ambiente.
        </Text>

        <View className="mt-5 gap-3">
          {(
            [
              {
                icon: "users",
                title: "Conexão",
                desc: "Aproxima alunos, mentores, empresas e investidores.",
              },
              {
                icon: "rocket",
                title: "Visibilidade",
                desc: "Dá espaço para divulgar ideias, projetos e iniciativas.",
              },
              {
                icon: "lightbulb-o",
                title: "Oportunidades",
                desc: "Incentiva participação em eventos, desafios e hackathons.",
              },
            ] satisfies ProjectFeature[]
          ).map(({ icon, title, desc }) => (
            <View
              key={title}
              className="rounded-2xl border border-[#2f3b69]/10 bg-white px-4 py-4"
            >
              <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#ffde59]/20">
                  <FontAwesome name={icon} size={16} color="#3E829A" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-atkinson-bold text-[#3E829A]">
                    {title}
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-zinc-600 font-atkinson">
                    {desc}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const { width, height } = useWindowDimensions();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Dispara a animação de entrada quando um membro é selecionado
  useEffect(() => {
    if (selectedMember) {
      slideAnim.setValue(height); // Garante que começa lá embaixo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65, // Ajuste a tensão para deixar o slide mais suave ou rápido
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedMember, height]);

  // Função para fechar o modal com animação de saída
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedMember(null); // Só limpa o estado depois que a animação termina
    });
  };

  const containerPaddingClassName = width < 360 ? "px-5" : "px-6";
  const heroHeightClassName = height < 700 ? "min-h-[185px]" : "min-h-[210px]";
  const logoSize = useMemo(() => (width < 360 ? 36 : 42), [width]);

  return (
    <SafeAreaView className="flex-1 bg-[#2f3b69]" edges={["top"]}>
      <StatusBar barStyle="light-content" />

      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1 bg-white"
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <View
            className={`w-full rounded-b-[55px] bg-[#2f3b69] pt-4 pb-7 ${containerPaddingClassName} ${heroHeightClassName}`}
          >
            <View className="w-full max-w-[420px] self-center">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.back()}
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
                >
                  <FontAwesome name="angle-left" size={24} color="#ffffff" />
                </TouchableOpacity>

                <View className="flex-row items-center gap-2">
                  <Image
                    source={logoLogin}
                    style={{ width: logoSize, height: logoSize }}
                    resizeMode="contain"
                  />
                  <Text className="text-3xl font-atkinson-bold text-white">
                    Linka
                  </Text>
                </View>
              </View>

              <View className="mt-7 items-center">
                <Text className="text-center text-4xl font-atkinson-bold text-white">
                  Sobre nós
                </Text>
                <View className="mt-2 h-[4px] w-12 rounded-full bg-[#ffde59]" />
              </View>
            </View>
          </View>

          <View
            className={`w-full max-w-[420px] self-center ${containerPaddingClassName}`}
          >
            <View
              className="mt-6 rounded-[26px] bg-[#2f3b69] px-5 py-5 overflow-hidden"
              style={{ boxShadow: "0px 4px 16px rgba(47,59,105,0.18)" }}
            >
              <View
                style={{
                  position: "absolute",
                  top: -28,
                  right: -28,
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "rgba(255,222,89,0.12)",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: -20,
                  left: -20,
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: "rgba(255,255,255,0.06)",
                }}
              />

              <View className="flex-row items-center gap-3 mb-4">
                {/* Preencher algo aqui: imagem, ilustração ou sla */}
              </View>
            </View>

            <View className="mt-8">
              <View className="items-start">
                <Text className="text-4xl font-atkinson-bold text-[#2f3b69]">
                  Nossa equipe
                </Text>
                <View className="mt-1 h-[4px] w-10 rounded-full bg-[#ffde59]" />
              </View>

              <Text className="mt-3 text-base leading-6 text-zinc-400 font-atkinson">
                Conheça as pessoas por trás do projeto.
              </Text>
            </View>

            <View className="mt-5 gap-3">
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onPress={setSelectedMember}
                />
              ))}
            </View>

            <ProjectSection />
          </View>
        </ScrollView>

        <Modal
          visible={!!selectedMember}
          animationType="none"
          transparent
          onRequestClose={closeModal}
        >
          <View className="flex-1 justify-end">
            {/* 1. FUNDO ANIMADO COM FADE E BLUR */}
            <Animated.View
              style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
            >
              <Pressable style={StyleSheet.absoluteFill} onPress={closeModal}>
                <BlurView
                  intensity={40}
                  tint="dark"
                  style={StyleSheet.absoluteFillObject}
                />
              </Pressable>
            </Animated.View>

            {/* 2. CONTEÚDO ANIMADO COM SLIDE */}
            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
              <View
                className="w-full rounded-t-[32px] border-t border-x border-[#2f3b69]/10 bg-white px-6 pt-3 pb-10"
                style={{ boxShadow: "0px -4px 24px rgba(0,0,0,0.12)" }}
              >
                <View className="items-center mb-4">
                  <View className="h-[4px] w-10 rounded-full bg-zinc-200" />
                </View>

                {selectedMember && (
                  <>
                    <View className="flex-row items-center gap-4">
                      <View
                        className="items-center justify-center rounded-full bg-[#3E829A]"
                        style={{ width: 80, height: 80, padding: 3 }}
                      >
                        <View
                          className="rounded-full overflow-hidden bg-zinc-200"
                          style={{ width: 74, height: 74 }}
                        >
                          <Image
                            source={selectedMember.foto}
                            resizeMode="cover"
                            style={{ width: "100%", height: "100%" }}
                          />
                        </View>
                      </View>

                      <View className="flex-1">
                        <Text className="text-[22px] font-atkinson-bold text-[#2f3b69]">
                          {selectedMember.nome}
                        </Text>
                        <View className="mt-1 flex-row items-center gap-2">
                          <Text className="text-[13px] text-zinc-400 font-atkinson">
                            {selectedMember.descricao}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={closeModal}
                        className="h-9 w-9 items-center justify-center rounded-full bg-zinc-100"
                      >
                        <FontAwesome name="close" size={16} color="#2f3b69" />
                      </TouchableOpacity>
                    </View>

                    <View className="mt-5 h-[1px] bg-zinc-100" />

                    <Text className="mt-5 text-[15px] leading-7 text-zinc-600 font-atkinson">
                      {selectedMember.descricaoCompleta}
                    </Text>

                    <View className="mt-6">
                      <Text
                        className="mb-3 text-xs font-atkinson-bold text-[#2f3b69] text-center uppercase"
                        style={{ letterSpacing: 1 }}
                      >
                        Acesse minhas redes ヅ
                      </Text>
                      <View className="flex-row gap-3">
                        <SocialButton
                          icon="linkedin"
                          label="LinkedIn"
                          url={selectedMember.linkedin}
                        />
                        <SocialButton
                          icon="github"
                          label="GitHub"
                          url={selectedMember.github}
                        />
                        <SocialButton
                          icon="globe"
                          label="Portfólio"
                          url={selectedMember.portfolio}
                        />
                      </View>
                    </View>
                  </>
                )}
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
