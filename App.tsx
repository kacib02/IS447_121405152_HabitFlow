import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { initDatabase } from './src/db/init';
import { seedDatabase } from './src/db/seed';

import AuthScreen from './src/screens/AuthScreen';
import MainTabs from './src/navigation/MainTabs';

import { getActiveUser, initAuthTables } from './src/utils/auth';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { lightColors, darkColors } from './src/styles/GlobalStyles';

type ActiveUser = {
  id: number;
  name: string;
  email: string;
} | null;

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState<ActiveUser>(null);
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const loadSession = async () => {
    const user = await getActiveUser();
    setActiveUser(user);
  };

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        await seedDatabase();
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
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});