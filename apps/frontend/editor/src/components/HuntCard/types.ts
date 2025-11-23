import { ReactNode } from 'react';

export interface HuntCardTitleProps {
  icon?: ReactNode;
  count?: number;
  children: ReactNode;
}

export interface HuntCardSubtitleProps {
  children: ReactNode;
}

export interface HuntCardImageProps {
  src?: string;
  alt?: string;
  height?: number;
  isPublished?: boolean;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export interface HuntCardBadgeProps {
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

export interface HuntCardActionsProps {
  children: ReactNode;
}

export interface HuntCardHeaderProps {
  children: ReactNode;
}
