import { HomeHeader } from "@/components/HomeHeader";
import { StyledText } from "@/components/StyledText"
import { useAuth } from "@/contexts/AuthContext";
import { useSmartBackHandler } from "@/hooks/useSmartBackHandler";
import { useTheme } from "@/hooks/useTheme";
import { ScrollView, StyleSheet } from "react-native";

export default function Home() {
  const theme = useTheme();
  const { user } = useAuth();
  useSmartBackHandler();

  return (
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
  });

