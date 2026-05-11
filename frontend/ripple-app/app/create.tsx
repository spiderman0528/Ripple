import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:5000';

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Write something first!');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/posts/`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent('');
      Alert.alert('Ripple sent!');
    } catch (error) {
      Alert.alert('Error', 'Could not send your ripple');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Ripple</Text>
        <TouchableOpacity
          style={[styles.postButton, !content.trim() && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={loading || !content.trim()}
        >
          <Text style={styles.postButtonText}>{loading ? 'Sending...' : 'Send 🌊'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="What's rippling through your mind?"
          placeholderTextColor="#444"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={500}
          autoFocus
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.charCount}>{500 - content.length} characters left</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: '#7F77DD',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#3a3a6e',
  },
  postButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7F77DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 26,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    alignItems: 'flex-end',
  },
  charCount: {
    color: '#444',
    fontSize: 13,
  },
});