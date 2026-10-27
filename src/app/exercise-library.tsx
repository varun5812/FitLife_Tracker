import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../constants/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Exercise } from '../types';
import { getExercises, addCustomExercise } from '../services/workoutService';
import * as Haptics from 'expo-haptics';

export default function ExerciseLibraryScreen() {
  const { colors } = useTheme();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom Exercise Modal
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('Chest');
  const [customDesc, setCustomDesc] = useState<string>('');

  useEffect(() => {
    loadExercises();
  }, [selectedCategory]);

  const loadExercises = async () => {
    const list = await getExercises(selectedCategory);
    setExercises(list);
  };

  const handleCreateCustom = async () => {
    if (!customName.trim()) {
      Alert.alert('Required', 'Please enter an exercise name.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addCustomExercise(customName.trim(), customCategory, customDesc.trim());
    setCustomName('');
    setCustomDesc('');
    setIsModalVisible(false);
    await loadExercises();
  };

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body'];

  const filtered = exercises.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Search and Add Top Row */}
      <View style={styles.topRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search exercise..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: colors.fitness }]}
        >
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(cat);
            }}
            style={[
              styles.catPill,
              {
                backgroundColor: selectedCategory === cat ? colors.fitness : colors.cardSecondary,
                borderColor: selectedCategory === cat ? colors.fitness : colors.border,
              },
            ]}
          >
            <Text
              style={[
                Typography.caption,
                { color: selectedCategory === cat ? '#FFF' : colors.text, fontWeight: '700' },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise Cards */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
          SHOWING {filtered.length} EXERCISES
        </Text>

        {filtered.map(ex => (
          <Card key={ex.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.bodyBold, { color: colors.text }]}>{ex.name}</Text>
                {ex.description ? (
                  <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {ex.description}
                  </Text>
                ) : null}
              </View>

              <Badge
                label={ex.category}
                color={colors.fitness}
              />
            </View>
          </Card>
        ))}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      {/* Custom Exercise Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[Typography.h3, { color: colors.text }]}>Add Custom Exercise</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: Spacing.md }}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>EXERCISE NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                value={customName}
                onChangeText={setCustomName}
                placeholder="e.g. Bulgarian Split Squats"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              MUSCLE GROUP CATEGORY
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: Spacing.xs }}>
              {categories.filter(c => c !== 'All').map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCustomCategory(cat)}
                  style={[
                    styles.catPill,
                    {
                      backgroundColor: customCategory === cat ? colors.fitness : colors.cardSecondary,
                      borderColor: customCategory === cat ? colors.fitness : colors.border,
                      marginRight: 6,
                    },
                  ]}
                >
                  <Text style={[Typography.caption, { color: customCategory === cat ? '#FFF' : colors.text, fontWeight: '700' }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ marginTop: Spacing.sm }}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>DESCRIPTION / NOTES</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardSecondary, borderColor: colors.border, color: colors.text }]}
                value={customDesc}
                onChangeText={setCustomDesc}
                placeholder="Targeting quads and glutes"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Button
              title="Save Exercise 💾"
              onPress={handleCreateCustom}
              style={{ marginTop: Spacing.lg, backgroundColor: colors.fitness }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catsRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  catPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  exerciseCard: {
    marginBottom: Spacing.xs,
    padding: Spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginTop: 4,
    fontSize: 15,
  },
});
