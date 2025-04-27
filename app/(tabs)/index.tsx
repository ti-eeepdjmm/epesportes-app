import { AppLoader } from "@/components/AppLoader";
import { HomeHeader } from "@/components/HomeHeader";
import { StyledText } from "@/components/StyledText"
import { useAuth } from "@/contexts/AuthContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useSmartBackHandler } from "@/hooks/useSmartBackHandler";
import { useTheme } from "@/hooks/useTheme";
import { UserPreferences } from "@/types";
import api from "@/utils/api";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function Home() {
  const theme = useTheme();
  const { user } = useAuth();
  const { setTheme, theme: currentThemeKey } = useThemeContext();
  const [prefLoading, setPrefLoading] = useState(false);
  useSmartBackHandler();

  useEffect(() => {
    async function loadPreferences() {
      try {
        setPrefLoading(true);
        const res = await api.get<UserPreferences>(`/user-preferences/user/${user?.id}`);
        setTheme(res.data.darkMode ? 'dark' : 'light');
      } catch (err) {
        return
      } finally {
        setPrefLoading(false);
      }
    }
    if (user?.id) loadPreferences();
  }, [user]);
  return (
    <>
      <ScrollView
        style={styles(theme).container}
        contentContainerStyle={styles(theme).contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        <StyledText style={styles(theme).title}>
          Bem-vindo {user?.name}!
        </StyledText>
      </ScrollView>
      {(prefLoading) && (
        <View style={styles(theme).fullScreenLoader}>
          <AppLoader visible />
        </View>
      )}
    </>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.white,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 16,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Poppins_600SemiBold',
      color: theme.black,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.black,
    },
    fullScreenLoader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255,255,255,0.7)', // ou transparente se preferir
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
  });

