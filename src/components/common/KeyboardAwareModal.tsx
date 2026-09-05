import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  useWindowDimensions,
  KeyboardEvent,
  StyleProp,
  ViewStyle,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

/**
 * Hook providing live keyboard metrics, smooth animation value,
 * and dynamic available viewport height calculation across iOS and Android.
 */
export function useKeyboardAware() {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const animatedBottomOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: KeyboardEvent) => {
      const h = e.endCoordinates.height;
      setKeyboardHeight(h);
      setIsKeyboardVisible(true);
      Animated.timing(animatedBottomOffset, {
        toValue: h,
        duration: e.duration || (Platform.OS === 'ios' ? 250 : 200),
        easing: Platform.OS === 'ios' ? Easing.out(Easing.cubic) : Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    };

    const onHide = (e?: KeyboardEvent) => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
      Animated.timing(animatedBottomOffset, {
        toValue: 0,
        duration: e?.duration || (Platform.OS === 'ios' ? 250 : 200),
        easing: Platform.OS === 'ios' ? Easing.out(Easing.cubic) : Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animatedBottomOffset]);

  const availableHeight = Math.max(
    220,
    windowHeight - keyboardHeight - insets.top - insets.bottom - 16
  );

  return {
    keyboardHeight,
    isKeyboardVisible,
    animatedBottomOffset,
    availableHeight,
    dismissKeyboard: Keyboard.dismiss,
  };
}

export interface KeyboardAwareBottomSheetProps {
  visible: boolean;
  onRequestClose: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  scrollRef?: React.RefObject<ScrollView | null>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  maxHeightRatio?: number;
  showDragHandle?: boolean;
  onShow?: () => void;
  backdropDismiss?: boolean;
}

/**
 * Keyboard-aware Bottom Sheet overlay:
 * - Slides smoothly above the software keyboard using calculated height offset.
 * - Dynamic internal ScrollView adapts its max-height so content and inputs remain scrollable.
 * - Action controls (Save/Cancel) stay pinned directly above the keyboard surface.
 */
export const KeyboardAwareBottomSheet: React.FC<KeyboardAwareBottomSheetProps> = ({
  visible,
  onRequestClose,
  header,
  footer,
  children,
  scrollRef,
  containerStyle,
  contentContainerStyle,
  maxHeightRatio = 0.9,
  showDragHandle = true,
  onShow,
  backdropDismiss = true,
}) => {
  const { colors, shapes } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { keyboardHeight, isKeyboardVisible, animatedBottomOffset, availableHeight } = useKeyboardAware();

  const localScrollRef = useRef<ScrollView>(null);
  const activeScrollRef = scrollRef || localScrollRef;

  const maxSheetHeight = isKeyboardVisible
    ? Math.min(windowHeight * maxHeightRatio, availableHeight + 16)
    : windowHeight * maxHeightRatio;

  const handleBackdropPress = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else if (backdropDismiss) {
      onRequestClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
      onShow={onShow}
      statusBarTranslucent
    >
      <View style={styles.sheetOverlay}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim + '70' }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.bottomSheetCard,
            {
              backgroundColor: colors.surfaceContainerHigh,
              borderTopLeftRadius: shapes.extraLarge,
              borderTopRightRadius: shapes.extraLarge,
              marginBottom: animatedBottomOffset,
              paddingBottom: isKeyboardVisible ? 12 : Math.max(insets.bottom, 16),
              maxHeight: maxSheetHeight,
            },
            containerStyle,
          ]}
        >
          {showDragHandle && (
            <View style={[styles.dragHandle, { backgroundColor: colors.outlineVariant }]} />
          )}

          {header}

          <ScrollView
            ref={activeScrollRef}
            style={styles.sheetScroll}
            contentContainerStyle={[styles.sheetScrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>

          {footer && (
            <View style={[styles.pinnedFooter, { backgroundColor: colors.surfaceContainerHigh }]}>
              {footer}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export interface KeyboardAwareDialogProps {
  visible: boolean;
  onRequestClose: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  scrollRef?: React.RefObject<ScrollView | null>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  maxWidth?: number;
  onShow?: () => void;
  backdropDismiss?: boolean;
}

/**
 * Keyboard-aware Centered Dialog overlay:
 * - Automatically shifts upward when the keyboard is displayed to remain centered in the visible space.
 * - Entire dialog is scrollable so all fields, buttons, and swatches remain accessible on any screen size.
 * - Persistent action buttons remain above the keyboard surface.
 */
export const KeyboardAwareDialog: React.FC<KeyboardAwareDialogProps> = ({
  visible,
  onRequestClose,
  header,
  footer,
  children,
  scrollRef,
  containerStyle,
  contentContainerStyle,
  maxWidth = 360,
  onShow,
  backdropDismiss = true,
}) => {
  const { colors, shapes, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { keyboardHeight, isKeyboardVisible, animatedBottomOffset, availableHeight } = useKeyboardAware();

  const localScrollRef = useRef<ScrollView>(null);
  const activeScrollRef = scrollRef || localScrollRef;

  const maxDialogHeight = Math.min(
    windowHeight * 0.88,
    isKeyboardVisible ? availableHeight : windowHeight * 0.85
  );

  const handleBackdropPress = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else if (backdropDismiss) {
      onRequestClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onRequestClose}
      onShow={onShow}
      statusBarTranslucent
    >
      <View style={styles.dialogOverlay}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim + '70' }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.dialogContainer,
            {
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: shapes.extraLarge,
              elevation: elevation.level3,
              maxWidth,
              maxHeight: maxDialogHeight,
              marginBottom: animatedBottomOffset,
            },
            containerStyle,
          ]}
        >
          {header}

          <ScrollView
            ref={activeScrollRef}
            style={styles.dialogScroll}
            contentContainerStyle={[styles.dialogScrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>

          {footer && (
            <View style={[styles.dialogFooter, { backgroundColor: colors.surfaceContainerHigh }]}>
              {footer}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 12,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetScroll: {
    flexShrink: 1,
  },
  sheetScrollContent: {
    paddingBottom: 8,
  },
  pinnedFooter: {
    paddingTop: 12,
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    width: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  dialogScroll: {
    flexShrink: 1,
  },
  dialogScrollContent: {
    paddingBottom: 4,
  },
  dialogFooter: {
    paddingTop: 16,
  },
});
