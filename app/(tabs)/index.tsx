import { SettingToggle } from "@/components/SettingToggle";
import { StyledText } from "@/components/StyledText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";
import BellIcon from '../../components/icons/BellIcon';
import { useState } from "react";



export default function Home() {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

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