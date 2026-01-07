package com.nearbyplacesapp.data.repository

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.os.Looper
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.nearbyplacesapp.data.model.AppState
import com.nearbyplacesapp.data.model.ErrorType
import com.nearbyplacesapp.data.model.LocationData
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class LocationRepository(private val context: Context) {
    
    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)
    
    fun hasLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    fun isLocationEnabled(): Boolean {
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        return locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
               locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
    }
    
    suspend fun getCurrentLocation(): AppState<LocationData> {
        if (!hasLocationPermission()) {
            return AppState.Error(
                message = "Location permission not granted. Please enable location permission in settings.",
                errorType = ErrorType.PERMISSION_DENIED
            )
        }
        
        if (!isLocationEnabled()) {
            return AppState.Error(
                message = "Location services are disabled. Please enable GPS or network location.",
                errorType = ErrorType.LOCATION_DISABLED
            )
        }
        
        return try {
            val location = getLastKnownLocationSuspend() ?: requestNewLocationSuspend()
            
            if (location != null) {
                AppState.Success(
                    LocationData(
                        latitude = location.latitude,
                        longitude = location.longitude,
                        accuracy = location.accuracy,
                        timestamp = location.time
                    )
                )
            } else {
                AppState.Error(
                    message = "Unable to get current location. Please try again.",
                    errorType = ErrorType.LOCATION_UNAVAILABLE
                )
            }
        } catch (e: SecurityException) {
            AppState.Error(
                message = "Location permission denied: ${e.message}",
                errorType = ErrorType.PERMISSION_DENIED
            )
        } catch (e: Exception) {
            AppState.Error(
                message = "Failed to get location: ${e.message}",
                errorType = ErrorType.UNKNOWN
            )
        }
    }
    
    @Suppress("MissingPermission")
    private suspend fun getLastKnownLocationSuspend(): Location? {
        return suspendCancellableCoroutine { continuation ->
            fusedLocationClient.lastLocation
                .addOnSuccessListener { location ->
                    continuation.resume(location)
                }
                .addOnFailureListener {
                    continuation.resume(null)
                }
        }
    }
    
    @Suppress("MissingPermission")
    private suspend fun requestNewLocationSuspend(): Location? {
        return suspendCancellableCoroutine { continuation ->
            val locationRequest = LocationRequest.Builder(
                Priority.PRIORITY_HIGH_ACCURACY,
                10000L
            ).apply {
                setWaitForAccurateLocation(false)
                setMinUpdateIntervalMillis(5000L)
                setMaxUpdateDelayMillis(10000L)
                setMaxUpdates(1)
            }.build()
            
            val locationCallback = object : LocationCallback() {
                override fun onLocationResult(result: LocationResult) {
                    fusedLocationClient.removeLocationUpdates(this)
                    continuation.resume(result.lastLocation)
                }
            }
            
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
            
            continuation.invokeOnCancellation {
                fusedLocationClient.removeLocationUpdates(locationCallback)
            }
        }
    }
    
    @Suppress("MissingPermission")
    fun getLocationUpdates(): Flow<AppState<LocationData>> = callbackFlow {
        if (!hasLocationPermission()) {
            trySend(AppState.Error(
                message = "Location permission not granted",
                errorType = ErrorType.PERMISSION_DENIED
            ))
            close()
            return@callbackFlow
        }
        
        if (!isLocationEnabled()) {
            trySend(AppState.Error(
                message = "Location services disabled",
                errorType = ErrorType.LOCATION_DISABLED
            ))
            close()
            return@callbackFlow
        }
        
        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            10000L
        ).apply {
            setMinUpdateIntervalMillis(5000L)
        }.build()
        
        val locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { location ->
                    trySend(AppState.Success(
                        LocationData(
                            latitude = location.latitude,
                            longitude = location.longitude,
                            accuracy = location.accuracy,
                            timestamp = location.time
                        )
                    ))
                }
            }
        }
        
        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        )
        
        awaitClose {
            fusedLocationClient.removeLocationUpdates(locationCallback)
        }
    }
}
