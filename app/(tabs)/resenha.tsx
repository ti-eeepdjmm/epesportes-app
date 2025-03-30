
import { StyledText } from "@/components/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";

export default function Resenha() {
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
        Tela de Resenha
      </StyledText>
    </View>
  );
}