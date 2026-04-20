import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { loginUser, registerUser } from '../utils/auth';

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
        Alert.alert('Success', 'Logged in successfully.');
      } else {
        await registerUser(name, email, password);
        Alert.alert('Success', 'Account created successfully.');
      }

      setName('');
      setEmail('');
      setPassword('');
      await onAuthSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';
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
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.primaryButton} onPress={handleSubmit}>
        <Text style={styles.primaryButtonText}>
          {isLoginMode ? 'Login' : 'Register'}
        </Text>
      </Pressable>

      <Pressable onPress={() => setIsLoginMode(!isLoginMode)}>
        <Text style={styles.linkText}>
          {isLoginMode
            ? "Don't have an account? Register"
            : 'Already have an account? Login'}
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  linkText: {
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: '500',
  },
});