import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AlarmPanel } from '../../components/AlarmPanel';
import { useAlerts } from '../../context/AlertContext';
import { colors, incidentTypeLabels } from '../../constants/theme';
import { getCurrentLocation, getAddressFromCoords } from '../../utils/location';
import { IncidentType } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const { user, incidents, sendSOS, createIncident, setUserLocation, logout, esp32Ip, setEsp32Ip } = useAlerts();
  const [locationLabel, setLocationLabel] = useState('Obteniendo ubicación...');
  const [localIp, setLocalIp] = useState(esp32Ip);

  useEffect(() => {
    setLocalIp(esp32Ip);
  }, [esp32Ip]);

  useEffect(() => {
    (async () => {
      const coords = await getCurrentLocation();
      if (coords) {
        setUserLocation(coords);
        const address = await getAddressFromCoords(coords);
        setLocationLabel(address);
      } else {
        setLocationLabel('Ubicación no disponible');
      }
    })();
  }, [setUserLocation]);

  const activeCount = incidents.filter((i) => i.status === 'activo').length;
  const highPriority = incidents.filter(
    (i) => i.priority === 'alta' && i.status === 'activo',
  ).length;

  const resolveLocation = async () => {
    const coords = await getCurrentLocation();
    if (!coords) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación. Activa el GPS.');
      return null;
    }
    setUserLocation(coords);
    const address = await getAddressFromCoords(coords);
    return { coords, address };
  };

  const handleSOS = async () => {
    // 1. Enviar el comando al ESP32 INMEDIATAMENTE
    if (esp32Ip) {
      try {
        fetch(`http://${esp32Ip}/play?audio=sos`).catch(() => {});
      } catch (e) {
        // Ignorar el error para no bloquear la ejecución del SOS en la app
      }
    }

    // 2. Resolver ubicación y notificar a la comunidad en la app
    const location = await resolveLocation();
    if (!location) return;
    
    const incident = await sendSOS(location.coords, location.address);
    router.push(`/incident/${incident.id}`);
  };

  const handleQuickAlarm = async (type: Exclude<IncidentType, 'sos'>) => {
    const location = await resolveLocation();
    if (!location) return;
    const label = incidentTypeLabels[type];

    if (esp32Ip && (type === 'accidente' || type === 'robo' || type === 'sospechoso')) {
      let audioId = '';
      if (type === 'accidente') audioId = 'accidente';
      else if (type === 'robo') audioId = 'robo';
      else if (type === 'sospechoso') audioId = 'sospechoso';

      try {
        fetch(`http://${esp32Ip}/play?audio=${audioId}`).catch(() => {});
      } catch (error) {
        // Ignorar para no bloquear la app
      }
    }

    const incident = await createIncident({
      type,
      title: `Alarma: ${label}`,
      description: `La alarma comunitaria de ${label.toLowerCase()} está activa. Verifica tu entorno y mantente alerta.`,
      location: location.coords,
      address: location.address,
    });
    Alert.alert(
      'Alarma activada',
      `Se notificó a la comunidad: ${label}`,
      [{ text: 'Ver incidente', onPress: () => router.push(`/incident/${incident.id}`) }],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name.split(' ')[0]}</Text>
          <Text style={styles.community}>{user?.community}</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
        <View style={[styles.statCard, styles.statDanger]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{highPriority}</Text>
          <Text style={styles.statLabel}>Alta prioridad</Text>
        </View>
      </View>

      <View style={styles.alarmSection}>
        <Text style={styles.alarmTitle}>Panel de alarmas</Text>
        <Text style={styles.alarmSubtitle}>
          Activa la alarma que está sonando en tu comunidad
        </Text>
        <AlarmPanel onSOS={handleSOS} onQuickAlarm={handleQuickAlarm} />
      </View>

      <View style={styles.locationCard}>
        <Ionicons name="location" size={20} color={colors.primary} />
        <View style={styles.locationText}>
          <Text style={styles.locationLabel}>Tu ubicación</Text>
          <Text style={styles.locationValue} numberOfLines={2}>
            {locationLabel}
          </Text>
        </View>
      </View>

      <View style={styles.ipConfigCard}>
        <Ionicons name="hardware-chip" size={20} color={colors.primary} />
        <View style={styles.ipConfigText}>
          <Text style={styles.ipConfigLabel}>IP del ESP32 (Alarma Física)</Text>
          <TextInput
            style={styles.ipInput}
            placeholder="Ej. 192.168.1.50"
            value={localIp}
            onChangeText={setLocalIp}
            onBlur={() => setEsp32Ip(localIp)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => router.push('/report')}>
          <Ionicons name="document-text" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Reportar incidente</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => router.push('/(tabs)/alerts')}>
          <Ionicons name="notifications" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Ver alertas</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  community: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statDanger: {
    borderColor: colors.primaryLight,
    backgroundColor: '#FFF5F5',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  alarmSection: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  alarmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  alarmSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  locationValue: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  ipConfigCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ipConfigText: {
    flex: 1,
  },
  ipConfigLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  ipInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
