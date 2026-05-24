import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ProfileUser } from "./profile.types";

function getProfileStorageKey(userId: string) {
  return `@linka:profile:${userId}`;
}

export async function getStoredProfile(userId: string) {
  const storedProfile = await AsyncStorage.getItem(getProfileStorageKey(userId));

  if (!storedProfile) {
    return null;
  }

  return JSON.parse(storedProfile) as ProfileUser;
}

export async function saveStoredProfile(userId: string, profile: ProfileUser) {
  await AsyncStorage.setItem(getProfileStorageKey(userId), JSON.stringify(profile));
}
