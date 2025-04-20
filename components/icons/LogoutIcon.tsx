// components/icons/BellIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function LogoutIcon({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <Path
         d="M14 8V6C14 5.46957 13.7893 4.96086 13.4142 4.58579C13.0391 4.21071 12.5304 4 12 4H5C4.46957 4 3.96086 4.21071 3.58579 4.58579C3.21071 4.96086 3 5.46957 3 6V18C3 18.5304 3.21071 19.0391 3.58579 19.4142C3.96086 19.7893 4.46957 20 5 20H12C12.5304 20 13.0391 19.7893 13.4142 19.4142C13.7893 19.0391 14 18.5304 14 18V16M9 12H21M21 12L18 9M21 12L18 15" 
         stroke={color} strokeWidth={2} stroke-linecap="round" stroke-linejoin="round"
      />
    </Svg>
  );
}
