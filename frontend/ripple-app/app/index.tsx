import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:5000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      Alert.alert('Welcome back to Ripple!');
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌊 Ripple</Text>
      <Text style={styles.tagline}>Where moments become waves</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
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
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#7F77DD',
    marginBottom: 48,
  },
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
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});