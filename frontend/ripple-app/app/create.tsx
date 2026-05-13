import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://127.0.0.1:5000';

export default function CreatePostScreen() {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePost = async () => {
    if (!content.trim()) { setError('Write something first!'); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_URL}/posts/`, { content }, { headers: { Authorization: `Bearer ${token}` } });
      setContent('');
      setSuccess('Ripple sent! 🌊');
    } catch (error) {
      setError('Could not send your ripple. Are you logged in?');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>New Ripple</Text>
        <TouchableOpacity
          style={[styles.postButton, !content.trim() && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={loading || !content.trim()}
        >
          <Text style={styles.postButtonText}>{loading ? 'Sending...' : 'Send 🌊'}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}
      <View style={styles.inputContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="What's rippling through your mind?"
          placeholderTextColor={theme.textTertiary}
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={500}
          autoFocus
        />
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.charCount, { color: theme.textTertiary }]}>{500 - content.length} characters left</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 48, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  postButton: { backgroundColor: '#7F77DD', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  postButtonDisabled: { backgroundColor: '#3a3a6e' },
  postButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  errorText: { color: '#ff6b6b', textAlign: 'center', padding: 8, fontSize: 14 },
  successText: { color: '#6bffb8', textAlign: 'center', padding: 8, fontSize: 14 },
  inputContainer: { flexDirection: 'row', padding: 16, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  input: { flex: 1, fontSize: 18, lineHeight: 26, textAlignVertical: 'top' },
  footer: { padding: 16, borderTopWidth: 1, alignItems: 'flex-end' },
  charCount: { fontSize: 13 },
});