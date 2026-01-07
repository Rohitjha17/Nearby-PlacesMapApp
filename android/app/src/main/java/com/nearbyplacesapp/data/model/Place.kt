package com.nearbyplacesapp.data.model

data class Place(
    val id: String,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val category: String,
    val address: String = "",
    val distance: Float = 0f
) {
    fun toMap(): Map<String, Any> = mapOf(
        "id" to id,
        "name" to name,
        "latitude" to latitude,
        "longitude" to longitude,
        "category" to category,
        "address" to address,
        "distance" to distance
    )
}
