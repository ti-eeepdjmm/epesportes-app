import { StyledText } from "@/components/StyledText"
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function GamesScreen() {
  const theme = useTheme();
  const { socket } = useSocket();

  return (
    <ScrollView
      style={styles(theme).container}
      contentContainerStyle={styles(theme).contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <StyledText style={styles(theme).title}>
       Games
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
      justifyContent: "center",
      alignItems: "center",
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

