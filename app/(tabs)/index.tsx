import { StyledText } from "@/components/StyledText"
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.grayBackground,

      }}
    >
      <StyledText style={{ fontSize: 16 }}>
        Bem-vindo {user?.name}!
      </StyledText>
    </View>
  );
}