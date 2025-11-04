// components/Icons.js (COMPLETE - All Icons + TrashIcon + EyeIcon)
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

// === EXISTING ICONS (Unchanged) ===
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

export const NotificationIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CloseIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const LocationIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" fill={color} />
  </Svg>
);

export const SalaryIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path d="M12 6V18M9 9h6M9 15h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const DocumentIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 13H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M9 17H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const DownloadIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 15L12 3M12 15L16 11M12 15L8 11M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// === NEW ICONS ===
export const TrashIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 11V17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const EyeIcon = ({ size = 24, color = '#0047AB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);