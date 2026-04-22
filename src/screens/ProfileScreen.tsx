import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { logoutUser, deleteCurrentUser } from '../utils/auth';
import { g, lightColors, darkColors } from '../styles/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

type Props = {
  user: { id: number; name: string; email: string };
  onLogout: () => Promise<void>;
};

export default function ProfileScreen({ user, onLogout }: Props) {
  const { theme, toggleTheme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const handleLogout = async () => {
    await logoutUser();
    await onLogout();
  };

  const handleDelete = () => {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCurrentUser();
          await onLogout();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[g.pageTitle, { color: colors.black }]}>Profile</Text>

      <Text style={[g.label, { color: colors.black }]}>Name</Text>
      <Text style={[g.bodyText, { color: colors.black }]} accessibilityLabel={`Name: ${user.name}`}>
        {user.name}
      </Text>

      <Text style={[g.label, { color: colors.black }]}>Email</Text>
      <Text style={[g.bodyText, { color: colors.black }]} accessibilityLabel={`Email: ${user.email}`}>
        {user.email}
      </Text>

      {/* Dark Mode Toggle */}
      <Pressable
        style={g.secondaryButton}
        onPress={toggleTheme}
        accessibilityLabel="Toggle dark mode"
        accessibilityRole="button"
      >
        <Text style={[g.secondaryButtonText, { color: colors.black }]}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </Text>
      </Pressable>

      <Pressable
        style={g.primaryButton}
        onPress={handleLogout}
        accessibilityLabel="Logout"
        accessibilityRole="button"
      >
        <Text style={g.primaryButtonText}>Logout</Text>
      </Pressable>

      <Pressable
        style={g.dangerButton}
        onPress={handleDelete}
        accessibilityLabel="Delete account"
        accessibilityRole="button"
      >
        <Text style={g.dangerButtonText}>Delete Account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});