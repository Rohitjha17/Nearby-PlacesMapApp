package com.nearbyplacesapp.bridge

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.nearbyplacesapp.data.model.NearbyPlacesState
import com.nearbyplacesapp.data.model.Place
import com.nearbyplacesapp.viewmodel.NearbyPlacesViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class NearbyPlacesModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
    
    private val viewModel: NearbyPlacesViewModel by lazy {
        NearbyPlacesViewModel.getInstance(reactContext)
    }
    
    private val moduleScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var isObserving = false
    
    override fun getName(): String = MODULE_NAME
    
    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            startObservingState()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", "Failed to initialize: ${e.message}")
        }
    }
    
    private fun startObservingState() {
        if (isObserving) return
        isObserving = true
        
        moduleScope.launch {
            viewModel.state.collectLatest { state ->
                emitStateChange(state)
            }
        }
    }
    
    private fun emitStateChange(state: NearbyPlacesState) {
        val params = stateToWritableMap(state)
        sendEvent(EVENT_STATE_CHANGE, params)
    }
    
    private fun sendEvent(eventName: String, params: WritableMap) {
        if (!reactContext.hasActiveReactInstance()) {
            return
        }
        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, params)
        } catch (e: Exception) {
            // Ignore if React instance not ready
        }
    }
    
    @ReactMethod
    fun hasLocationPermission(promise: Promise) {
        try {
            val hasPermission = viewModel.hasLocationPermission()
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun isLocationEnabled(promise: Promise) {
        try {
            val isEnabled = viewModel.isLocationEnabled()
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.reject("LOCATION_CHECK_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun requestLocationPermission(promise: Promise) {
        try {
            val activity: Activity? = reactContext.currentActivity
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "No activity available")
                return
            }
            
            val fineLocation = Manifest.permission.ACCESS_FINE_LOCATION
            val coarseLocation = Manifest.permission.ACCESS_COARSE_LOCATION
            
            if (ContextCompat.checkSelfPermission(reactContext, fineLocation) == 
                PackageManager.PERMISSION_GRANTED) {
                promise.resolve(true)
                return
            }
            
            ActivityCompat.requestPermissions(
                activity,
                arrayOf(fineLocation, coarseLocation),
                PERMISSION_REQUEST_CODE
            )
            
            promise.resolve(false)
            
        } catch (e: Exception) {
            promise.reject("PERMISSION_REQUEST_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun openLocationSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun fetchNearbyPlaces(promise: Promise) {
        try {
            viewModel.fetchNearbyPlaces()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("FETCH_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun getCurrentState(promise: Promise) {
        try {
            val state = viewModel.state.value
            val map = stateToWritableMap(state)
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("STATE_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun refresh(promise: Promise) {
        try {
            viewModel.refresh()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("REFRESH_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun getPlaceById(placeId: String, promise: Promise) {
        try {
            val place = viewModel.getPlaceById(placeId)
            if (place != null) {
                promise.resolve(placeToWritableMap(place))
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("PLACE_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun searchPlaces(query: String, promise: Promise) {
        try {
            viewModel.searchPlaces(query)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SEARCH_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun clearError(promise: Promise) {
        try {
            viewModel.clearError()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CLEAR_ERROR", e.message)
        }
    }
    
    private fun stateToWritableMap(state: NearbyPlacesState): WritableMap {
        val map = Arguments.createMap()
        
        state.currentLocation?.let { location ->
            val locationMap = Arguments.createMap()
            locationMap.putDouble("latitude", location.latitude)
            locationMap.putDouble("longitude", location.longitude)
            locationMap.putDouble("accuracy", location.accuracy.toDouble())
            locationMap.putDouble("timestamp", location.timestamp.toDouble())
            map.putMap("currentLocation", locationMap)
        } ?: map.putNull("currentLocation")
        
        val placesArray = Arguments.createArray()
        state.places.forEach { place ->
            placesArray.pushMap(placeToWritableMap(place))
        }
        map.putArray("places", placesArray)
        
        map.putBoolean("isLoading", state.isLoading)
        
        state.error?.let {
            map.putString("error", it)
        } ?: map.putNull("error")
        
        state.errorType?.let {
            map.putString("errorType", it.name)
        } ?: map.putNull("errorType")
        
        return map
    }
    
    private fun placeToWritableMap(place: Place): WritableMap {
        val map = Arguments.createMap()
        map.putString("id", place.id)
        map.putString("name", place.name)
        map.putDouble("latitude", place.latitude)
        map.putDouble("longitude", place.longitude)
        map.putString("category", place.category)
        map.putString("address", place.address)
        map.putDouble("distance", place.distance.toDouble())
        return map
    }
    
    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event emitter
    }
    
    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event emitter
    }
    
    override fun invalidate() {
        super.invalidate()
        moduleScope.cancel()
    }
    
    companion object {
        const val MODULE_NAME = "NearbyPlacesModule"
        const val EVENT_STATE_CHANGE = "onNearbyPlacesStateChange"
        private const val PERMISSION_REQUEST_CODE = 1001
    }
}
