package com.nearbyplacesapp.data.model

sealed class AppState<out T> {
    data object Idle : AppState<Nothing>()
    data object Loading : AppState<Nothing>()
    data class Success<T>(val data: T) : AppState<T>()
    data class Error(
        val message: String,
        val errorType: ErrorType = ErrorType.UNKNOWN
    ) : AppState<Nothing>()
}

enum class ErrorType {
    PERMISSION_DENIED,
    LOCATION_DISABLED,
    LOCATION_UNAVAILABLE,
    NETWORK_ERROR,
    UNKNOWN
}

data class NearbyPlacesState(
    val currentLocation: LocationData? = null,
    val places: List<Place> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val errorType: ErrorType? = null
) {
    fun toMap(): Map<String, Any?> = mapOf(
        "currentLocation" to currentLocation?.toMap(),
        "places" to places.map { it.toMap() },
        "isLoading" to isLoading,
        "error" to error,
        "errorType" to errorType?.name
    )
}
