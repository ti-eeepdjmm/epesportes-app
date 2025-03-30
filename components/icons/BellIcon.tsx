// components/icons/BellIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function BellIcon({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <Path
        d="M13 17H4C4.54494 16.6914 5.00981 16.2592 5.35719 15.7381C5.70457 15.2171 5.92474 14.6217 6 14V11C6.05956 9.73107 6.4633 8.50227 7.16795 7.4453C7.8726 6.38833 8.85159 5.54303 10 5C10 4.46957 10.2107 3.96086 10.5858 3.58579C10.9609 3.21071 11.4696 3 12 3C12.5304 3 13.0391 3.21071 13.4142 3.58579C13.7893 3.96086 14 4.46957 14 5C15.1484 5.54303 16.1274 6.38833 16.8321 7.4453C17.5367 8.50227 17.9404 9.73107 18 11V13M9 17V18C8.99993 18.482 9.11597 18.9568 9.33831 19.3844C9.56065 19.812 9.88274 20.1798 10.2773 20.4565C10.6719 20.7333 11.1273 20.9109 11.6051 20.9743C12.0829 21.0378 12.5689 20.9852 13.022 20.821M17 17V22M21 17V22" 
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}
