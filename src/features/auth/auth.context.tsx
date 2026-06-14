import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

import {
  createDefaultProfileForAuthUser,
  getAuthProfile,
} from "@/features/profile/profile.service";
import { loadOneSignal } from "@/shared/lib/onesignal";

import {
  getCurrentUser,
  signInWithEmail,
  signInWithSocialProvider,
  signOut as signOutFromSupabase,
  type SocialAuthProvider,
} from "./auth.service";
import type { LoginForm, UserType } from "./auth.types";

type AuthUser = {
  id: string;
  email: string;
  userType: UserType;
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  userType: UserType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (form: LoginForm) => Promise<AuthUser>;
  signInWithSocial: (
    provider: SocialAuthProvider,
    userType?: UserType,
  ) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function getFallbackSocialName(email: string, metadataName?: string | null) {
  if (metadataName?.trim()) {
    return metadataName.trim();
  }

  return email.split("@")[0] || "Usuário Linka";
}

function getSocialAvatarUrl(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) return null;

  const picture = metadata.picture;
  const avatarUrl = metadata.avatar_url;

  if (typeof picture === "string" && picture.trim()) {
    return picture.trim();
  }

  if (typeof avatarUrl === "string" && avatarUrl.trim()) {
    return avatarUrl.trim();
  }

  return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuthUser() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) {
          setUser(null);
          return;
        }

        const profile = await getAuthProfile(currentUser.id);
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthUser();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID) return;

    let isMounted = true;

    async function syncOneSignalUser() {
      const oneSignalModule = await loadOneSignal();
      if (!isMounted || !oneSignalModule) return;

      const { OneSignal } = oneSignalModule;

      if (user?.id) {
        OneSignal.login(user.id);
      } else {
        OneSignal.logout();
      }
    }

    void syncOneSignalUser();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  async function signIn(form: LoginForm) {
    const data = await signInWithEmail(form);
    const signedUser = data.user;

    if (!signedUser?.id) {
      throw new Error("Usuário não retornado pelo Supabase.");
    }

    const profile = await getAuthProfile(signedUser.id);
    setUser(profile);

    return profile;
  }

  async function signInWithSocial(
    provider: SocialAuthProvider,
    userType: UserType = "student",
  ) {
    const data = await signInWithSocialProvider(provider);
    const signedUser = data.user;

    if (!signedUser?.id) {
      throw new Error("Usuário não retornado pelo Supabase.");
    }

    try {
      const profile = await getAuthProfile(signedUser.id);
      setUser(profile);

      return profile;
    } catch {
      const email = signedUser.email ?? "";
      const fullName = getFallbackSocialName(
        email,
        signedUser.user_metadata?.full_name ??
          signedUser.user_metadata?.name ??
          signedUser.user_metadata?.display_name,
      );
      const avatarUrl = getSocialAvatarUrl(signedUser.user_metadata);

      await createDefaultProfileForAuthUser({
        id: signedUser.id,
        email,
        fullName,
        userType,
        avatarUrl,
      });

      const profile = await getAuthProfile(signedUser.id);
      setUser(profile);

      return profile;
    }
  }

  async function signOut() {
    try {
      await signOutFromSupabase();
    } finally {
      setUser(null);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userType: user?.userType ?? null,
      isLoading,
      isAuthenticated: Boolean(user),
      signIn,
      signInWithSocial,
      signOut,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}