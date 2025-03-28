import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

type Props = {
    name: 'home' | 'resenha' | 'games' | 'profile';
    focused: boolean;
};

export function TabIcon({ name, focused }: Props) {
    const theme = useTheme();

    const icons: Record<string, { filled: JSX.Element; outline: JSX.Element }> = {
        home: {
            filled: (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M15.0595 1L1.5957 13.5106H4.93187V26.617C4.93187 27.9277 6.00421 29 7.31485 29H11.4851V19.7064C11.4851 18.9915 12.0808 18.5149 12.6766 18.5149H17.4425C18.0383 18.5149 18.634 18.9915 18.634 19.7064V29H22.6851C23.9957 29 25.068 27.9277 25.068 26.617V13.5106H28.4042L15.0595 1Z" 
                        stroke={theme.primary} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        fill={theme.primary}
                    />
                </Svg>
            ),
            outline: (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M15.0595 1L1.5957 13.5106H4.93187V26.617C4.93187 27.9277 6.00421 29 7.31485 29H11.4851V19.7064C11.4851 18.9915 12.0808 18.5149 12.6766 18.5149H17.4425C18.0383 18.5149 18.634 18.9915 18.634 19.7064V29H22.6851C23.9957 29 25.068 27.9277 25.068 26.617V13.5106H28.4042L15.0595 1Z"
                        stroke={theme.text} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    />
                </Svg>
            ),
        },
        resenha: {
            filled: (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M15.0595 1L1.5957 13.5106H4.93187V26.617C4.93187 27.9277 6.00421 29 7.31485 29H11.4851V19.7064C11.4851 18.9915 12.0808 18.5149 12.6766 18.5149H17.4425C18.0383 18.5149 18.634 18.9915 18.634 19.7064V29H22.6851C23.9957 29 25.068 27.9277 25.068 26.617V13.5106H28.4042L15.0595 1Z" 
                        stroke={theme.primary} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        fill={theme.primary}
                    />
                </Svg>
            ),
            outline: (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M15.0595 1L1.5957 13.5106H4.93187V26.617C4.93187 27.9277 6.00421 29 7.31485 29H11.4851V19.7064C11.4851 18.9915 12.0808 18.5149 12.6766 18.5149H17.4425C18.0383 18.5149 18.634 18.9915 18.634 19.7064V29H22.6851C23.9957 29 25.068 27.9277 25.068 26.617V13.5106H28.4042L15.0595 1Z"
                        stroke={theme.text} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    />
                </Svg>
            ),
        },
        games: {
            filled: (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M15.0595 1L1.5957 13.5106H4.93187V26.617C4.93187 27.9277 6.00421 29 7.31485 29H11.4851V19.7064C11.4851 18.9915 12.0808 18.5149 12.6766 18.5149H17.4425C18.0383 18.5149 18.634 18.9915 18.634 19.7064V29H22.6851C23.9957 29 25.068 27.9277 25.068 26.617V13.5106H28.4042L15.0595 1Z" 
                        stroke={theme.primary} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        fill={theme.primary}
                    />
                </Svg>
            ),
            outline: (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M15.0595 1L1.5957 13.5106H4.93187V26.617C4.93187 27.9277 6.00421 29 7.31485 29H11.4851V19.7064C11.4851 18.9915 12.0808 18.5149 12.6766 18.5149H17.4425C18.0383 18.5149 18.634 18.9915 18.634 19.7064V29H22.6851C23.9957 29 25.068 27.9277 25.068 26.617V13.5106H28.4042L15.0595 1Z"
                        stroke={theme.text} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    />
                </Svg>
            ),
        },
        profile: {
            filled: (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M15.0595 1L1.5957 13.5106H4.93187V26.617C4.93187 27.9277 6.00421 29 7.31485 29H11.4851V19.7064C11.4851 18.9915 12.0808 18.5149 12.6766 18.5149H17.4425C18.0383 18.5149 18.634 18.9915 18.634 19.7064V29H22.6851C23.9957 29 25.068 27.9277 25.068 26.617V13.5106H28.4042L15.0595 1Z" 
                        stroke={theme.primary} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        fill={theme.primary}
                    />
                </Svg>
            ),
            outline: (
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M15.0595 1L1.5957 13.5106H4.93187V26.617C4.93187 27.9277 6.00421 29 7.31485 29H11.4851V19.7064C11.4851 18.9915 12.0808 18.5149 12.6766 18.5149H17.4425C18.0383 18.5149 18.634 18.9915 18.634 19.7064V29H22.6851C23.9957 29 25.068 27.9277 25.068 26.617V13.5106H28.4042L15.0595 1Z"
                        stroke={theme.text} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    />
                </Svg>
            ),
        },
    };

    return <View style={styles.icon}>{focused ? icons[name].filled : icons[name].outline}</View>;
}

const styles = StyleSheet.create({
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
