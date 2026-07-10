import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ChatMessage,
  Coordinates,
  CreateIncidentInput,
  Incident,
  IncidentStatus,
  User,
} from '../types';
import {
  addChatMessage,
  addSafetyConfirmation,
  buildIncident,
  clearUser,
  loadIncidents,
  loadMessages,
  loadUser,
  saveIncidents,
  saveMessages,
  saveUser,
  updateIncidentStatus,
  loadEsp32Ip,
  saveEsp32Ip,
} from '../utils/storage';

interface AlertContextValue {
  user: User | null;
  incidents: Incident[];
  messages: ChatMessage[];
  userLocation: Coordinates | null;
  isLoading: boolean;
  login: (name: string, role: User['role'], community: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserLocation: (location: Coordinates | null) => void;
  createIncident: (input: CreateIncidentInput) => Promise<Incident>;
  sendSOS: (location: Coordinates, address?: string) => Promise<Incident>;
  confirmSafety: (incidentId: string) => Promise<void>;
  sendMessage: (incidentId: string, text: string) => Promise<void>;
  updateStatus: (incidentId: string, status: IncidentStatus) => Promise<void>;
  refreshData: () => Promise<void>;
  esp32Ip: string;
  setEsp32Ip: (ip: string) => Promise<void>;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [esp32Ip, setEsp32IpState] = useState('');

  const refreshData = useCallback(async () => {
    const [storedUser, storedIncidents, storedMessages, storedIp] = await Promise.all([
      loadUser(),
      loadIncidents(),
      loadMessages(),
      loadEsp32Ip(),
    ]);
    setUser(storedUser);
    setIncidents(storedIncidents);
    setMessages(storedMessages);
    setEsp32IpState(storedIp);
  }, []);

  useEffect(() => {
    refreshData().finally(() => setIsLoading(false));
  }, [refreshData]);

  const login = useCallback(
    async (name: string, role: User['role'], community: string) => {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        role,
        community: community.trim() || 'La Colmena',
      };
      await saveUser(newUser);
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(async () => {
    await clearUser();
    setUser(null);
  }, []);

  const handleSetEsp32Ip = useCallback(async (ip: string) => {
    await saveEsp32Ip(ip);
    setEsp32IpState(ip);
  }, []);

  const createIncident = useCallback(
    async (input: CreateIncidentInput) => {
      if (!user) throw new Error('Usuario no autenticado');
      const incident = buildIncident(input, user);
      const updated = [incident, ...incidents];
      await saveIncidents(updated);
      setIncidents(updated);
      return incident;
    },
    [user, incidents],
  );

  const sendSOS = useCallback(
    async (location: Coordinates, address?: string) => {
      return createIncident({
        type: 'sos',
        title: '¡ALERTA SOS!',
        description: 'Emergencia reportada. Se requiere ayuda inmediata.',
        location,
        address,
        isSOS: true,
      });
    },
    [createIncident],
  );

  const confirmSafety = useCallback(
    async (incidentId: string) => {
      if (!user) return;
      const updated = addSafetyConfirmation(incidents, incidentId, user);
      await saveIncidents(updated);
      setIncidents(updated);
    },
    [user, incidents],
  );

  const sendMessage = useCallback(
    async (incidentId: string, text: string) => {
      if (!user || !text.trim()) return;
      const updated = addChatMessage(messages, incidentId, user, text.trim());
      await saveMessages(updated);
      setMessages(updated);
    },
    [user, messages],
  );

  const updateStatus = useCallback(
    async (incidentId: string, status: IncidentStatus) => {
      const updated = updateIncidentStatus(incidents, incidentId, status);
      await saveIncidents(updated);
      setIncidents(updated);
    },
    [incidents],
  );

  const value = useMemo(
    () => ({
      user,
      incidents,
      messages,
      userLocation,
      isLoading,
      login,
      logout,
      setUserLocation,
      createIncident,
      sendSOS,
      confirmSafety,
      sendMessage,
      updateStatus,
      refreshData,
      esp32Ip,
      setEsp32Ip: handleSetEsp32Ip,
    }),
    [
      user,
      incidents,
      messages,
      userLocation,
      isLoading,
      login,
      logout,
      createIncident,
      sendSOS,
      confirmSafety,
      sendMessage,
      updateStatus,
      refreshData,
      esp32Ip,
      handleSetEsp32Ip,
    ],
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts debe usarse dentro de AlertProvider');
  return ctx;
}
