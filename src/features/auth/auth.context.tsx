import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentSession,
  signInWithEmail,
  signOut as signOutFromSupabase,
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
  signIn: (form: LoginForm, selectedUserType: UserType) => Promise<void>;
  signOut: () => Promise<void>;
};

const AUTH_STORAGE_KEY = "@linka:auth-user";

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function isUserType(value: unknown): value is UserType {
  return value === "student" || value === "company";
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAuthUser() {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (storedUser) {
          setUser(JSON.parse(storedUser) as AuthUser);
          return;
        }

        const session = await getCurrentSession();
        const sessionUser = session?.user;

        if (!sessionUser?.email) {
          return;
        }

        const metadataUserType = sessionUser.user_metadata?.user_type;
        const userType = isUserType(metadataUserType)
          ? metadataUserType
          : "student";

        const fullName = sessionUser.user_metadata?.full_name;

        const authUser: AuthUser = {
          id: sessionUser.id,
          email: sessionUser.email,
          userType,
          name: typeof fullName === "string" && fullName.trim()
            ? fullName
            : sessionUser.email,
        };

        setUser(authUser);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      } catch {
        setUser(null);
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthUser();
  }, []);

  async function signIn(form: LoginForm, selectedUserType: UserType) {
    const data = await signInWithEmail(form);
    const signedUser = data.user;

    const metadataUserType = signedUser.user_metadata?.user_type;
    const userType = isUserType(metadataUserType)
      ? metadataUserType
      : selectedUserType;

    const fullName = signedUser.user_metadata?.full_name;

    const authUser: AuthUser = {
      id: signedUser.id,
      email: signedUser.email ?? form.email,
      userType,
      name: typeof fullName === "string" && fullName.trim()
        ? fullName
        : signedUser.email ?? form.email,
    };

    setUser(authUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
  }

  async function signOut() {
    try {
      await signOutFromSupabase();
    } finally {
      setUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userType: user?.userType ?? null,
      isLoading,
      isAuthenticated: Boolean(user),
      signIn,
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
