import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TopAppBar } from '../m3';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
  };
  rightActions?: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
    color?: string;
  }[];
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightActions = [],
}) => {
  return (
    <TopAppBar
      title={title}
      subtitle={subtitle}
      variant="small"
      navigationIcon={
        leftAction
          ? {
              icon: leftAction.icon,
              onPress: leftAction.onPress,
            }
          : undefined
      }
      actions={rightActions.map((a) => ({
        icon: a.icon,
        onPress: a.onPress,
        color: a.color,
      }))}
    />
  );
};
