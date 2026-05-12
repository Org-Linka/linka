import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { TAB_BAR_HEIGHT } from '../../constants/layout';
import Logo from '../../assets/images/logoLight.png';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={['top']}>
      <View className="flex-1 bg-white">

        {/* Header */}
        <View className=""></View>

      </View>
    </SafeAreaView>
  )
}
