// components/Icons.js
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

// Professional icon components for MyHr app

export const ExamIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="2" />
    <Line x1="8" y1="9" x2="16" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="17" x2="12" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const ProfileIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <Path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const RankingIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
);

export const CertificateIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M9 9H15V15H9V9Z" fill={color} />
    <Path d="M6 6H18V3H6V6Z" fill={color} />
    <Path d="M6 21H18V18H6V21Z" fill={color} />
  </Svg>
);

export const SearchIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <Path d="M16 16L20 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const AnalyticsIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="13" width="4" height="8" rx="1" stroke={color} strokeWidth="2" />
    <Rect x="10" y="8" width="4" height="13" rx="1" stroke={color} strokeWidth="2" />
    <Rect x="17" y="3" width="4" height="18" rx="1" stroke={color} strokeWidth="2" />
  </Svg>
);

export const StarIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L14.5 9.5L22 10L16.5 15L18 22.5L12 18.5L6 22.5L7.5 15L2 10L9.5 9.5L12 2Z" fill={color} />
  </Svg>
);

export const JobIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="7" width="18" height="13" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke={color} strokeWidth="2" />
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" />
  </Svg>
);

export const CompanyIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="4" width="16" height="18" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="8" y="8" width="2" height="2" fill={color} />
    <Rect x="14" y="8" width="2" height="2" fill={color} />
    <Rect x="8" y="12" width="2" height="2" fill={color} />
    <Rect x="14" y="12" width="2" height="2" fill={color} />
    <Rect x="8" y="16" width="8" height="6" fill={color} />
  </Svg>
);

export const PlusIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const ArrowRightIcon = ({ size = 20, color = '#9CA3AF' }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path d="M7 4L13 10L7 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);