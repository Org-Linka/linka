import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

export const supabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const hasSupabaseConfig = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey,
);

const isWeb = Platform.OS === "web";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase URL ou Anon Key não configuradas.");
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        auth: {
          storage: isWeb ? undefined : AsyncStorage,
          autoRefreshToken: true,
          persistSession: !isWeb,
          detectSessionInUrl: false,
        },
      },
    );
  }

  return supabaseClient;
}