import React from 'react';
import { UserProfile } from '../types';
import { getMemberBadge, MemberBadgeInfo } from '../utils/memberBadge';
import { Crown, Shield } from 'lucide-react';

interface MemberBadgeProps {
  userProfile?: UserProfile | null;
  badgeInfo?: MemberBadgeInfo | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const MemberBadge: React.FC<MemberBadgeProps> = ({
  userProfile,
  badgeInfo: customBadgeInfo,
  size = 'xs',
  showIcon = true,
  className = ''
}) => {
  const badge = customBadgeInfo !== undefined ? customBadgeInfo : getMemberBadge(userProfile);

  // Free (belum member) = tanpa logo apapun
  if (!badge) {
    return null;
  }

  const sizeClasses = {
    xs: 'px-1.5 py-0.2 text-[9px] gap-0.5',
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2'
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  return (
    <span
      className={`inline-flex items-center uppercase tracking-wider rounded-md font-black select-none ${sizeClasses} ${badge.pillClassName} ${className}`}
      title={badge.description}
    >
      {showIcon && (
        badge.iconType === 'crown' ? (
          <Crown className={`${iconSizes} shrink-0 fill-current`} />
        ) : (
          <Shield className={`${iconSizes} shrink-0 fill-current`} />
        )
      )}
      <span>{badge.label}</span>
    </span>
  );
};
