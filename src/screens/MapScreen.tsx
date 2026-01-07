import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorView } from '../components/ErrorView';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { PlacesList } from '../components/PlacesList';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { MapRegion, Place } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const slideAnim = useRef(new Animated.Value(200)).current;
  
  const {
    state,
    isInitialized,
    fetchPlaces,
    refresh,
    openSettings,
    formatDistance,
  } = useNearbyPlaces();

  const defaultRegion: MapRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0222,
    longitudeDelta: 0.0221,
  };

  useEffect(() => {
    if (isInitialized) {
      fetchPlaces();
    }
  }, [isInitialized, fetchPlaces]);

  useEffect(() => {
    if (state.currentLocation && mapReady && mapRef.current) {
      const newRegion: MapRegion = {
        latitude: state.currentLocation.latitude,
        longitude: state.currentLocation.longitude,
        latitudeDelta: 0.0222,
        longitudeDelta: 0.0221,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  }, [state.currentLocation, mapReady]);

  useEffect(() => {
    if (selectedPlace) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedPlace, slideAnim]);

  const handlePlacePress = useCallback((place: Place) => {
    setSelectedPlace(place);
    if (mapRef.current && mapReady) {
      mapRef.current.animateToRegion(
        {
          latitude: place.latitude,
          longitude: place.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        400
      );
    }
  }, [mapReady]);

  const handleMarkerPress = useCallback((place: Place) => {
    setSelectedPlace(place);
  }, []);

  const handleRefresh = useCallback(() => {
    setSelectedPlace(null);
    refresh();
  }, [refresh]);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  const handleMapPress = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  const goToMyLocation = useCallback(() => {
    if (state.currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: state.currentLocation.latitude,
          longitude: state.currentLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        400
      );
    }
  }, [state.currentLocation]);

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      Cafe: '☕',
      Park: '🌳',
      Library: '📚',
      Grocery: '🛒',
      Gym: '💪',
      Restaurant: '🍕',
      Hospital: '🏥',
      Transit: '🚇',
      Bookstore: '📖',
      Museum: '🎨',
    };
    return icons[category] || '📍';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Cafe: '#D97706',
      Park: '#059669',
      Library: '#2563EB',
      Grocery: '#DC2626',
      Gym: '#EA580C',
      Restaurant: '#E11D48',
      Hospital: '#BE123C',
      Transit: '#0284C7',
      Bookstore: '#7C3AED',
      Museum: '#CA8A04',
    };
    return colors[category] || '#3B82F6';
  };

  const initialRegion = state.currentLocation
    ? {
        latitude: state.currentLocation.latitude,
        longitude: state.currentLocation.longitude,
        latitudeDelta: 0.0222,
        longitudeDelta: 0.0221,
      }
    : defaultRegion;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        onMapReady={handleMapReady}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        mapType="standard"
        loadingEnabled
        loadingIndicatorColor="#3B82F6"
        loadingBackgroundColor="#F8FAFC">
        
        {mapReady && state.places.map(place => (
          <Marker
            key={place.id}
            identifier={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            onPress={() => handleMarkerPress(place)}
            tracksViewChanges={false}>
            <View style={[
              styles.customMarker,
              selectedPlace?.id === place.id && styles.selectedMarker
            ]}>
              <View style={[
                styles.markerInner,
                { backgroundColor: getCategoryColor(place.category) }
              ]}>
                <Text style={styles.markerIcon}>{getCategoryIcon(place.category)}</Text>
              </View>
              <View style={[
                styles.markerArrow,
                { borderTopColor: getCategoryColor(place.category) }
              ]} />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.header, { marginTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🗺️</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Nearby Places</Text>
            <Text style={styles.headerSubtitle}>
              {state.places.length > 0 
                ? `${state.places.length} places around you`
                : 'Discovering...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, state.isLoading && styles.refreshButtonDisabled]}
          onPress={handleRefresh}
          disabled={state.isLoading}
          activeOpacity={0.7}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        {state.currentLocation && mapReady && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={goToMyLocation}
            activeOpacity={0.8}>
            <Text style={styles.actionButtonIcon}>◎</Text>
          </TouchableOpacity>
        )}
      </View>

      {state.currentLocation && (
        <View style={styles.coordinatesChip}>
          <Text style={styles.coordinatesIcon}>📍</Text>
          <Text style={styles.coordinatesText}>
            {state.currentLocation.latitude.toFixed(4)}°, {state.currentLocation.longitude.toFixed(4)}°
          </Text>
        </View>
      )}

      {selectedPlace && (
        <Animated.View 
          style={[
            styles.selectedPlaceCard,
            { transform: [{ translateY: slideAnim }] }
          ]}>
          <View style={styles.selectedPlaceHeader}>
            <View style={[
              styles.selectedPlaceIcon,
              { backgroundColor: getCategoryColor(selectedPlace.category) + '20' }
            ]}>
              <Text style={styles.selectedPlaceEmoji}>
                {getCategoryIcon(selectedPlace.category)}
              </Text>
            </View>
            <View style={styles.selectedPlaceInfo}>
              <Text style={styles.selectedPlaceName}>{selectedPlace.name}</Text>
              <View style={styles.selectedPlaceMeta}>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(selectedPlace.category) + '15' }
                ]}>
                  <Text style={[
                    styles.categoryBadgeText,
                    { color: getCategoryColor(selectedPlace.category) }
                  ]}>
                    {selectedPlace.category}
                  </Text>
                </View>
                <Text style={styles.distanceBadge}>
                  {formatDistance(selectedPlace.distance)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPlace(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          {selectedPlace.address && (
            <View style={styles.addressRow}>
              <Text style={styles.addressIcon}>🏠</Text>
              <Text style={styles.addressText}>{selectedPlace.address}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.directionsButton} activeOpacity={0.8}>
            <Text style={styles.directionsIcon}>➤</Text>
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {!selectedPlace && (
        <PlacesList
          places={state.places}
          formatDistance={formatDistance}
          onPlacePress={handlePlacePress}
          selectedPlaceId={selectedPlace?.id}
        />
      )}

      {state.isLoading && <LoadingOverlay />}

      {state.error && !state.isLoading && (
        <ErrorView
          error={state.error}
          errorType={state.errorType}
          onRetry={fetchPlaces}
          onOpenSettings={openSettings}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoIcon: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  refreshIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    position: 'absolute',
    top: 140,
    right: 16,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  actionButtonIcon: {
    fontSize: 24,
    color: '#3B82F6',
  },
  coordinatesChip: {
    position: 'absolute',
    top: 140,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  coordinatesIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  customMarker: {
    alignItems: 'center',
  },
  selectedMarker: {
    transform: [{ scale: 1.15 }],
  },
  markerInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 18,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  selectedPlaceCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  selectedPlaceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selectedPlaceIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  selectedPlaceEmoji: {
    fontSize: 28,
  },
  selectedPlaceInfo: {
    flex: 1,
  },
  selectedPlaceName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  selectedPlaceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  distanceBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addressIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  directionsButton: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  directionsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
