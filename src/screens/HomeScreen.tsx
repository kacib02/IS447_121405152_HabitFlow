import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('habitflow.db');

export default function HomeScreen() {
  const [message, setMessage] = useState('Phase 1 setup is working.');

  const testSQLite = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS test_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );
      `);

      await db.runAsync(
        'INSERT INTO test_items (name) VALUES (?);',
        [`Test item ${Date.now()}`]
      );

      const rows = await db.getAllAsync('SELECT * FROM test_items;');

      setMessage(`SQLite works. Rows in test_items: ${rows.length}`);
      Alert.alert('Success', `SQLite works. Rows: ${rows.length}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'SQLite test failed');
      setMessage('SQLite test failed.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HabitFlow</Text>
      <Text style={styles.subtitle}>{message}</Text>

      <Pressable style={styles.button} onPress={testSQLite}>
        <Text style={styles.buttonText}>Test SQLite</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});