package com.nearbyplacesapp.data.model

data class LocationData(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float = 0f,
    val timestamp: Long = System.currentTimeMillis()
) {
    fun toMap(): Map<String, Any> = mapOf(
        "latitude" to latitude,
        "longitude" to longitude,
        "accuracy" to accuracy,
        "timestamp" to timestamp
    )
}
