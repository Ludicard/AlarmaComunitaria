import AsyncStorage from '@react-native-async-storage/async-storage';
import { IncidentPriority, IncidentType, User } from '../types';

const STORAGE_KEYS = {
  user: '@onalert_user',
  esp32Ip: '@onalert_esp32_ip',
};

const priorityByType: Record<IncidentType, IncidentPriority> = {
  sos: 'alta',
  robo: 'alta',
  violencia: 'alta',
  incendio: 'alta',
  medica: 'alta',
  sospechoso: 'media',
  accidente: 'media',
};

export async function loadUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.user);
  return raw ? JSON.parse(raw) : null;
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.user);
}

export async function loadEsp32Ip(): Promise<string> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.esp32Ip);
  return raw || '';
}

export async function saveEsp32Ip(ip: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.esp32Ip, ip);
}

export function getPriorityForType(type: IncidentType, isSOS = false): IncidentPriority {
  if (isSOS) return 'alta';
  return priorityByType[type];
}

export function canManageIncidents(role: User['role']): boolean {
  return role === 'admin' || role === 'guardia';
}
