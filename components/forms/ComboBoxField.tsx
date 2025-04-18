import React, { useState } from 'react';
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { useController, Control } from 'react-hook-form';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface ComboBoxFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  options: { label: string; value: string | number }[];
}

export function ComboBoxField({
  name,
  label,
  control,
  options,
}: ComboBoxFieldProps) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  const selectedLabel =
    options.find((option) => option.value === value)?.label || 'Escolher';

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles(theme).label}>{label}</Text>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={[styles(theme).input, error && styles(theme).errorInput]}
      >
        <Text style={{ color: value ? theme.black : theme.gray }}>
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.greenLight} />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles(theme).modalOverlay}>
          <View style={styles(theme).modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <Pressable
                  style={styles(theme).option}
                  onPress={() => {
                    onChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles(theme).optionText}>{item.label}</Text>
                </Pressable>
              )}
            />
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles(theme).cancel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {error?.message && (
        <Text style={styles(theme).errorText}>{error.message}</Text>
      )}
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    label: {
      fontSize: 16,
      color: theme.black,
      marginBottom: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.greenLight,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.black,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    errorInput: {
      borderColor: theme.error,
    },
    errorText: {
      marginTop: 4,
      color: theme.error,
      fontSize: 14,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 24,
    },
    modalContent: {
      backgroundColor: theme.white,
      borderRadius: 12,
      padding: 16,
      maxHeight: '60%',
    },
    option: {
      paddingVertical: 12,
    },
    optionText: {
      fontSize: 16,
      color: theme.black,
    },
    cancel: {
      marginTop: 16,
      textAlign: 'center',
      color: theme.greenLight,
      fontSize: 16,
    },
  });
