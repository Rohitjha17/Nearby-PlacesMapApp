import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Place } from '../types';

interface PlaceCalloutProps {
  place: Place;
  formatDistance: (meters: number) => string;
}

export function PlaceCallout({ place, formatDistance }: PlaceCalloutProps) {
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

  const categoryColor = getCategoryColor(place.category);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{place.name}</Text>
      <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '15' }]}>
        <Text style={[styles.categoryText, { color: categoryColor }]}>
          {place.category}
        </Text>
      </View>
      {place.address ? (
        <Text style={styles.address}>{place.address}</Text>
      ) : null}
      <View style={styles.distanceContainer}>
        <View style={styles.distanceDot} />
        <Text style={styles.distance}>{formatDistance(place.distance)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minWidth: 180,
    maxWidth: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  address: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 18,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  distanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});
