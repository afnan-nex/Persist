import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  PanResponder,
  GestureResponderEvent,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface TimePickerModalProps {
  visible: boolean;
  initialMinutes?: number; // minutes from midnight (0..1439)
  is24Hr?: boolean;
  onConfirm: (minutes: number) => void;
  onCancel: () => void;
}

type PickerMode = 'dial' | 'input';
type ActiveSection = 'hour' | 'minute';

const DIAL_SIZE = 256;
const DIAL_RADIUS = DIAL_SIZE / 2;
const OUTER_NUMBER_RADIUS = 96;
const INNER_NUMBER_RADIUS = 64;

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  initialMinutes = 540, // 9:00 AM default
  is24Hr = false,
  onConfirm,
  onCancel,
}) => {
  const { colors, fontFamily } = useTheme();

  const [mode, setMode] = useState<PickerMode>('dial');
  const [activeSection, setActiveSection] = useState<ActiveSection>('hour');

  const initHours24 = Math.floor(initialMinutes / 60);
  const initMinutes = initialMinutes % 60;

  const [period, setPeriod] = useState<'AM' | 'PM'>(initHours24 >= 12 ? 'PM' : 'AM');
  const [hour, setHour] = useState<number>(
    is24Hr ? initHours24 : initHours24 % 12 === 0 ? 12 : initHours24 % 12
  );
  const [minute, setMinute] = useState<number>(initMinutes);

  // For text input mode
  const [hourInput, setHourInput] = useState(
    (is24Hr ? initHours24 : initHours24 % 12 === 0 ? 12 : initHours24 % 12)
      .toString()
      .padStart(2, '0')
  );
  const [minuteInput, setMinuteInput] = useState(initMinutes.toString().padStart(2, '0'));

  const minuteInputRef = useRef<TextInput>(null);
  const dialRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      const h24 = Math.floor(initialMinutes / 60);
      const m = initialMinutes % 60;
      setPeriod(h24 >= 12 ? 'PM' : 'AM');
      const hDisp = is24Hr ? h24 : h24 % 12 === 0 ? 12 : h24 % 12;
      setHour(hDisp);
      setMinute(m);
      setHourInput(hDisp.toString().padStart(2, '0'));
      setMinuteInput(m.toString().padStart(2, '0'));
      setActiveSection('hour');
      setMode('dial');
    }
  }, [visible, initialMinutes, is24Hr]);

  const handleConfirm = () => {
    let finalHour = hour;
    let finalMinute = minute;

    if (mode === 'input') {
      const parsedH = parseInt(hourInput, 10);
      const parsedM = parseInt(minuteInput, 10);
      finalHour = isNaN(parsedH) ? hour : parsedH;
      finalMinute = isNaN(parsedM) ? minute : Math.min(59, Math.max(0, parsedM));
      if (!is24Hr) {
        finalHour = Math.min(12, Math.max(1, finalHour));
      } else {
        finalHour = Math.min(23, Math.max(0, finalHour));
      }
    }

    if (!is24Hr) {
      if (period === 'PM' && finalHour < 12) {
        finalHour += 12;
      } else if (period === 'AM' && finalHour === 12) {
        finalHour = 0;
      }
    }

    const totalMinutes = finalHour * 60 + finalMinute;
    onConfirm(totalMinutes);
  };

  // Dial calculations
  const calculateAngleAndDist = (locationX: number, locationY: number) => {
    const dx = locationX - DIAL_RADIUS;
    const dy = locationY - DIAL_RADIUS;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    return { angle, dist };
  };

  const handleDialTouch = (e: GestureResponderEvent, isEnd = false) => {
    const { locationX, locationY } = e.nativeEvent;
    const { angle, dist } = calculateAngleAndDist(locationX, locationY);

    if (activeSection === 'hour') {
      if (is24Hr) {
        // Outer circle: 0-11 or 1-12, Inner: 12-23
        const isInner = dist < 78;
        let selected = Math.round(angle / 30) % 12;
        if (isInner) {
          selected = selected === 0 ? 0 : selected + 12;
          if (selected === 12) selected = 0;
          else if (selected === 24) selected = 12;
        } else {
          selected = selected === 0 ? 12 : selected;
        }
        setHour(selected);
        setHourInput(selected.toString().padStart(2, '0'));
      } else {
        let selected = Math.round(angle / 30) % 12;
        if (selected === 0) selected = 12;
        setHour(selected);
        setHourInput(selected.toString().padStart(2, '0'));
      }

      if (isEnd) {
        // Auto-advance to minute after picking hour
        setActiveSection('minute');
      }
    } else {
      // Minute selection (0..59)
      const selected = Math.round(angle / 6) % 60;
      setMinute(selected);
      setMinuteInput(selected.toString().padStart(2, '0'));
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => handleDialTouch(e, false),
      onPanResponderMove: (e) => handleDialTouch(e, false),
      onPanResponderRelease: (e) => handleDialTouch(e, true),
    })
  ).current;

  // Selected angle for dial hand
  let currentAngle = 0;
  let currentHandRadius = OUTER_NUMBER_RADIUS;

  if (activeSection === 'hour') {
    if (is24Hr) {
      if (hour === 0 || (hour >= 13 && hour <= 23)) {
        currentHandRadius = INNER_NUMBER_RADIUS;
        currentAngle = (hour % 12) * 30;
      } else {
        currentHandRadius = OUTER_NUMBER_RADIUS;
        currentAngle = (hour % 12) * 30;
      }
    } else {
      currentAngle = (hour % 12) * 30;
    }
  } else {
    currentAngle = minute * 6;
  }

  // Dial numbers array
  const hours12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const hours24Outer = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const hours24Inner = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          {/* Header Title */}
          <Text style={[styles.dialogTitle, { color: colors.onSurfaceVariant, fontFamily }]}>
            Select time
          </Text>

          {/* Time Display Chips */}
          <View style={styles.displayRow}>
            {/* Hour Chip */}
            <TouchableOpacity
              style={[
                styles.displayChip,
                {
                  backgroundColor:
                    activeSection === 'hour' ? colors.primaryContainer : colors.surfaceVariant,
                  borderColor: activeSection === 'hour' ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => setActiveSection('hour')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.displayText,
                  {
                    color:
                      activeSection === 'hour'
                        ? colors.onPrimaryContainer
                        : colors.onSurfaceVariant,
                    fontFamily,
                  },
                ]}
              >
                {hour.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.colon, { color: colors.onSurface }]}>:</Text>

            {/* Minute Chip */}
            <TouchableOpacity
              style={[
                styles.displayChip,
                {
                  backgroundColor:
                    activeSection === 'minute' ? colors.primaryContainer : colors.surfaceVariant,
                  borderColor: activeSection === 'minute' ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => setActiveSection('minute')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.displayText,
                  {
                    color:
                      activeSection === 'minute'
                        ? colors.onPrimaryContainer
                        : colors.onSurfaceVariant,
                    fontFamily,
                  },
                ]}
              >
                {minute.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>

            {/* AM / PM Segmented Selector (if 12-hour format) */}
            {!is24Hr && (
              <View
                style={[
                  styles.periodSelector,
                  {
                    borderColor: colors.outlineVariant,
                    backgroundColor: colors.surfaceVariant,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.periodItem,
                    period === 'AM' && {
                      backgroundColor: colors.primaryContainer,
                    },
                  ]}
                  onPress={() => setPeriod('AM')}
                >
                  <Text
                    style={[
                      styles.periodText,
                      {
                        color:
                          period === 'AM'
                            ? colors.onPrimaryContainer
                            : colors.onSurfaceVariant,
                        fontWeight: period === 'AM' ? '700' : '500',
                        fontFamily,
                      },
                    ]}
                  >
                    AM
                  </Text>
                </TouchableOpacity>

                <View
                  style={[styles.periodDivider, { backgroundColor: colors.outlineVariant }]}
                />

                <TouchableOpacity
                  style={[
                    styles.periodItem,
                    period === 'PM' && {
                      backgroundColor: colors.primaryContainer,
                    },
                  ]}
                  onPress={() => setPeriod('PM')}
                >
                  <Text
                    style={[
                      styles.periodText,
                      {
                        color:
                          period === 'PM'
                            ? colors.onPrimaryContainer
                            : colors.onSurfaceVariant,
                        fontWeight: period === 'PM' ? '700' : '500',
                        fontFamily,
                      },
                    ]}
                  >
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Body: Dial Mode vs Input Mode */}
          {mode === 'dial' ? (
            /* Time Picker Dial */
            <View style={styles.dialContainer}>
              <View
                ref={dialRef}
                style={[styles.clockFace, { backgroundColor: colors.surfaceVariant }]}
                {...panResponder.panHandlers}
              >
                {/* Center Pivot Point */}
                <View style={[styles.centerPivot, { backgroundColor: colors.primary }]} />

                {/* Clock Hand / Selector Arm */}
                <View
                  style={[
                    styles.handArm,
                    {
                      height: currentHandRadius,
                      backgroundColor: colors.primary,
                      transform: [
                        { translateY: -currentHandRadius / 2 },
                        { rotate: `${currentAngle}deg` },
                        { translateY: currentHandRadius / 2 },
                      ],
                    },
                  ]}
                />

                {/* Hand Selector Knob Head */}
                {(() => {
                  const rad = ((currentAngle - 90) * Math.PI) / 180;
                  const left = DIAL_RADIUS + currentHandRadius * Math.cos(rad) - 20;
                  const top = DIAL_RADIUS + currentHandRadius * Math.sin(rad) - 20;
                  return (
                    <View
                      style={[
                        styles.handKnob,
                        {
                          left,
                          top,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  );
                })()}

                {/* Render Dial Numbers */}
                {activeSection === 'hour' ? (
                  is24Hr ? (
                    <>
                      {/* Outer numbers 1..12 */}
                      {hours24Outer.map((h, i) => {
                        const deg = i * 30;
                        const rad = ((deg - 90) * Math.PI) / 180;
                        const x = DIAL_RADIUS + OUTER_NUMBER_RADIUS * Math.cos(rad);
                        const y = DIAL_RADIUS + OUTER_NUMBER_RADIUS * Math.sin(rad);
                        const isSelected = hour === h;
                        return (
                          <View
                            key={`outer-${h}`}
                            style={[styles.numberWrapper, { left: x - 16, top: y - 16 }]}
                            pointerEvents="none"
                          >
                            <Text
                              style={[
                                styles.numberText,
                                {
                                  color: isSelected ? colors.onPrimary : colors.onSurface,
                                  fontWeight: isSelected ? '700' : '500',
                                  fontFamily,
                                },
                              ]}
                            >
                              {h}
                            </Text>
                          </View>
                        );
                      })}
                      {/* Inner numbers 00, 13..23 */}
                      {hours24Inner.map((h, i) => {
                        const deg = i * 30;
                        const rad = ((deg - 90) * Math.PI) / 180;
                        const x = DIAL_RADIUS + INNER_NUMBER_RADIUS * Math.cos(rad);
                        const y = DIAL_RADIUS + INNER_NUMBER_RADIUS * Math.sin(rad);
                        const isSelected = hour === h;
                        return (
                          <View
                            key={`inner-${h}`}
                            style={[styles.numberWrapper, { left: x - 16, top: y - 16 }]}
                            pointerEvents="none"
                          >
                            <Text
                              style={[
                                styles.innerNumberText,
                                {
                                  color: isSelected ? colors.onPrimary : colors.onSurfaceVariant,
                                  fontWeight: isSelected ? '700' : '400',
                                  fontFamily,
                                },
                              ]}
                            >
                              {h.toString().padStart(2, '0')}
                            </Text>
                          </View>
                        );
                      })}
                    </>
                  ) : (
                    /* 12-hour Dial */
                    hours12.map((h, i) => {
                      const deg = i * 30;
                      const rad = ((deg - 90) * Math.PI) / 180;
                      const x = DIAL_RADIUS + OUTER_NUMBER_RADIUS * Math.cos(rad);
                      const y = DIAL_RADIUS + OUTER_NUMBER_RADIUS * Math.sin(rad);
                      const isSelected = hour === h;
                      return (
                        <View
                          key={h}
                          style={[styles.numberWrapper, { left: x - 16, top: y - 16 }]}
                          pointerEvents="none"
                        >
                          <Text
                            style={[
                              styles.numberText,
                              {
                                color: isSelected ? colors.onPrimary : colors.onSurface,
                                fontWeight: isSelected ? '700' : '500',
                                fontFamily,
                              },
                            ]}
                          >
                            {h}
                          </Text>
                        </View>
                      );
                    })
                  )
                ) : (
                  /* Minute Dial */
                  minutesList.map((m, i) => {
                    const deg = i * 30;
                    const rad = ((deg - 90) * Math.PI) / 180;
                    const x = DIAL_RADIUS + OUTER_NUMBER_RADIUS * Math.cos(rad);
                    const y = DIAL_RADIUS + OUTER_NUMBER_RADIUS * Math.sin(rad);
                    const isSelected = minute === m;
                    return (
                      <View
                        key={m}
                        style={[styles.numberWrapper, { left: x - 16, top: y - 16 }]}
                        pointerEvents="none"
                      >
                        <Text
                          style={[
                            styles.numberText,
                            {
                              color: isSelected ? colors.onPrimary : colors.onSurface,
                              fontWeight: isSelected ? '700' : '500',
                              fontFamily,
                            },
                          ]}
                        >
                          {m.toString().padStart(2, '0')}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          ) : (
            /* Time Picker Input Mode */
            <View style={styles.inputModeContainer}>
              <View style={styles.inputBoxesRow}>
                <View style={styles.inputBoxCol}>
                  <TextInput
                    style={[
                      styles.digitInput,
                      {
                        backgroundColor:
                          activeSection === 'hour'
                            ? colors.primaryContainer
                            : colors.surfaceVariant,
                        color:
                          activeSection === 'hour'
                            ? colors.onPrimaryContainer
                            : colors.onSurface,
                        borderColor: activeSection === 'hour' ? colors.primary : 'transparent',
                        fontFamily,
                      },
                    ]}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={hourInput}
                    onFocus={() => setActiveSection('hour')}
                    onChangeText={(val) => {
                      const num = val.replace(/[^0-9]/g, '');
                      setHourInput(num);
                      const parsed = parseInt(num, 10);
                      if (!isNaN(parsed)) {
                        setHour(parsed);
                        if (num.length >= 2) {
                          minuteInputRef.current?.focus();
                          setActiveSection('minute');
                        }
                      }
                    }}
                    selectTextOnFocus
                  />
                  <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
                    Hour
                  </Text>
                </View>

                <Text style={[styles.inputColon, { color: colors.onSurface }]}>:</Text>

                <View style={styles.inputBoxCol}>
                  <TextInput
                    ref={minuteInputRef}
                    style={[
                      styles.digitInput,
                      {
                        backgroundColor:
                          activeSection === 'minute'
                            ? colors.primaryContainer
                            : colors.surfaceVariant,
                        color:
                          activeSection === 'minute'
                            ? colors.onPrimaryContainer
                            : colors.onSurface,
                        borderColor:
                          activeSection === 'minute' ? colors.primary : 'transparent',
                        fontFamily,
                      },
                    ]}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={minuteInput}
                    onFocus={() => setActiveSection('minute')}
                    onChangeText={(val) => {
                      const num = val.replace(/[^0-9]/g, '');
                      setMinuteInput(num);
                      const parsed = parseInt(num, 10);
                      if (!isNaN(parsed)) {
                        setMinute(Math.min(59, parsed));
                      }
                    }}
                    selectTextOnFocus
                  />
                  <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant, fontFamily }]}>
                    Minute
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Bottom Controls Bar: Mode Toggle + Action Buttons */}
          <View style={styles.bottomBar}>
            {/* Toggle Dial / Input Mode */}
            <TouchableOpacity
              style={[styles.iconToggleBtn, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => setMode((m) => (m === 'dial' ? 'input' : 'dial'))}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={mode === 'dial' ? 'keyboard-outline' : 'clock-outline'}
                size={22}
                color={colors.onSurface}
              />
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionsRight}>
              <TouchableOpacity style={styles.actionBtn} onPress={onCancel} activeOpacity={0.7}>
                <Text style={[styles.actionBtnText, { color: colors.primary, fontFamily }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.okBtn, { backgroundColor: colors.primary }]}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={[styles.actionBtnText, { color: colors.onPrimary, fontFamily }]}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 328,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  dialogTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 20,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  displayChip: {
    minWidth: 84,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayText: {
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 52,
  },
  colon: {
    fontSize: 40,
    fontWeight: '800',
    marginHorizontal: 2,
  },
  periodSelector: {
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    width: 52,
    marginLeft: 4,
  },
  periodItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodDivider: {
    height: 1,
    width: '100%',
  },
  periodText: {
    fontSize: 14,
  },
  dialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  clockFace: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPivot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    zIndex: 4,
  },
  handArm: {
    width: 2,
    position: 'absolute',
    top: DIAL_RADIUS,
    zIndex: 2,
  },
  handKnob: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    zIndex: 3,
  },
  numberWrapper: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  numberText: {
    fontSize: 15,
  },
  innerNumberText: {
    fontSize: 12,
  },
  inputModeContainer: {
    height: DIAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputBoxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  inputBoxCol: {
    alignItems: 'center',
  },
  digitInput: {
    width: 96,
    height: 76,
    borderRadius: 16,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 44,
    fontWeight: '800',
  },
  inputColon: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  iconToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  okBtn: {
    minWidth: 68,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
