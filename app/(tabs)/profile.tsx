import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SettingToggle } from '@/components/SettingToggle'
import { StyledText } from '@/components/StyledText'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'
import BellIcon from '@/components/icons/BellIcon'
import LogoutIcon from '@/components/icons/LogoutIcon'
import { Separator } from '@/components/Separator'
import api from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'
import { clearTokens } from '@/utils/storage'
import { MenuItem } from '@/components/MenuItem'

export default function Profile() {
  const theme = useTheme()
  const router = useRouter()
  const { signOut } = useAuth()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [anotherToggle, setAnotherToggle] = useState(false)

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      // limpa sessão no contexto e tokens em storage
      await signOut()
      await clearTokens()
      router.replace('/(auth)/login')
    } catch (err: any) {
      console.error('Erro ao fazer logout', err)
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.')
    }
  }

  return (
    <ScrollView
      style={styles(theme).container}
      showsVerticalScrollIndicator={false}
    >
      <StyledText style={styles(theme).title}>Perfil</StyledText>
      <Separator />

      <StyledText style={styles(theme).subtitle}>Informações do Usuário</StyledText>
      {/* Exiba dados específicos aqui */}
      <Separator />

      <StyledText style={styles(theme).subtitle}>Aparência e Personalização</StyledText>
      <ThemeToggle />
      <Separator />

      <StyledText style={styles(theme).subtitle}>Notificações</StyledText>
      <SettingToggle
        label="Notificações de alertas"
        value={notificationsEnabled}
        onChange={setNotificationsEnabled}
        icon={<BellIcon size={24} color={theme.black} />}
      />
      <SettingToggle
        label="Outro toggle"
        value={anotherToggle}
        onChange={setAnotherToggle}
        icon={<BellIcon size={24} color={theme.black} />}
      />
      <Separator />

      <StyledText style={styles(theme).subtitle}>Conta e Gerenciamento</StyledText>
      <MenuItem
        icon={<LogoutIcon size={24} color={theme.black} />}
        label="Sair"
        onPress={handleLogout}
        showArrow
      />
    </ScrollView>
  )
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.white,
      paddingVertical: 24,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Poppins_600SemiBold',
      color: theme.black,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Poppins_600SemiBold',
      color: theme.black,
      paddingHorizontal: 16,
    },
    button: {
      marginVertical: 16,
      marginHorizontal: 24,
    },
  })
