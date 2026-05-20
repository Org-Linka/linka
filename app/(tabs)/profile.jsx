import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { TAB_BAR_HEIGHT } from '../../constants/layout';
import Logo from '../../assets/images/logoLight.png';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const userData = {
    name: "Nome de usuário",
    course: "Análise e Desenv. de Sistemas",
    email: "aluno@example.com",
    phone: "(11) 98765-4321",
    registration: "2021123456",
    university: "Universidade exemplo",
    semester: "4° semestre",
    avatarUrl: "https://github.com/mizuno-p.png"
  };

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={['top']}>
      <View className="flex-1 bg-white">

        {/* Header */}
        <View className="flex-row justify-between bg-[#002B5B] items-center px-5 py-4">
          <View className="flex flex-row items-center gap-4">
            <View className="bg-black/40 rounded-xl p-1">
              <Image source={Logo} style={{ width: 40, height: 40 }} resizeMode='contain' />
            </View>
            <Text className="text-white text-xl font-bold font-atkison-bold">Meu Perfil</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        { /* Identidade do Usuário */ }
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 }}
        >
          <View className="px-5 pb-20 pt-6 bg-[#002b5b] items-center">
            <View className="relative">
              <View className="w-28 h-28 rounded-full border-4 border-white/20 overflow-hidden bg-zinc-300 justify-center items-center">
                {userData.avatarUrl ? (
                  <Image source={{ uri: userData.avatarUrl }} className="w-full h-full" />
                ) : (
                  <Ionicons name="person" size={50} color="#666" />
                )}
              </View>

              <TouchableOpacity className="absolute bottom-0 right-0 bg-[#ffd700] p-2 rounded-full shadow-sm">
                <Ionicons name="camera" size={18} color="#000" />
              </TouchableOpacity>

            </View>

            <Text className="text-white text-2xl font-bold font-atkinson-bold mt-4">{userData.name}</Text>
            <Text className="text-[#bdc3c7] text-base font-atkison">{userData.course}</Text>
          </View>

          {/* Opções e Info */}
          <View className="bg-white rounded-t-[50px] px-6 pt-10 -mt-12 flex-1">

            <Text className="text-lg font-bold text-[#002b5b] mb-4">Minha Conta</Text>

            {/* Infos pessoais */}
            <InfoCard title="Informações Pessoais" icon="person-outline" onEdit={() => {}}>
              <InfoRow label="Nome Completo" value={userData.name} />
              <InfoRow label="E-mail" value={userData.email} />
              <InfoRow label="Telefone" value={userData.phone} isLast />
            </InfoCard>

            {/* Dados acadêmicos */}
            <InfoCard title="dados Acadêmicos" icon="school-outline">
              <InfoRow label="Matrícula" value={userData.registration} />
              <InfoRow label="Universidade" value={userData.university} />
              <InfoRow label="Curso" value={userData.course} />
              <InfoRow label="Semestre" value={userData.semester} isLast />
            </InfoCard>

            {/* Segurança */}
            <InfoCard title="Segurança" icon="shield-checkmark-outline">
              <InfoRow label="Senha" value="********" isAction />
              <InfoRow label="Autenticação" value="Ativada" statusColor="text-green-600" isAction isLast />
            </InfoCard>
            
            {/* Botão sair */}
            <TouchableOpacity
              onPress={()=> router.push("/login")}
              className="mt-6 mb-10 flex-row items-center justify-center bg-zinc-100 p-4 rounded-2xl border border-zinc-200"
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="ml-2 text-red-500 font-bold">Sair da Conta</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

{/* Bloco de Card */}
function InfoCard({ title, icon, children, onEdit }) {
  return (
    <View className="bg-[#f8fafc] rounded-3xl p-5 mb-4 border border-zinc-100">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View className="bg-[#002b5b]/10 p-2 rounded-xl">
            <Ionicons name={icon} size={20} color="#002b5b" />
          </View>
          <Text className="ml-3 text-base font-bold text-[#002b5b]">{title}</Text>
        </View>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} className="border border-blue-600 px-3 py-1 rounded-lg">
            <Text className="text-blue-600 font-medium text-xs">Editar dados</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

{/* Linha de individual de dados */}
function InfoRow({ label, value, isLast, isAction, statusColor }) {
  return (
    <View className={`flex-row justify-between py-3 ${!isLast ? 'border-b border-zinc-200/50' : ''}`}
      accessible={true}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text className="text-zinc-500 text-sm">{label}</Text>
      <View className="flex-row items-center flex-1 justify-end ml-4">
        <Text
          numberOfLines={1}
          className={'font-semibold text-zinc-800 text-sm text-right ${statusColor}'}
        >
          {value}
        </Text>
        {isAction && <Ionicons name="chevron-forward" size={16} color="#bdc3c7" className="ml-1" />}
      </View>
    </View>
  );
}