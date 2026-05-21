import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, StatusBar, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SectionTitle } from "@/shared/components/layout/SectionTitle";

import { members } from "../about.data";
import type { Member } from "../about.types";
import { AboutHero } from "../components/AboutHero";
import { MemberCard } from "../components/MemberCard";
import { MemberDetailsModal } from "../components/MemberDetailsModal";
import { ProjectSection } from "../components/ProjectSection";

export default function AboutScreen() {
  const { width, height } = useWindowDimensions();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!selectedMember) return;

    slideAnim.setValue(height);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 65, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, height, selectedMember, slideAnim]);

  function closeModal() {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }),
    ]).start(() => setSelectedMember(null));
  }

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
          <AboutHero
            containerPaddingClassName={containerPaddingClassName}
            heroHeightClassName={heroHeightClassName}
            logoSize={logoSize}
          />

          <View className={`w-full max-w-[420px] self-center ${containerPaddingClassName}`}>
            <View className="mt-6 overflow-hidden rounded-[26px] bg-[#2f3b69] px-5 py-5" style={{ boxShadow: "0px 4px 16px rgba(47,59,105,0.18)" }}>
              <View style={{ position: "absolute", top: -28, right: -28, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,222,89,0.12)" }} />
              <View style={{ position: "absolute", bottom: -20, left: -20, width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.06)" }} />
              <Text className="text-base leading-6 text-white/80 font-atkinson">
                Conectamos estudantes, projetos e oportunidades em uma experiência simples para colaboração acadêmica.
              </Text>
            </View>

            <SectionTitle
              title="Nossa equipe"
              subtitle="Conheça as pessoas por trás do projeto."
              className="mt-8"
            />

            <View className="mt-5 gap-3">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} onPress={setSelectedMember} />
              ))}
            </View>

            <ProjectSection />
          </View>
        </ScrollView>

        <MemberDetailsModal
          member={selectedMember}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          onClose={closeModal}
        />
      </View>
    </SafeAreaView>
  );
}
