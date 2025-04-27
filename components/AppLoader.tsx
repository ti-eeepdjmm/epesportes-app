import React, { useEffect, useRef } from 'react';
import {
    View,
    Animated,
    Easing,
    StyleSheet,
    Modal,
    ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface AppLoaderProps {
    visible: boolean;
}

export function AppLoader({ visible }: AppLoaderProps) {
    const rotation = useRef(new Animated.Value(0)).current;
    const theme = useTheme();

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotation, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ).start();
    }, []);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles(theme).overlay}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Svg width={40} height={40} viewBox="0 0 32 32" fill="none">
                        <Path
                            d="M16.3333 3C13.6963 3 11.1184 3.78199 8.92573 5.24707C6.73308 6.71216 5.02411 8.79454 4.01495 11.2309C3.00578 13.6672 2.74173 16.3481 3.2562 18.9345C3.77067 21.5209 5.04055 23.8967 6.90525 25.7614C8.76995 27.6261 11.1457 28.896 13.7321 29.4105C16.3185 29.9249 18.9994 29.6609 21.4358 28.6517C23.8721 27.6426 25.9545 25.9336 27.4196 23.7409C28.8847 21.5483 29.6667 18.9704 29.6667 16.3333C29.6629 12.7983 28.257 9.40904 25.7573 6.90936C23.2576 4.40969 19.8684 3.00373 16.3333 3ZM17.359 8.04872L20.5372 5.86282C22.3569 6.59577 23.9551 7.78851 25.1756 9.32436L24.15 12.7782C24.1244 12.7782 24.0974 12.791 24.0718 12.8L21.1462 13.75C21.1023 13.7642 21.0595 13.7813 21.0179 13.8013L17.359 11.2846V8.04872ZM12.1333 5.86282L15.3077 8.04872V11.2846L11.6462 13.8064C11.6046 13.7865 11.5618 13.7693 11.518 13.7551L8.59231 12.8051C8.56667 12.7962 8.53975 12.7897 8.51411 12.7833L7.48847 9.32949C8.71011 7.79087 10.3107 6.59625 12.1333 5.86282ZM10.4667 22.4128H6.83334C5.76979 20.7592 5.16006 18.8549 5.06539 16.891L7.8859 14.7269C7.91019 14.7376 7.935 14.747 7.96026 14.7551L10.8872 15.7064C10.9263 15.7182 10.9661 15.7276 11.0064 15.7346L12.3897 19.7628C12.3705 19.7859 12.3513 19.809 12.3333 19.8333L10.5256 22.3218C10.5044 22.3511 10.4847 22.3815 10.4667 22.4128ZM19.2423 27.2308C17.3362 27.7384 15.3305 27.7384 13.4244 27.2308L12.1346 23.5897C12.1513 23.5692 12.1692 23.55 12.1846 23.5282L13.9936 21.0385C14.0148 21.0096 14.0345 20.9796 14.0526 20.9487H18.6141C18.6322 20.9796 18.6519 21.0096 18.6731 21.0385L20.4821 23.5282C20.4974 23.55 20.5154 23.5692 20.5321 23.5897L19.2423 27.2308ZM22.2 22.409C22.182 22.3776 22.1623 22.3472 22.141 22.3179L20.3321 19.8333C20.3141 19.809 20.2949 19.7859 20.2756 19.7628L21.659 15.7346C21.6992 15.7276 21.7391 15.7182 21.7782 15.7064L24.7051 14.7551C24.7304 14.747 24.7552 14.7376 24.7795 14.7269L27.6 16.891C27.5053 18.8549 26.8956 20.7592 25.8321 22.4128L22.2 22.409Z"
                            fill={theme.greenLight} />
                    </Svg>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = (theme:any)=> StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: theme.white, // leve esmaecimento
        opacity:0.8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
