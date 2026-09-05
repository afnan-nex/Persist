import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { TextButton, FilledButton } from '../m3';
import { KeyboardAwareDialog } from './KeyboardAwareModal';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  const { colors, typography, fontFamily } = useTheme();

  const headerContent = (
    <Text
      style={[
        styles.title,
        {
          ...typography.headlineSmall,
          color: colors.onSurface,
          fontFamily,
        },
      ]}
    >
      {title}
    </Text>
  );

  const footerContent = (
    <View style={styles.buttonRow}>
      <TextButton
        label={cancelText}
        onPress={onCancel}
        textColor={colors.primary}
      />
      {isDestructive ? (
        <FilledButton
          label={confirmText}
          onPress={onConfirm}
          containerColor={colors.error}
          textColor={colors.onError}
        />
      ) : (
        <FilledButton
          label={confirmText}
          onPress={onConfirm}
        />
      )}
    </View>
  );

  return (
    <KeyboardAwareDialog
      visible={visible}
      onRequestClose={onCancel}
      header={headerContent}
      footer={footerContent}
      maxWidth={340}
    >
      <Text
        style={[
          styles.message,
          {
            ...typography.bodyMedium,
            color: colors.onSurfaceVariant,
            fontFamily,
          },
        ]}
      >
        {message}
      </Text>
    </KeyboardAwareDialog>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
  },
  message: {
    lineHeight: 20,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
});
