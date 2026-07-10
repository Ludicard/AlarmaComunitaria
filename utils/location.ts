import * as Location from 'expo-location';
import { Coordinates } from '../types';

export async function getCurrentLocation(): Promise<Coordinates | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function getAddressFromCoords(coords: Coordinates): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync(coords);
    if (results.length === 0) return 'Ubicación no disponible';
    const place = results[0];
    const parts = [place.street, place.district, place.city].filter(Boolean);
    return parts.join(', ') || 'Ubicación no disponible';
  } catch {
    return 'Ubicación no disponible';
  }
}
