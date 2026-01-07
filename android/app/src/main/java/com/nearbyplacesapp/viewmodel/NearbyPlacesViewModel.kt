package com.nearbyplacesapp.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nearbyplacesapp.data.model.AppState
import com.nearbyplacesapp.data.model.ErrorType
import com.nearbyplacesapp.data.model.LocationData
import com.nearbyplacesapp.data.model.NearbyPlacesState
import com.nearbyplacesapp.data.model.Place
import com.nearbyplacesapp.data.repository.LocationRepository
import com.nearbyplacesapp.data.repository.PlacesRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class NearbyPlacesViewModel(
    private val locationRepository: LocationRepository,
    private val placesRepository: PlacesRepository
) : ViewModel() {
    
    private val _state = MutableStateFlow(NearbyPlacesState())
    val state: StateFlow<NearbyPlacesState> = _state.asStateFlow()
    
    private var currentLocation: LocationData? = null
    
    fun hasLocationPermission(): Boolean {
        return locationRepository.hasLocationPermission()
    }
    
    fun isLocationEnabled(): Boolean {
        return locationRepository.isLocationEnabled()
    }
    
    fun fetchNearbyPlaces() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null, errorType = null) }
            
            when (val locationResult = locationRepository.getCurrentLocation()) {
                is AppState.Success -> {
                    currentLocation = locationResult.data
                    fetchPlacesForLocation(locationResult.data)
                }
                
                is AppState.Error -> {
                    _state.update { 
                        it.copy(
                            isLoading = false,
                            error = locationResult.message,
                            errorType = locationResult.errorType
                        )
                    }
                }
                
                else -> {
                    _state.update { 
                        it.copy(
                            isLoading = false,
                            error = "Unknown error occurred",
                            errorType = ErrorType.UNKNOWN
                        )
                    }
                }
            }
        }
    }
    
    private suspend fun fetchPlacesForLocation(location: LocationData) {
        when (val placesResult = placesRepository.getNearbyPlaces(location)) {
            is AppState.Success -> {
                _state.update {
                    it.copy(
                        currentLocation = location,
                        places = placesResult.data,
                        isLoading = false,
                        error = null,
                        errorType = null
                    )
                }
            }
            
            is AppState.Error -> {
                _state.update {
                    it.copy(
                        currentLocation = location,
                        isLoading = false,
                        error = placesResult.message,
                        errorType = placesResult.errorType
                    )
                }
            }
            
            else -> {
                _state.update { it.copy(isLoading = false) }
            }
        }
    }
    
    fun refresh() {
        fetchNearbyPlaces()
    }
    
    fun getPlaceById(placeId: String): Place? {
        return _state.value.places.find { it.id == placeId }
    }
    
    fun searchPlaces(query: String) {
        val location = currentLocation ?: return
        
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            
            when (val result = placesRepository.searchPlaces(query, location)) {
                is AppState.Success -> {
                    _state.update {
                        it.copy(
                            places = result.data,
                            isLoading = false
                        )
                    }
                }
                
                is AppState.Error -> {
                    _state.update {
                        it.copy(
                            isLoading = false,
                            error = result.message
                        )
                    }
                }
                
                else -> {
                    _state.update { it.copy(isLoading = false) }
                }
            }
        }
    }
    
    fun clearError() {
        _state.update { it.copy(error = null, errorType = null) }
    }
    
    fun getStateAsMap(): Map<String, Any?> {
        return _state.value.toMap()
    }
    
    class Factory(private val context: Context) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(NearbyPlacesViewModel::class.java)) {
                return NearbyPlacesViewModel(
                    locationRepository = LocationRepository(context),
                    placesRepository = PlacesRepository()
                ) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
    
    companion object {
        @Volatile
        private var instance: NearbyPlacesViewModel? = null
        
        fun getInstance(context: Context): NearbyPlacesViewModel {
            return instance ?: synchronized(this) {
                instance ?: NearbyPlacesViewModel(
                    locationRepository = LocationRepository(context.applicationContext),
                    placesRepository = PlacesRepository()
                ).also { instance = it }
            }
        }
    }
}
