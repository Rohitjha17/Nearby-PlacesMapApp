package com.nearbyplacesapp.data.repository

import android.location.Location
import com.nearbyplacesapp.data.model.AppState
import com.nearbyplacesapp.data.model.ErrorType
import com.nearbyplacesapp.data.model.LocationData
import com.nearbyplacesapp.data.model.Place
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import kotlin.math.cos
import kotlin.random.Random

class PlacesRepository {
    
    suspend fun getNearbyPlaces(userLocation: LocationData): AppState<List<Place>> {
        return withContext(Dispatchers.IO) {
            try {
                delay(800)
                
                val places = generateNearbyPlaces(userLocation)
                
                val placesWithDistance = places.map { place ->
                    place.copy(
                        distance = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            place.latitude,
                            place.longitude
                        )
                    )
                }.sortedBy { it.distance }
                
                AppState.Success(placesWithDistance)
                
            } catch (e: Exception) {
                AppState.Error(
                    message = "Failed to fetch nearby places: ${e.message}",
                    errorType = ErrorType.NETWORK_ERROR
                )
            }
        }
    }
    
    private fun generateNearbyPlaces(userLocation: LocationData): List<Place> {
        val lat = userLocation.latitude
        val lng = userLocation.longitude
        
        val placeTemplates = listOf(
            PlaceTemplate("Starbucks", "Cafe", 0.0008, 0.0006),
            PlaceTemplate("McDonald's", "Restaurant", -0.0005, 0.0010),
            PlaceTemplate("City Park", "Park", 0.0012, -0.0004),
            PlaceTemplate("Public Library", "Library", -0.0010, -0.0008),
            PlaceTemplate("24/7 Mart", "Grocery", 0.0004, 0.0012),
            PlaceTemplate("Gold's Gym", "Gym", -0.0007, 0.0005),
            PlaceTemplate("Apollo Hospital", "Hospital", 0.0015, 0.0010),
            PlaceTemplate("Metro Station", "Transit", -0.0003, -0.0012),
            PlaceTemplate("Crossword Books", "Bookstore", 0.0009, -0.0007),
            PlaceTemplate("Art Museum", "Museum", -0.0012, 0.0008),
            PlaceTemplate("Pizza Hut", "Restaurant", 0.0006, -0.0010),
            PlaceTemplate("Green Garden Park", "Park", -0.0014, -0.0005)
        )
        
        return placeTemplates.mapIndexed { index, template ->
            val placeLat = lat + template.latOffset
            val placeLng = lng + template.lngOffset
            
            Place(
                id = (index + 1).toString(),
                name = template.name,
                latitude = placeLat,
                longitude = placeLng,
                category = template.category,
                address = generateAddress(placeLat, placeLng)
            )
        }
    }
    
    private fun generateAddress(lat: Double, lng: Double): String {
        val streetNumber = ((lat * 1000).toInt() % 500).let { if (it < 0) -it else it } + 1
        val streets = listOf(
            "Main Road", "Station Road", "Market Street", 
            "Park Avenue", "Lake View Road", "Gandhi Marg",
            "MG Road", "Ring Road", "Highway"
        )
        val streetIndex = ((lng * 100).toInt() % streets.size).let { if (it < 0) -it else it }
        return "$streetNumber ${streets[streetIndex]}"
    }
    
    private fun calculateDistance(
        lat1: Double, 
        lng1: Double, 
        lat2: Double, 
        lng2: Double
    ): Float {
        val results = FloatArray(1)
        Location.distanceBetween(lat1, lng1, lat2, lng2, results)
        return results[0]
    }
    
    suspend fun searchPlaces(
        query: String, 
        userLocation: LocationData
    ): AppState<List<Place>> {
        return withContext(Dispatchers.IO) {
            try {
                val allPlaces = when (val result = getNearbyPlaces(userLocation)) {
                    is AppState.Success -> result.data
                    is AppState.Error -> return@withContext result
                    else -> emptyList()
                }
                
                val filteredPlaces = allPlaces.filter { place ->
                    place.name.contains(query, ignoreCase = true) ||
                    place.category.contains(query, ignoreCase = true)
                }
                
                AppState.Success(filteredPlaces)
                
            } catch (e: Exception) {
                AppState.Error(
                    message = "Search failed: ${e.message}",
                    errorType = ErrorType.UNKNOWN
                )
            }
        }
    }
    
    private data class PlaceTemplate(
        val name: String,
        val category: String,
        val latOffset: Double,
        val lngOffset: Double
    )
}
