import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { StyledText } from '@/components/StyledText'
import { useTheme } from '@/hooks/useTheme'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon'

export interface MenuItemProps {
    icon: React.ReactNode
    label: string
    onPress: () => void
    showArrow?: boolean
    arrowIcon?: React.ReactNode
    style?: object
}

export function MenuItem({
    icon,
    label,
    onPress,
    showArrow = false,
    arrowIcon,
    style,
}: MenuItemProps) {
    const theme = useTheme()

    return (
        <TouchableOpacity
            style={[styles(theme).container, style]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={styles(theme).row}>
                <View style={styles(theme).icon}>{icon}</View>
                <StyledText style={styles(theme).label}>{label}</StyledText>
            </View>
            {showArrow && (
                <View style={styles(theme).arrow}>
                    {arrowIcon ?? <ArrowRightIcon size={24} color={theme.gray} />}
                </View>
            )}
        </TouchableOpacity>
    )
}

const styles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: theme.white,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 12,
    },
    label: {
        fontSize: 16,
        color: theme.black,
    },
    arrow: {

    },
});
