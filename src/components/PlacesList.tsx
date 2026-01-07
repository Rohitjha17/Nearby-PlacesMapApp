import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Place } from '../types';

interface PlacesListProps {
  places: Place[];
  formatDistance: (meters: number) => string;
  onPlacePress: (place: Place) => void;
  selectedPlaceId?: string;
}

export function PlacesList({
  places,
  formatDistance,
  onPlacePress,
  selectedPlaceId,
}: PlacesListProps) {
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      Cafe: '☕',
      Park: '🌳',
      Library: '📚',
      Grocery: '🛒',
      Gym: '💪',
      Restaurant: '🍕',
      Hospital: '🏥',
      Transit: '🚇',
      Bookstore: '📖',
      Museum: '🎨',
    };
    return icons[category] || '📍';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Cafe: '#D97706',
      Park: '#059669',
      Library: '#2563EB',
      Grocery: '#DC2626',
      Gym: '#EA580C',
      Restaurant: '#E11D48',
      Hospital: '#BE123C',
      Transit: '#0284C7',
      Bookstore: '#7C3AED',
      Museum: '#CA8A04',
    };
    return colors[category] || '#3B82F6';
  };

  const renderItem = ({ item, index }: { item: Place; index: number }) => {
    const isSelected = selectedPlaceId === item.id;
    const categoryColor = getCategoryColor(item.category);
    
    return (
      <TouchableOpacity
        style={[
          styles.placeCard,
          isSelected && styles.placeCardSelected,
          index === 0 && { marginLeft: 20 },
        ]}
        onPress={() => onPlacePress(item)}
        activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: categoryColor + '15' }]}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
        </View>
        <Text style={styles.placeName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={[styles.categoryTag, { backgroundColor: categoryColor + '12' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {item.category}
          </Text>
        </View>
        <View style={styles.distanceRow}>
          <View style={styles.distanceDot} />
          <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (places.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.handleBar} />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Explore Nearby</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{places.length}</Text>
        </View>
      </View>
      <FlatList
        data={places}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        snapToInterval={156}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  countBadge: {
    marginLeft: 10,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    paddingRight: 20,
  },
  placeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginLeft: 12,
    width: 144,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  placeCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
});
