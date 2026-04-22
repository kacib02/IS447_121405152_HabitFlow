import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { loginUser, registerUser } from '../utils/auth';
import { g, colors } from '../styles/GlobalStyles';


type Props = {
  onAuthSuccess: () => Promise<void>;
};

export default function AuthScreen({ onAuthSuccess }: Props) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      if (isLoginMode) {
        await loginUser(email, password);
      } else {
        await registerUser(name, email, password);
      }
      setName(''); setEmail(''); setPassword('');
      await onAuthSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HabitFlow</Text>
      <Text style={styles.subtitle}>
        {isLoginMode ? 'Log in to continue' : 'Create your account'}
      </Text>

      {!isLoginMode && (
        <TextInput
          style={g.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          accessibilityLabel="Name"
          accessibilityHint="Enter your full name"
        />
      )}

      <TextInput
        style={g.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel="Email"
        accessibilityHint="Enter your email address"
      />

      <TextInput
        style={g.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        accessibilityLabel="Password"
        accessibilityHint="Enter your password"
      />

      <Pressable
        style={g.primaryButton}
        onPress={handleSubmit}
        accessibilityLabel={isLoginMode ? 'Login' : 'Register'}
        accessibilityRole="button"
      >
        <Text style={g.primaryButtonText}>{isLoginMode ? 'Login' : 'Register'}</Text>
      </Pressable>

      <Pressable
        onPress={() => setIsLoginMode(!isLoginMode)}
        accessibilityLabel={isLoginMode ? 'Switch to register' : 'Switch to login'}
        accessibilityRole="button"
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>
          {isLoginMode ? "Don't have an account? Register" : 'Already have an account? Login'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    color: colors.black,
  },
  subtitle: {
    fontSize: 15,
    color: colors.black,
    marginBottom: 24,
  },
  linkButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});
