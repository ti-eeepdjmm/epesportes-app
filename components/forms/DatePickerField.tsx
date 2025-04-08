// components/forms/DatePickerField.tsx

import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface Props {
    name: string;
    label: string;
    control: any;
    placeholder?: string;
}

export function DatePickerField({ name, label, control, placeholder }: Props) {
    const [visible, setVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    const theme = useTheme();

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 6, color: theme.black }}>{label}</Text>

                    <TouchableOpacity
                        onPress={() => {
                            setVisible(true);
                            setFocused(true);
                        }}
                        onBlur={() => setFocused(false)}
                        activeOpacity={0.8}
                        style={{
                            borderWidth: 1.5,
                            borderColor: error
                                ? 'red'
                                : focused
                                    ? theme.greenLight
                                    : '#ccc',
                            borderRadius: 8,
                            padding: 12,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: theme.white,
                        }}
                    >
                        <Text
                            style={{
                                color: value ? theme.black : '#999',
                                fontSize: 16,
                            }}
                        >
                            {value ? format(value, 'dd/MM/yyyy') : placeholder}
                        </Text>
                        <Feather name="calendar" size={20} color={theme.gray} />
                    </TouchableOpacity>

                    {error && (
                        <Text style={{ color: 'red', marginTop: 4 }}>{error.message}</Text>
                    )}

                    <DateTimePickerModal
                        isVisible={visible}
                        mode="date"
                        date={value || new Date(2000, 0, 1)}
                        onConfirm={(date) => {
                            setVisible(false);
                            setFocused(false);
                            onChange(date);
                        }}
                        onCancel={() => {
                            setVisible(false);
                            setFocused(false);
                        }}
                        textColor={theme.greenLight} // Define a cor dos textos no modal
                        themeVariant="light"
                        // display={Platform.OS === 'android' ? 'spinner' : 'default'}
                        cancelTextIOS="Cancelar"
                        confirmTextIOS="Confirmar"
                    />
                </View>
            )}
        />
    );
}
