import { StyledText } from "@/components/StyledText";
import { Text, View } from "react-native";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
     <StyledText style={{ fontSize: 16 }}>
      Bem-vindo ao EPesportes!
    </StyledText>
    </View>
  );
}