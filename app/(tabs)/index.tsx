import { HomeHeader } from "@/components/HomeHeader";
import { StyledText } from "@/components/StyledText"
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function Home() {
  const theme = useTheme();
  const { socket } = useSocket();
  const { user } = useAuth()


  useEffect(() => {
    if (!socket) return;

    socket.on('Match:update', (payload) => {
      console.log('🆕 Nova partida!:', payload);
    });

    return () => {
      socket.off('Match:update');
    };

  }, [socket]);


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

