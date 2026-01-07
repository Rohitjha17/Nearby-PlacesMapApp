import { useCallback, useEffect, useState } from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  ErrorType,
  initialState,
  NearbyPlacesModuleType,
  NearbyPlacesState,
  Place,
} from '../types';

const { NearbyPlacesModule } = NativeModules as {
  NearbyPlacesModule: NearbyPlacesModuleType;
};

const eventEmitter = new NativeEventEmitter(NativeModules.NearbyPlacesModule);

export function useNearbyPlaces() {
  const [state, setState] = useState<NearbyPlacesState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let subscription: ReturnType<typeof eventEmitter.addListener>;

    const initialize = async () => {
      try {
        subscription = eventEmitter.addListener(
          'onNearbyPlacesStateChange',
          (newState: NearbyPlacesState) => {
            setState(newState);
          }
        );

        await NearbyPlacesModule.initialize();
        const currentState = await NearbyPlacesModule.getCurrentState();
        setState(currentState);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize NearbyPlacesModule:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize the app',
          errorType: ErrorType.UNKNOWN,
        }));
      }
    };

    initialize();

    return () => {
      subscription?.remove();
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message:
            'This app needs access to your location to show nearby places.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }, []);

  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      return await NearbyPlacesModule.hasLocationPermission();
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }, []);

  const checkLocationEnabled = useCallback(async (): Promise<boolean> => {
    try {
      return await NearbyPlacesModule.isLocationEnabled();
    } catch (error) {
      console.error('Location check error:', error);
      return false;
    }
  }, []);

  const openSettings = useCallback(async () => {
    try {
      await NearbyPlacesModule.openLocationSettings();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  }, []);

  const fetchPlaces = useCallback(async () => {
    try {
      const hasPermission = await checkPermission();
      
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setState(prev => ({
            ...prev,
            error: 'Location permission denied',
            errorType: ErrorType.PERMISSION_DENIED,
          }));
          return;
        }
      }

      const isEnabled = await checkLocationEnabled();
      if (!isEnabled) {
        setState(prev => ({
          ...prev,
          error: 'Location services are disabled',
          errorType: ErrorType.LOCATION_DISABLED,
        }));
        return;
      }

      await NearbyPlacesModule.fetchNearbyPlaces();
    } catch (error) {
      console.error('Failed to fetch places:', error);
    }
  }, [checkPermission, requestPermission, checkLocationEnabled]);

  const refresh = useCallback(async () => {
    try {
      await NearbyPlacesModule.refresh();
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
  }, []);

  const getPlaceById = useCallback(async (placeId: string): Promise<Place | null> => {
    try {
      return await NearbyPlacesModule.getPlaceById(placeId);
    } catch (error) {
      console.error('Failed to get place:', error);
      return null;
    }
  }, []);

  const searchPlaces = useCallback(async (query: string) => {
    try {
      await NearbyPlacesModule.searchPlaces(query);
    } catch (error) {
      console.error('Failed to search:', error);
    }
  }, []);

  const clearError = useCallback(async () => {
    try {
      await NearbyPlacesModule.clearError();
    } catch (error) {
      console.error('Failed to clear error:', error);
    }
  }, []);

  const formatDistance = useCallback((meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }, []);

  return {
    state,
    isInitialized,
    fetchPlaces,
    refresh,
    getPlaceById,
    searchPlaces,
    clearError,
    requestPermission,
    checkPermission,
    checkLocationEnabled,
    openSettings,
    formatDistance,
  };
}
