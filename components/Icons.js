// components/Icons.js (Updated - Added ArrowLeftIcon, Kept Your SVGs)
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

export const ArrowLeftIcon = ({ size = 20, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path d="M13 16L7 10L13 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const UserIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const RefreshIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 4V10M23 4H17M1 20V14M1 20H7M21.5 7.5L17.5 3.5M17.5 3.5C16.3954 2.39543 15.0609 1.67081 13.6489 1.3845C12.2368 1.09819 10.7864 1.25979 9.45121 1.85311C8.11602 2.44643 6.89245 3.46622 5.89238 4.74624C4.8923 6.02627 4.09835 7.5232 3.56166 9.12132C3.02497 10.7194 2.75915 12.3858 2.75915 14.0609C2.75915 15.736 3.02497 17.4024 3.56166 18.9995C4.09835 20.5966 4.8923 22.0936 5.89238 23.3736C6.89245 24.6536 8.11602 25.6734 9.45121 26.2667C10.7864 26.86 12.2368 27.0216 13.6489 26.7353C15.0609 26.449 16.3954 25.7244 17.5 24.62L19 22.62M17.5 3.5L21.5 7.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const TrophyIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 14C19 16.2091 17.2091 18 15 18H9C6.79086 18 5 16.2091 5 14V7H19V14Z" stroke={color} strokeWidth="2" />
    <Path d="M12 21C13.6569 21 15 19.6569 15 18V14C15 12.3431 13.6569 11 12 11C10.3431 11 9 12.3431 9 14V18C9 19.6569 10.3431 21 12 21Z" stroke={color} strokeWidth="2" />
    <Path d="M7 7V4C7 2.89543 7.89543 2 9 2H15C16.1046 2 17 2.89543 17 4V7" stroke={color} strokeWidth="2" />
    <Path d="M7 7H17V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V7Z" fill={color} />
  </Svg>
);