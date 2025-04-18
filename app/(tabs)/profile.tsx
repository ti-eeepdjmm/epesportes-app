import { SettingToggle } from "@/components/SettingToggle";
import { StyledText } from "@/components/StyledText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";
import BellIcon from '../../components/icons/BellIcon';
import { useState } from "react";
import { Separator } from "@/components/Separator";



export default function Profile() {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [enabled, setEnabled] = useState(false);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.white,

      }}
    >
      <Separator/>
      <StyledText style={{ fontSize: 16 }}>
        Seu Perfil
      </StyledText>
      <ThemeToggle />
      <SettingToggle
        label="Notificações"
        value={notificationsEnabled}
        onChange={setNotificationsEnabled}
        icon={<BellIcon size={24} color={theme.black} />}
      />
      <SettingToggle
        label="Notificações"
        value={enabled}
        onChange={setEnabled}
        icon={<BellIcon size={24} color={theme.black} />}
      />
      
    </View>
  );
}