export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  address: string;
  distance: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export enum ErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  LOCATION_DISABLED = 'LOCATION_DISABLED',
  LOCATION_UNAVAILABLE = 'LOCATION_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface NearbyPlacesState {
  currentLocation: LocationData | null;
  places: Place[];
  isLoading: boolean;
  error: string | null;
  errorType: ErrorType | null;
}

export const initialState: NearbyPlacesState = {
  currentLocation: null,
  places: [],
  isLoading: false,
  error: null,
  errorType: null,
};

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface NearbyPlacesModuleType {
  initialize(): Promise<boolean>;
  hasLocationPermission(): Promise<boolean>;
  isLocationEnabled(): Promise<boolean>;
  requestLocationPermission(): Promise<boolean>;
  openLocationSettings(): Promise<boolean>;
  fetchNearbyPlaces(): Promise<boolean>;
  getCurrentState(): Promise<NearbyPlacesState>;
  refresh(): Promise<boolean>;
  getPlaceById(placeId: string): Promise<Place | null>;
  searchPlaces(query: string): Promise<boolean>;
  clearError(): Promise<boolean>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}
