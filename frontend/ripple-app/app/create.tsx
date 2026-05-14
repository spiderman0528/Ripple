import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  const [postType, setPostType] = useState('text');
  const [videoUri, setVideoUri] = useState(null);
  const [videoName, setVideoName] = useState('');

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission to access media library is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setVideoName(result.assets[0].fileName || 'video.mp4');
      setError('');
    }
  };

  const handlePost = async () => {
    setError('');
    setSuccess('');

    if (postType === 'text' && !content.trim()) {
      setError('Write something first!');
      return;
    }

    if (postType === 'video' && !videoUri) {
      setError('Pick a video first!');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      if (postType === 'video') {
        const formData = new FormData();
        formData.append('post_type', 'video');
        formData.append('content', content);
        formData.append('video', {
          uri: videoUri,
          name: videoName,
          type: 'video/mp4',
        } as any);

        await axios.post(`${API_URL}/posts/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post(
          `${API_URL}/posts/`,
          { content, post_type: 'text' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setContent('');
      setVideoUri(null);
      setVideoName('');
      setSuccess(postType === 'video' ? 'Video posted! 🎬' : 'Ripple sent! 🌊');
    } catch (err) {
      setError('Could not send your post. Are you logged in?');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>New Ripple</Text>
        <TouchableOpacity
          style={[styles.postButton, !((postType === 'text' && content.trim()) || (postType === 'video' && videoUri)) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={loading}
        >
          <Text style={styles.postButtonText}>{loading ? 'Sending...' : 'Send 🌊'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, postType === 'text' && styles.typeButtonActive]}
          onPress={() => { setPostType('text'); setVideoUri(null); }}
        >
          <Text style={[styles.typeButtonText, postType === 'text' && styles.typeButtonTextActive]}>✏️ Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, postType === 'video' && styles.typeButtonActive]}
          onPress={() => setPostType('video')}
        >
          <Text style={[styles.typeButtonText, postType === 'video' && styles.typeButtonTextActive]}>🎬 Video</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}

      {postType === 'text' ? (
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
      ) : (
        <View style={styles.videoSection}>
          <TouchableOpacity
            style={[styles.videoPicker, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={pickVideo}
          >
            {videoUri ? (
              <View style={styles.videoSelected}>
                <Text style={styles.videoSelectedIcon}>🎬</Text>
                <Text style={[styles.videoSelectedText, { color: theme.text }]}>Video selected!</Text>
                <Text style={[styles.videoSelectedSub, { color: theme.textSecondary }]}>{videoName}</Text>
                <Text style={[styles.videoChange, { color: theme.accent }]}>Tap to change</Text>
              </View>
            ) : (
              <View style={styles.videoEmpty}>
                <Text style={styles.videoEmptyIcon}>📱</Text>
                <Text style={[styles.videoEmptyText, { color: theme.text }]}>Pick a video</Text>
                <Text style={[styles.videoEmptySub, { color: theme.textSecondary }]}>from your library</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={[styles.captionInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            placeholder="Add a caption... (optional)"
            placeholderTextColor={theme.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={200}
          />
        </View>
      )}

      {postType === 'text' && (
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.charCount, { color: theme.textTertiary }]}>{500 - content.length} characters left</Text>
        </View>
      )}
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
  typeSelector: { flexDirection: 'row', padding: 16, gap: 12 },
  typeButton: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a4e', alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#7F77DD', borderColor: '#7F77DD' },
  typeButtonText: { color: '#666', fontWeight: 'bold', fontSize: 15 },
  typeButtonTextActive: { color: '#ffffff' },
  errorText: { color: '#ff6b6b', textAlign: 'center', padding: 8, fontSize: 14 },
  successText: { color: '#6bffb8', textAlign: 'center', padding: 8, fontSize: 14 },
  inputContainer: { flexDirection: 'row', padding: 16, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  input: { flex: 1, fontSize: 18, lineHeight: 26, textAlignVertical: 'top' },
  footer: { padding: 16, borderTopWidth: 1, alignItems: 'flex-end' },
  charCount: { fontSize: 13 },
  videoSection: { flex: 1, padding: 16 },
  videoPicker: { height: 250, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  videoEmpty: { alignItems: 'center' },
  videoEmptyIcon: { fontSize: 48, marginBottom: 8 },
  videoEmptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  videoEmptySub: { fontSize: 14 },
  videoSelected: { alignItems: 'center' },
  videoSelectedIcon: { fontSize: 48, marginBottom: 8 },
  videoSelectedText: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  videoSelectedSub: { fontSize: 12, marginBottom: 8 },
  videoChange: { fontSize: 14, fontWeight: 'bold' },
  captionInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
});