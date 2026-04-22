import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import {
  createCategory,
  updateCategory,
  getCategoriesForActiveUser,
  initCategoryTable,
  Category,
} from '../utils/categories';
import FormField from '../components/FormField';

const CATEGORY_COLORS = ['red', 'blue', 'green', 'purple', 'orange'];

export default function CategoriesScreen() {
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('blue');
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
        Alert.alert('Success', 'Category updated successfully.');
      } else {
        await createCategory(categoryName, categoryColor);
        Alert.alert('Success', 'Category created successfully.');
      }

      setCategoryName('');
      setCategoryColor('blue');
      setEditingCategoryId(null);
      await loadCategories();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save category.';
      Alert.alert('Error', message);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryColor(category.color);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryColor('blue');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Categories</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {editingCategoryId ? 'Edit Category' : 'Create Category'}
        </Text>

        <FormField
          label="Category Name"
          placeholder="e.g. Health"
          value={categoryName}
          onChangeText={setCategoryName}
        />

        <Text style={styles.label}>Pick Colour</Text>
        <View style={styles.colorPickerRow}>
          {CATEGORY_COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => setCategoryColor(color)}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                categoryColor === color && styles.colorSelected,
              ]}
            />
          ))}
        </View>

        <Pressable style={styles.primaryButton} onPress={handleSaveCategory}>
          <Text style={styles.primaryButtonText}>
            {editingCategoryId ? 'Save Category' : 'Add Category'}
          </Text>
        </Pressable>

        {editingCategoryId ? (
          <Pressable style={styles.secondaryButton} onPress={handleCancelEdit}>
            <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Categories</Text>

        {categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories yet.</Text>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={styles.listItem}>
              <Text style={styles.listTitle}>{category.name}</Text>

              <View style={styles.colorRow}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: category.color },
                  ]}
                />
                <Text style={styles.listSubtitle}>ID: {category.id}</Text>
              </View>

              <Pressable
                style={styles.smallEditButton}
                onPress={() => handleEditCategory(category)}
              >
                <Text style={styles.smallEditButtonText}>Edit Category</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 40,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
    color: '#111827',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
    color: '#111827',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
  },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  secondaryButtonText: {
    color: '#111827',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  smallEditButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
  },
  smallEditButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  colorPickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 999,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#111827',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
});