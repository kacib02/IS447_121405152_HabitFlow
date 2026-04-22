import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { initDatabase } from './src/db/init';
import { seedDatabase } from './src/db/seed';

import AuthScreen from './src/screens/AuthScreen';
import MainTabs from './src/navigation/MainTabs';

import { getActiveUser, initAuthTables } from './src/utils/auth';

type ActiveUser = {
  id: number;
  name: string;
  email: string;
} | null;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState<ActiveUser>(null);

  const loadSession = async () => {
    const user = await getActiveUser();
    setActiveUser(user);
  };

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();      // new
        await seedDatabase();      // new
        await initAuthTables();
        await loadSession();
      } catch (error) {
        console.error('Auth setup failed:', error);
      } finally {
        setLoading(false);
      }
    };

    setup();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!activeUser) {
    return <AuthScreen onAuthSuccess={loadSession} />;
  }

  return (
    <NavigationContainer>
      <MainTabs user={activeUser} onLogout={loadSession} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});