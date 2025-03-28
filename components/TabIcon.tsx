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
                <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
                    <Path
                        d="M15.0595 1L1.5957 13.5106H4.93187V26.617C4.93187 27.9277 6.00421 29 7.31485 29H11.4851V19.7064C11.4851 18.9915 12.0808 18.5149 12.6766 18.5149H17.4425C18.0383 18.5149 18.634 18.9915 18.634 19.7064V29H22.6851C23.9957 29 25.068 27.9277 25.068 26.617V13.5106H28.4042L15.0595 1Z"
                        stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        fill="white"
                    />
                </Svg>
            ),
            outline: (
                <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
                    <Path
                        d="M15.0595 1L1.5957 13.5106H4.93187V26.617C4.93187 27.9277 6.00421 29 7.31485 29H11.4851V19.7064C11.4851 18.9915 12.0808 18.5149 12.6766 18.5149H17.4425C18.0383 18.5149 18.634 18.9915 18.634 19.7064V29H22.6851C23.9957 29 25.068 27.9277 25.068 26.617V13.5106H28.4042L15.0595 1Z"
                        stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    />
                </Svg>
            ),
        },
        resenha: {
            filled: (
                <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
                    <Path
                        d="M17.3334 2.00001C15.1087 1.998 12.9155 2.52673 10.9361 3.54229C8.95669 4.55785 7.24808 6.03094 5.95214 7.83926C4.6562 9.64758 3.81032 11.739 3.48473 13.9397C3.15914 16.1405 3.36324 18.3873 4.08008 20.4933L0.666748 29.64L10.3201 28.1067C12.179 29.1862 14.2616 29.8231 16.4063 29.9681C18.5511 30.1131 20.7004 29.7623 22.6877 28.9428C24.675 28.1233 26.4469 26.8572 27.8661 25.2426C29.2852 23.628 30.3135 21.7082 30.8712 19.6322C31.4289 17.5562 31.5011 15.3796 31.0821 13.2712C30.6631 11.1628 29.7642 9.17915 28.4551 7.47411C27.146 5.76906 25.4618 4.38838 23.5331 3.43908C21.6044 2.48978 19.4831 1.99737 17.3334 2.00001ZM23.7867 15.76L20.2401 18.88C20.0374 19.0357 19.789 19.1201 19.5334 19.1201C19.2778 19.1201 19.0294 19.0357 18.8267 18.88L16.0001 16.3733L13.1201 18.88C12.9387 19.0367 12.7065 19.122 12.4667 19.12H12.2001C12.0015 19.0665 11.8161 18.9726 11.6555 18.8441C11.4948 18.7156 11.3625 18.5554 11.2667 18.3733C11.0959 18.0221 11.0476 17.6237 11.1298 17.2418C11.212 16.8599 11.4198 16.5166 11.7201 16.2667L15.2667 13.1467C15.4694 12.991 15.7178 12.9066 15.9734 12.9066C16.229 12.9066 16.4774 12.991 16.6801 13.1467L19.5334 15.6533L22.3734 13.1467C22.5011 13.0399 22.6522 12.9649 22.8144 12.9278C22.9767 12.8908 23.1454 12.8926 23.3067 12.9333C23.5054 12.9868 23.6908 13.0807 23.8514 13.2092C24.012 13.3377 24.1443 13.498 24.2401 13.68C24.3998 14.0291 24.442 14.4205 24.3603 14.7956C24.2785 15.1707 24.0773 15.5091 23.7867 15.76Z"
                        fill="white"
                    />
                    <Path
                        d="M17.3334 3.56C14.0045 3.53158 10.8005 4.82586 8.42541 7.15846C6.05031 9.49107 4.69838 12.6712 4.6667 16C4.67086 17.5389 4.96488 19.0633 5.53337 20.4933L2.8667 27.72L10.5867 26.5067C12.6124 27.7651 14.9486 28.4346 17.3334 28.44C20.6622 28.4684 23.8662 27.1741 26.2413 24.8415C28.6164 22.5089 29.9683 19.3288 30 16C29.9683 12.6712 28.6164 9.49107 26.2413 7.15846C23.8662 4.82586 20.6622 3.53158 17.3334 3.56Z"
                        stroke="white" stroke-width="2" stroke-miterlimit="10"
                    />
                </Svg>
            ),
            outline: (
                <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
                    <Path
                        d="M17.3334 3.56C14.0045 3.53158 10.8005 4.82586 8.42541 7.15846C6.05031 9.49107 4.69838 12.6712 4.6667 16C4.67086 17.5389 4.96488 19.0633 5.53337 20.4933L2.8667 27.72L10.5867 26.5067C12.6124 27.7651 14.9486 28.4346 17.3334 28.44C20.6622 28.4684 23.8662 27.1741 26.2413 24.8415C28.6164 22.5089 29.9683 19.3288 30 16C29.9683 12.6712 28.6164 9.49107 26.2413 7.15846C23.8662 4.82586 20.6622 3.53158 17.3334 3.56Z"
                        stroke="white" stroke-width="2" stroke-miterlimit="10"
                    />
                    <Path
                        d="M24.2399 13.6533C24.1442 13.4713 24.0118 13.311 23.8512 13.1826C23.6906 13.0541 23.5052 12.9602 23.3066 12.9067C23.1452 12.866 22.9765 12.8641 22.8143 12.9012C22.6521 12.9383 22.5009 13.0133 22.3733 13.12L19.5333 15.6267L16.6799 13.12C16.4772 12.9643 16.2288 12.8799 15.9733 12.8799C15.7177 12.8799 15.4693 12.9643 15.2666 13.12L11.7199 16.24C11.4197 16.4899 11.2118 16.8332 11.1297 17.2151C11.0475 17.597 11.0957 17.9954 11.2666 18.3467C11.3624 18.5287 11.4947 18.689 11.6553 18.8175C11.8159 18.9459 12.0013 19.0399 12.1999 19.0933H12.4666C12.7063 19.0954 12.9385 19.0101 13.1199 18.8533L15.9999 16.3733L18.8533 18.88C19.0559 19.0357 19.3043 19.1201 19.5599 19.1201C19.8155 19.1201 20.0639 19.0357 20.2666 18.88L23.8133 15.76C24.1052 15.504 24.3051 15.1593 24.3821 14.7787C24.4592 14.3981 24.4093 14.0028 24.2399 13.6533Z"
                        fill="white"
                    />
                </Svg>
            ),
        },
        games: {
            filled: (
                <Svg  width={32} height={32} viewBox="0 0 32 32" fill="none">
                    <Path d="M13.3333 0C10.6963 0 8.11839 0.781986 5.92573 2.24707C3.73308 3.71216 2.02411 5.79454 1.01495 8.23088C0.00577713 10.6672 -0.258267 13.3481 0.256202 15.9345C0.770672 18.5209 2.04055 20.8967 3.90525 22.7614C5.76995 24.6261 8.14572 25.896 10.7321 26.4105C13.3185 26.9249 15.9994 26.6609 18.4358 25.6517C20.8721 24.6426 22.9545 22.9336 24.4196 20.7409C25.8847 18.5483 26.6667 15.9704 26.6667 13.3333C26.6629 9.79826 25.257 6.40904 22.7573 3.90936C20.2576 1.40969 16.8684 0.0037331 13.3333 0ZM14.359 5.04872L17.5372 2.86282C19.3569 3.59577 20.9551 4.78851 22.1756 6.32436L21.15 9.7782C21.1244 9.7782 21.0974 9.79102 21.0718 9.8L18.1462 10.75C18.1023 10.7642 18.0595 10.7813 18.0179 10.8013L14.359 8.28461V5.04872ZM9.13334 2.86282L12.3077 5.04872V8.28461L8.64616 10.8064C8.60462 10.7865 8.56179 10.7693 8.51795 10.7551L5.59231 9.80513C5.56667 9.79615 5.53975 9.78974 5.51411 9.78333L4.48847 6.32949C5.71011 4.79087 7.31074 3.59625 9.13334 2.86282ZM7.46667 19.4128H3.83334C2.76979 17.7592 2.16006 15.8549 2.06539 13.891L4.8859 11.7269C4.91019 11.7376 4.935 11.747 4.96026 11.7551L7.88718 12.7064C7.92633 12.7182 7.96614 12.7276 8.00641 12.7346L9.38975 16.7628C9.37052 16.7859 9.35129 16.809 9.33334 16.8333L7.52564 19.3218C7.50439 19.3511 7.48471 19.3815 7.46667 19.4128ZM16.2423 24.2308C14.3362 24.7384 12.3305 24.7384 10.4244 24.2308L9.13462 20.5897C9.15129 20.5692 9.16923 20.55 9.18462 20.5282L10.9936 18.0385C11.0148 18.0096 11.0345 17.9796 11.0526 17.9487H15.6141C15.6322 17.9796 15.6519 18.0096 15.6731 18.0385L17.4821 20.5282C17.4974 20.55 17.5154 20.5692 17.5321 20.5897L16.2423 24.2308ZM19.2 19.409C19.182 19.3776 19.1623 19.3472 19.141 19.3179L17.3321 16.8333C17.3141 16.809 17.2949 16.7859 17.2756 16.7628L18.659 12.7346C18.6992 12.7276 18.7391 12.7182 18.7782 12.7064L21.7051 11.7551C21.7304 11.747 21.7552 11.7376 21.7795 11.7269L24.6 13.891C24.5053 15.8549 23.8956 17.7592 22.8321 19.4128L19.2 19.409Z" fill="white"/>
                </Svg>
            ),
            outline: (
                <Svg width={32} height={32}viewBox="0 0 32 32" fill="none">
                     <Path d="M10.7559 22.9128H10.4667H6.83334H6.56043L6.41281 22.6833C5.3018 20.9559 4.66486 18.9666 4.56597 16.9151L4.55337 16.6537L4.76102 16.4943L7.58153 14.3302L7.81629 14.1501L8.08715 14.2692C8.09566 14.273 8.10435 14.2762 8.11318 14.2791L8.11481 14.2796L11.0356 15.2289C11.0542 15.2343 11.0731 15.2387 11.0922 15.242L11.3833 15.2928L11.4793 15.5722L12.8626 19.6004L12.9541 19.8667L12.7739 20.0829C12.7538 20.107 12.7442 20.1188 12.7366 20.1289C12.7364 20.1292 12.7361 20.1296 12.7359 20.1299L10.9303 22.6155L10.7559 22.9128ZM10.7559 22.9128L10.9001 22.6621M10.7559 22.9128L10.9001 22.6621M10.9001 22.6621C10.9093 22.6461 10.9193 22.6306 10.9302 22.6157L10.9001 22.6621ZM17.0756 7.63675L16.859 7.78576V8.04872V11.2846V11.5476L17.0756 11.6966L20.7346 14.2132L20.9733 14.3774L21.2345 14.252C21.2558 14.2417 21.2777 14.233 21.3002 14.2257L21.3006 14.2256L24.2181 13.2782H24.5231L24.6293 12.9205L25.655 9.46669L25.7291 9.21711L25.5671 9.01328C24.2927 7.40968 22.624 6.16432 20.724 5.39903L20.475 5.29874L20.2538 5.45085L17.0756 7.63675ZM12.4169 5.45101L12.1958 5.29873L11.9467 5.39897C10.0437 6.16476 8.37243 7.41208 7.09689 9.01858L6.93508 9.22237L7.00915 9.47182L8.03479 12.9257L8.11602 13.1992L8.39283 13.2684L8.40303 13.2709L8.41156 13.2731L8.42364 13.2762C8.42511 13.2766 8.42625 13.2769 8.4271 13.2771L8.42708 13.2772L8.43789 13.2807L11.3635 14.2307L11.3639 14.2308C11.3864 14.2381 11.4083 14.2469 11.4296 14.2571L11.691 14.3827L11.9298 14.2182L15.5913 11.6964L15.8077 11.5474V11.2846V8.04872V7.78594L15.5913 7.63691L12.4169 5.45101ZM19.371 27.7139L19.6256 27.6461L19.7136 27.3977L21.0034 23.7567L21.097 23.4922L20.9201 23.2745C20.9126 23.2652 20.9056 23.2569 20.9006 23.251L20.8892 23.2376C20.8884 23.2366 20.8877 23.2358 20.8872 23.2352L20.8866 23.2343L19.0776 20.7446L19.076 20.7424C19.0651 20.7276 19.055 20.7122 19.0458 20.6964L18.901 20.4487H18.6141H14.0526H13.7657L13.6209 20.6964C13.6116 20.7122 13.6016 20.7276 13.5907 20.7424L13.5891 20.7446L11.7801 23.2343L11.7801 23.2343L11.7792 23.2355C11.7787 23.2361 11.7782 23.2368 11.7775 23.2376L11.7661 23.251C11.7611 23.2569 11.7541 23.2652 11.7466 23.2745L11.5696 23.4922L11.6633 23.7567L12.9531 27.3977L13.041 27.6461L13.2957 27.7139C15.2861 28.2441 17.3806 28.2441 19.371 27.7139ZM21.7666 22.6583L21.9106 22.9087L22.1995 22.909L25.8315 22.9128L26.1048 22.9131L26.2526 22.6833C27.3636 20.9559 28.0005 18.9666 28.0994 16.9151L28.112 16.6537L27.9044 16.4943L25.0839 14.3302L24.8491 14.1501L24.5782 14.2692C24.5697 14.273 24.561 14.2762 24.5522 14.2791L24.5506 14.2796L21.6298 15.2289C21.6112 15.2343 21.5923 15.2387 21.5731 15.242L21.282 15.2928L21.1861 15.5722L19.8027 19.6004L19.7113 19.8666L19.8915 20.0829C19.9117 20.1071 19.9213 20.1189 19.9288 20.129C19.9291 20.1293 19.9293 20.1296 19.9295 20.1299L21.7364 22.6116C21.7473 22.6266 21.7573 22.6422 21.7666 22.6583ZM9.20352 5.66281C11.3139 4.25271 13.795 3.50005 16.3331 3.5C19.7356 3.50366 22.9978 4.85694 25.4037 7.26292C27.8098 9.66895 29.1631 12.9312 29.1667 16.3339C29.1666 18.8719 28.4139 21.3529 27.0039 23.4631C25.5937 25.5736 23.5894 27.2185 21.2444 28.1898C18.8995 29.1611 16.3191 29.4152 13.8297 28.9201C11.3403 28.4249 9.05357 27.2026 7.2588 25.4079C5.46403 23.6131 4.24177 21.3264 3.74659 18.837C3.25142 16.3476 3.50556 13.7672 4.47689 11.4222C5.44821 9.07724 7.09309 7.07295 9.20352 5.66281Z" stroke="white"/>
                </Svg>
            ),
        },
        profile: {
            filled: (
                <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
                    <Path
                        d="M16.0001 14.1466C17.841 14.1466 19.3334 12.6543 19.3334 10.8133C19.3334 8.97236 17.841 7.47998 16.0001 7.47998C14.1591 7.47998 12.6667 8.97236 12.6667 10.8133C12.6667 12.6543 14.1591 14.1466 16.0001 14.1466Z"
                        fill="white" stroke="white" stroke-width="2" stroke-miterlimit="10"
                    />
                    <Path
                        d="M16.0001 29.3334C23.3639 29.3334 29.3334 23.3638 29.3334 16C29.3334 8.63622 23.3639 2.66669 16.0001 2.66669C8.63628 2.66669 2.66675 8.63622 2.66675 16C2.66675 23.3638 8.63628 29.3334 16.0001 29.3334Z"
                        stroke="white" stroke-width="2" stroke-miterlimit="10"
                    />
                    <Path
                        d="M16 20C14.1641 20.0021 12.3483 20.3833 10.6666 21.1198C8.98482 21.8563 7.47328 22.9322 6.22667 24.28C6.13017 24.3857 6.07666 24.5236 6.07666 24.6667C6.07666 24.8098 6.13017 24.9477 6.22667 25.0534C7.44501 26.3662 8.91536 27.4202 10.55 28.1523C12.1846 28.8844 13.95 29.2797 15.7407 29.3146C17.5315 29.3494 19.3109 29.0231 20.9727 28.3551C22.6346 27.6871 24.1449 26.6912 25.4133 25.4267C25.5141 25.3274 25.5942 25.2091 25.6488 25.0787C25.7034 24.9482 25.7316 24.8081 25.7316 24.6667C25.7316 24.5252 25.7034 24.3852 25.6488 24.2547C25.5942 24.1242 25.5141 24.0059 25.4133 23.9067C24.1802 22.6659 22.7134 21.6818 21.0976 21.0113C19.4819 20.3408 17.7493 19.997 16 20Z"
                        fill="white" stroke="white" stroke-width="2" stroke-miterlimit="10"
                    />
                </Svg>
            ),
            outline: (
                <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
                    <Path
                        d="M16.0001 14.1466C17.841 14.1466 19.3334 12.6543 19.3334 10.8133C19.3334 8.97236 17.841 7.47998 16.0001 7.47998C14.1591 7.47998 12.6667 8.97236 12.6667 10.8133C12.6667 12.6543 14.1591 14.1466 16.0001 14.1466Z"
                        stroke="white" stroke-width="2" stroke-miterlimit="10"
                    />
                    <Path
                        d="M16.0001 29.3334C23.3639 29.3334 29.3334 23.3638 29.3334 16C29.3334 8.63622 23.3639 2.66669 16.0001 2.66669C8.63628 2.66669 2.66675 8.63622 2.66675 16C2.66675 23.3638 8.63628 29.3334 16.0001 29.3334Z"
                        stroke="white" stroke-width="2" stroke-miterlimit="10"
                    />
                    <Path
                        d="M16 20C14.1641 20.0021 12.3483 20.3833 10.6666 21.1198C8.98482 21.8563 7.47328 22.9322 6.22667 24.28C6.13017 24.3857 6.07666 24.5236 6.07666 24.6667C6.07666 24.8098 6.13017 24.9477 6.22667 25.0534C7.44501 26.3662 8.91536 27.4202 10.55 28.1523C12.1846 28.8844 13.95 29.2797 15.7407 29.3146C17.5315 29.3494 19.3109 29.0231 20.9727 28.3551C22.6346 27.6871 24.1449 26.6912 25.4133 25.4267C25.5141 25.3274 25.5942 25.2091 25.6488 25.0787C25.7034 24.9482 25.7316 24.8081 25.7316 24.6667C25.7316 24.5252 25.7034 24.3852 25.6488 24.2547C25.5942 24.1242 25.5141 24.0059 25.4133 23.9067C24.1802 22.6659 22.7134 21.6818 21.0976 21.0113C19.4819 20.3408 17.7493 19.997 16 20Z"
                        stroke="white" stroke-width="2" stroke-miterlimit="10"
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
