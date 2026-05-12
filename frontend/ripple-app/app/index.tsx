import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:5000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async () => {
    setError('');
    setSuccess('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess(`Welcome back, ${response.data.user.username}! 🌊`);
    } catch (err) {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌊 Ripple</Text>
      <Text style={styles.tagline}>Where moments become waves</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#444"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#444"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: { fontSize: 48, marginBottom: 8 },
  tagline: { fontSize: 16, color: '#7F77DD', marginBottom: 48 },
  errorText: { color: '#ff6b6b', marginBottom: 16, textAlign: 'center', fontSize: 14 },
  successText: { color: '#6bffb8', marginBottom: 16, textAlign: 'center', fontSize: 14 },
  input: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  button: {
    width: '100%',
    backgroundColor: '#7F77DD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#3a3a6e' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});