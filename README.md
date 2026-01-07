# Nearby Places Map App

Map-based app using React Native (UI) + Android Native (MVVM) for location handling.

## Setup

```bash
# Install dependencies
npm install

# Add Google Maps API key in android/app/src/main/AndroidManifest.xml
# Replace YOUR_API_KEY with actual key

# Run
nvm use 20
npm run android
```

## Project Structure

```
android/app/src/main/java/com/nearbyplacesapp/
├── data/
│   ├── model/          # Place, LocationData, AppState
│   └── repository/     # LocationRepository, PlacesRepository
├── viewmodel/          # NearbyPlacesViewModel
└── bridge/             # NearbyPlacesModule (Native Module)

src/
├── components/         # UI components
├── screens/            # MapScreen
├── hooks/              # useNearbyPlaces
└── types/              # TypeScript definitions
```

## Architecture

**MVVM Pattern:**

```
React Native (UI)
      ↓
Native Module Bridge
      ↓
ViewModel ← → Repository ← → Data Models
```

- **View**: React Native components (MapScreen, PlacesList, etc.)
- **ViewModel**: NearbyPlacesViewModel - manages state, business logic
- **Model**: Repositories handle data fetching, Location APIs

## How It Works

1. App initializes → Native Module connects to ViewModel
2. ViewModel calls LocationRepository → gets user location via FusedLocationProviderClient
3. ViewModel calls PlacesRepository → fetches nearby places
4. State updates flow to React Native via event emitter
5. UI renders map with markers

## Features

- Map with user location
- Nearby places markers with categories
- Tap marker → shows place details (name, category, distance)
- Pull to refresh
- Error handling (permission denied, location off)

## Tech Stack

**Android Native:**
- Kotlin, MVVM
- FusedLocationProviderClient
- Kotlin Coroutines + StateFlow

**React Native:**
- react-native-maps
- Native Modules for bridge

## Error States

| Error | Handling |
|-------|----------|
| Permission denied | Request permission dialog |
| Location off | Open settings option |
| Location unavailable | Retry button |

---

Rohit Kumar Jha
