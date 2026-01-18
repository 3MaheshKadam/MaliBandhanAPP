import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useState } from 'react';
import {
  Heart,
  Music,
  Plane,
  Book,
  Camera,
  Utensils,
  Film,
  Palette,
  Dumbbell,
  Laptop,
  CheckCircle
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const interestsData = [
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'sports', label: 'Sports', icon: Dumbbell },
  { id: 'reading', label: 'Reading', icon: Book },
  { id: 'cooking', label: 'Cooking', icon: Utensils },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'dancing', label: 'Dancing', icon: Heart },
  { id: 'technology', label: 'Technology', icon: Laptop }
];

export default function Interests() {
  const [selectedInterests, setSelectedInterests] = useState([]);

  const toggleInterest = (interestId) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
        <Text style={styles.headerTitle}>Your Interests</Text>
        <Text style={styles.headerSubtitle}>
          {selectedInterests.length} selected
        </Text>
      </View>

      {/* Interests Grid */}
      <FlatList
        data={interestsData}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => {
          const Icon = item.icon;
          const isSelected = selectedInterests.includes(item.id);

          return (
            <Pressable
              onPress={() => toggleInterest(item.id)}
              style={[
                styles.interestCard,
                isSelected && styles.interestCardSelected,
                { overflow: 'hidden', backgroundColor: 'transparent' }
              ]}
            >
              <BlurView
                intensity={isSelected ? 60 : 40}
                tint={isSelected ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
              <View style={{ zIndex: 1, alignItems: 'center', width: '100%' }}>
                {/* Icon */}
                <View style={[
                  styles.iconContainer,
                  isSelected && styles.iconContainerSelected
                ]}>
                  <Icon
                    size={24}
                    color={isSelected ? Colors.white : Colors.primary}
                  />
                </View>

                {/* Label */}
                <Text style={[
                  styles.interestLabel,
                  isSelected && styles.interestLabelSelected
                ]}>
                  {item.label}
                </Text>

                {/* Check Badge */}
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <CheckCircle size={16} color={Colors.success} fill={Colors.success} />
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'SpaceMono',
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  interestCard: {
    width: '48%',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    position: 'relative',
  },
  interestCardSelected: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainerSelected: {
    backgroundColor: Colors.primary,
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  interestLabelSelected: {
    color: Colors.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});