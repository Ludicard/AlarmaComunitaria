import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from '../context/AlertContext';
import { colors } from '../constants/theme';

export default function LoginScreen() {
  const { user, login } = useAlerts();
  const router = useRouter();
  
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [name, setName] = useState('');
  const [communityOrCode, setCommunityOrCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleAuth = async () => {
    if (!name.trim() || !communityOrCode.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    
    setLoading(true);
    try {
      await login(mode, name.trim(), communityOrCode.trim());
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Ocurrió un error al procesar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>OnAlert</Text>
          <Text style={styles.subtitle}>
            Seguridad comunitaria conectada
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, mode === 'join' && styles.tabActive]}
              onPress={() => setMode('join')}
            >
              <Text style={[styles.tabText, mode === 'join' && styles.tabTextActive]}>
                Unirme a Zona
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === 'create' && styles.tabActive]}
              onPress={() => setMode('create')}
            >
              <Text style={[styles.tabText, mode === 'create' && styles.tabTextActive]}>
                Crear Zona
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Tu nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: María López"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>
            {mode === 'join' ? 'Código de Invitación' : 'Nombre de la nueva Comunidad'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={mode === 'join' ? 'Ej: A1B2C3' : 'Ej: Barrio San José'}
            value={communityOrCode}
            onChangeText={setCommunityOrCode}
            autoCapitalize={mode === 'join' ? 'characters' : 'words'}
          />

          <Pressable
            style={[styles.button, (!name.trim() || !communityOrCode.trim() || loading) && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={!name.trim() || !communityOrCode.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'join' ? 'Ingresar como Vecino' : 'Crear como Administrador'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    gap: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    height: 56,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
