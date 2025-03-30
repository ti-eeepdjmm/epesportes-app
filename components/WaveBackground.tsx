import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const WaveBackground = () => {
  return (
    <View style={{ position: 'absolute', top: 0, width: '100%', zIndex: 0 }}>
      <Svg
        width="100%"
        height={380}
        viewBox="0 0 375 346"
        fill="none"
        preserveAspectRatio="none"
      >
        <Path
          d="M-163.383 -199.724C-191.444 -158.857 -210.441 -112.437 -219.096 -63.5843C-227.75 -14.7316 -225.863 35.4216 -213.56 83.5032C-166.265 269.297 27.5798 383.482 212.55 334.614C230.225 329.953 247.507 323.911 264.236 316.543C312.654 295.188 365.297 284.701 418.067 288.562C445.742 290.587 473.56 288.325 500.539 281.855C646.738 246.918 736.967 97.8071 700.106 -48.265C692.159 -79.8859 678.581 -109.816 660.025 -136.614C624.713 -187.661 599.155 -244.82 584.648 -305.188L583.775 -308.645C536.573 -495.696 342.871 -611.325 156.244 -563.839C101.966 -550.069 51.7786 -523.483 9.87541 -486.3C-32.0278 -449.118 -64.4295 -402.419 -84.6225 -350.107C-105.006 -297.103 -131.435 -246.641 -163.383 -199.724Z"
          fill="#0E7E3F"
        />
      </Svg>
    </View>
  );
};

export default WaveBackground;
