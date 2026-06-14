import { Ionicons } from "@expo/vector-icons";
import { Slot, usePathname, useRouter, type Href } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#2F3B69",
  secondary: "#3E829A",
  accent: "#FFDE59",
  background: "#FAFAFF",
  surface: "#FFFFFF",
  border: "#ECECF4",
  muted: "#7A7F99",
};

/* -------------------------------------------------------------------------- */
/* Controle simples do drawer                                                  */
/* -------------------------------------------------------------------------- */

let registeredOpen: () => void = () => {};

export function openAdminDrawer() {
  registeredOpen();
}

/* -------------------------------------------------------------------------- */
/* Drawer                                                                      */
/* -------------------------------------------------------------------------- */

type DrawerItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
};

const ITEMS: DrawerItem[] = [
  {
    label: "Dashboard",
    icon: "grid-outline",
    route: "/admin",
  },
  {
    label: "Usuários",
    icon: "people-outline",
    route: "/admin/users",
  },
  {
    label: "Projetos",
    icon: "cube-outline",
    route: "/admin/projects",
  },
  {
    label: "Empresas",
    icon: "business-outline",
    route: "/admin/companies",
  },
  {
    label: "Vagas",
    icon: "briefcase-outline",
    route: "/admin/opportunities",
  },
];

/* -------------------------------------------------------------------------- */
/* Layout                                                                      */
/* -------------------------------------------------------------------------- */

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const { width } = useWindowDimensions();

  const drawerWidth = Math.min(Math.max(width * 0.55, 240), 320);

  const [mounted, setMounted] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;

  const open = () => {
    setMounted(true);

    Animated.timing(progress, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  };

  useEffect(() => {
    registeredOpen = open;

    return () => {
      registeredOpen = () => {};
    };
  }, []);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  const isActive = (route: string) => {
    if (route === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(route);
  };

  const go = (route: Href) => {
    close();

    setTimeout(() => {
      router.push(route);
    }, 120);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <Slot />

        {mounted && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View
              pointerEvents="auto"
              style={[
                styles.backdrop,
                {
                  opacity: backdropOpacity,
                },
              ]}
            >
              <Pressable style={StyleSheet.absoluteFill} onPress={close} />
            </Animated.View>

            <Animated.View
              style={[
                styles.drawer,
                {
                  width: drawerWidth,
                  transform: [
                    {
                      translateX,
                    },
                  ],
                },
              ]}
            >
              <SafeAreaView edges={["top", "bottom"]} style={styles.drawerSafe}>
                <View style={styles.brand}>
                  <Image
                    source={require("../../../assets/images/logoLightLinka.png")}
                    style={styles.brandLogo}
                    resizeMode="contain"
                  />

                  <View>
                    <Text style={styles.brandTitle}>Administração</Text>

                    <Text style={styles.brandSub}>Painel de visualização</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.items}>
                  {ITEMS.map((item) => {
                    const active = isActive(item.route.toString());

                    return (
                      <Pressable
                        key={item.label}
                        onPress={() => go(item.route)}
                        style={({ pressed }) => [
                          styles.item,
                          active && styles.itemActive,
                          pressed && styles.itemPressed,
                        ]}
                      >
                        {active && <View style={styles.activeBar} />}

                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={active ? COLORS.primary : COLORS.muted}
                        />

                        <Text
                          style={[
                            styles.itemLabel,
                            active && styles.itemLabelActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.drawerFooter}>
                  <Text style={styles.footerText}>Modo somente leitura</Text>
                </View>
              </SafeAreaView>
            </Animated.View>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1B2138",
  },

  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,

    backgroundColor: COLORS.surface,

    borderTopRightRadius: 24,

    borderBottomRightRadius: 24,

    shadowColor: "#1B2138",

    shadowOffset: {
      width: 6,
      height: 0,
    },

    shadowOpacity: 0.16,

    shadowRadius: 24,

    elevation: 12,
  },

  drawerSafe: {
    flex: 1,
    paddingHorizontal: 16,
  },

  brand: {
    flexDirection: "row",

    alignItems: "center",

    gap: 12,

    paddingTop: 12,

    paddingBottom: 18,
  },

  brandLogo: {
    width: 40,
    height: 40,
  },

  brandTitle: {
    fontSize: 16,
    fontWeight: "700",

    color: COLORS.primary,
  },

  brandSub: {
    fontSize: 12,

    color: COLORS.muted,

    marginTop: 2,
  },

  divider: {
    height: 1,

    backgroundColor: COLORS.border,

    marginBottom: 12,
  },

  items: {
    flex: 1,

    gap: 6,
  },

  item: {
    flexDirection: "row",

    alignItems: "center",

    gap: 14,

    paddingVertical: 14,

    paddingHorizontal: 14,

    borderRadius: 14,

    overflow: "hidden",
  },

  itemActive: {
    backgroundColor: "#F1F4FB",
  },

  itemPressed: {
    opacity: 0.75,
  },

  activeBar: {
    position: "absolute",

    left: 0,

    top: 10,

    bottom: 10,

    width: 4,

    borderRadius: 4,

    backgroundColor: COLORS.accent,
  },

  itemLabel: {
    fontSize: 15,

    fontWeight: "600",

    color: COLORS.muted,
  },

  itemLabelActive: {
    color: COLORS.primary,
  },

  drawerFooter: {
    paddingVertical: 16,
  },

  footerText: {
    fontSize: 12,

    color: COLORS.muted,
  },
});
