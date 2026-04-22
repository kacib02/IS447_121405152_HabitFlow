import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, TextInput } from 'react-native';
import { createCategory, updateCategory, deleteCategory, getCategoriesForActiveUser, initCategoryTable, Category } from '../utils/categories';
import { g, lightColors, darkColors } from '../styles/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

const CATEGORY_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#7c3aed', '#ea580c'];

export default function CategoriesScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#2563eb');
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const loadCategories = async () => {
    const data = await getCategoriesForActiveUser();
    setCategories(data);
  };

  useEffect(() => {
    const setup = async () => {
      await initCategoryTable();
      await loadCategories();
    };
    setup();
  }, []);

  const handleSaveCategory = async () => {
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, categoryName, categoryColor);
      } else {
        await createCategory(categoryName, categoryColor);
      }
      setCategoryName('');
      setCategoryColor('#2563eb');
      setEditingCategoryId(null);
      await loadCategories();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not save category.');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryColor(category.color);
  };

  const handleDeleteCategory = (categoryId: number) => {
    Alert.alert('Delete Category', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(categoryId);
            if (editingCategoryId === categoryId) handleCancelEdit();
            await loadCategories();
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Could not delete category.');
          }
        },
      },
    ]);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryColor('#2563eb');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[g.pageTitle, { color: colors.black }]}>Categories</Text>

      <View style={[g.section, { borderTopColor: colors.border }]}>
        <Text style={[g.sectionTitle, { color: colors.black }]}>
          {editingCategoryId ? 'Edit Category' : 'New Category'}
        </Text>

        <Text style={[g.label, { color: colors.black }]}>Name</Text>
        <TextInput
          style={[
            g.input,
            {
              color: colors.black,
              backgroundColor: colors.white,
              borderColor: colors.border,
            },
          ]}
          placeholder="e.g. Health"
          placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#999'}
          value={categoryName}
          onChangeText={setCategoryName}
          accessibilityLabel="Category name"
        />

        <Text style={[g.label, { color: colors.black }]}>Colour</Text>
        <View style={styles.colorRow}>
          {CATEGORY_COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => setCategoryColor(color)}
              accessibilityLabel={`Select colour ${color}`}
              accessibilityRole="button"
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                categoryColor === color && [styles.colorSwatchSelected, { borderColor: colors.black }],
              ]}
            />
          ))}
        </View>

        <Pressable
          style={g.primaryButton}
          onPress={handleSaveCategory}
          accessibilityLabel={editingCategoryId ? 'Save category' : 'Add category'}
          accessibilityRole="button"
        >
          <Text style={g.primaryButtonText}>{editingCategoryId ? 'Save' : 'Add Category'}</Text>
        </Pressable>

        {editingCategoryId ? (
          <Pressable
            style={[g.secondaryButton, { backgroundColor: colors.white, borderColor: colors.border }]}
            onPress={handleCancelEdit}
            accessibilityLabel="Cancel edit"
            accessibilityRole="button"
          >
            <Text style={[g.secondaryButtonText, { color: colors.black }]}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[g.section, { borderTopColor: colors.border }]}>
        <Text style={[g.sectionTitle, { color: colors.black }]}>Your Categories</Text>

        {categories.length === 0 ? (
          <Text style={[g.emptyText, { color: colors.black }]}>No categories yet.</Text>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={[g.listItem, { borderBottomColor: colors.border }]}>
              <View style={styles.catRow}>
                <View style={[styles.colorDot, { backgroundColor: category.color }]} />
                <Text style={[g.listTitle, { color: colors.black }]}>{category.name}</Text>
              </View>

              <View style={g.actionRow}>
                <Pressable
                  style={g.smallPrimaryButton}
                  onPress={() => handleEditCategory(category)}
                  accessibilityLabel={`Edit ${category.name}`}
                  accessibilityRole="button"
                >
                  <Text style={g.smallPrimaryButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={g.smallDangerButton}
                  onPress={() => handleDeleteCategory(category.id)}
                  accessibilityLabel={`Delete ${category.name}`}
                  accessibilityRole="button"
                >
                  <Text style={g.smallDangerButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  colorSwatchSelected: {
    borderWidth: 3,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});