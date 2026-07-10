import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, incidentTypeIcons, incidentTypeLabels } from '../constants/theme';
import { IncidentType } from '../types';
import { SOSButton } from './SOSButton';

type QuickAlarmType = Exclude<IncidentType, 'sos'>;

interface AlarmConfig {
  type: QuickAlarmType;
  shortLabel: string;
  angle: number;
  accent: string;
  bg: string;
}

const quickAlarms: AlarmConfig[] = [
  { type: 'robo', shortLabel: 'Robo', angle: -90, accent: '#DC2626', bg: '#FEE2E2' },
  { type: 'sospechoso', shortLabel: 'Sospech.', angle: -30, accent: '#D97706', bg: '#FEF3C7' },
  { type: 'incendio', shortLabel: 'Incendio', angle: 30, accent: '#EA580C', bg: '#FFEDD5' },
  { type: 'violencia', shortLabel: 'Violencia', angle: 90, accent: '#BE123C', bg: '#FFE4E6' },
  { type: 'accidente', shortLabel: 'Accidente', angle: 150, accent: '#2563EB', bg: '#DBEAFE' },
  { type: 'medica', shortLabel: 'Médica', angle: 210, accent: '#059669', bg: '#D1FAE5' },
];

const PANEL_SIZE = 300;
const ORBIT_RADIUS = 118;
const BUTTON_SIZE = 68;

interface AlarmPanelProps {
  onSOS: () => Promise<void>;
  onQuickAlarm: (type: QuickAlarmType) => Promise<void>;
}

function QuickAlarmButton({
  config,
  onPress,
  disabled,
}: {
  config: AlarmConfig;
  onPress: () => void;
  disabled?: boolean;
}) {
  const iconName = incidentTypeIcons[config.type] as keyof typeof Ionicons.glyphMap;
  const rad = (config.angle * Math.PI) / 180;
  const x = Math.cos(rad) * ORBIT_RADIUS;
  const y = Math.sin(rad) * ORBIT_RADIUS;
  const center = PANEL_SIZE / 2;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickBtn,
        {
          left: center + x - BUTTON_SIZE / 2,
          top: center + y - BUTTON_SIZE / 2,
          backgroundColor: config.bg,
          borderColor: config.accent,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        disabled && styles.quickBtnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.quickIconWrap, { backgroundColor: `${config.accent}22` }]}>
        <Ionicons name={iconName} size={20} color={config.accent} />
      </View>
      <Text style={[styles.quickLabel, { color: config.accent }]} numberOfLines={1}>
        {config.shortLabel}
      </Text>
    </Pressable>
  );
}

export function AlarmPanel({ onSOS, onQuickAlarm }: AlarmPanelProps) {
  const [busy, setBusy] = useState(false);

  const handleSOS = async () => {
    setBusy(true);
    try {
      await onSOS();
    } finally {
      setBusy(false);
    }
  };

  const handleQuickPress = async (config: AlarmConfig) => {
    setBusy(true);
    try {
      await onQuickAlarm(config.type);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      <View style={styles.panel}>
        {quickAlarms.map((config) => (
          <QuickAlarmButton
            key={config.type}
            config={config}
            onPress={() => handleQuickPress(config)}
            disabled={busy}
          />
        ))}

        <View style={styles.sosCenter}>
          <SOSButton onPress={handleSOS} disabled={busy} />
        </View>
      </View>

      <Text style={styles.hint}>
        SOS general en el centro · Alarmas específicas alrededor
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  ringOuter: {
    position: 'absolute',
    width: PANEL_SIZE + 48,
    height: PANEL_SIZE + 48,
    borderRadius: (PANEL_SIZE + 48) / 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FAFBFC',
    top: 0,
  },
  ringInner: {
    position: 'absolute',
    width: PANEL_SIZE + 16,
    height: PANEL_SIZE + 16,
    borderRadius: (PANEL_SIZE + 16) / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    top: 16,
  },
  panel: {
    width: PANEL_SIZE,
    height: PANEL_SIZE,
    position: 'relative',
    marginTop: 24,
    marginBottom: 12,
  },
  sosCenter: {
    position: 'absolute',
    left: PANEL_SIZE / 2 - 90,
    top: PANEL_SIZE / 2 - 90,
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtn: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    gap: 2,
    paddingTop: 4,
  },
  quickBtnDisabled: {
    opacity: 0.5,
  },
  quickIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
    maxWidth: BUTTON_SIZE - 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});
