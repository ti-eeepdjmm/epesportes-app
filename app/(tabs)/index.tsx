import { StyledText } from "@/components/StyledText"
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";
import { useState } from "react";

export default function Home() {
  const theme = useTheme();
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
        Bem-vindo ao EPesportes!
      </StyledText>
    </View>
  );
}