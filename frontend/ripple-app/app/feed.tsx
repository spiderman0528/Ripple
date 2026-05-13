import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://127.0.0.1:5000';

export default function FeedScreen() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/`);
      setPosts(response.data);
    } catch (error) {
      console.log('Error fetching posts:', error);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/posts/`,
        { content: replyContent, parent_id: replyingTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyContent('');
      setReplyingTo(null);
      await fetchPosts();
    } catch (error) {
      console.log('Error posting reply:', error);
    }
    setLoading(false);
  };

  const renderPost = ({ item }) => (
    <View style={[styles.postCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.author[0].toUpperCase()}</Text>
        </View>
        <Text style={[styles.username, { color: theme.accent }]}>@{item.author}</Text>
      </View>
      <Text style={[styles.content, { color: theme.text }]}>{item.content}</Text>
      {item.replies.length > 0 && (
        <View style={[styles.repliesContainer, { borderLeftColor: theme.accent }]}>
          {item.replies.map(reply => (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.replyHeader}>
                <View style={styles.replyAvatar}>
                  <Text style={styles.replyAvatarText}>{reply.author[0].toUpperCase()}</Text>
                </View>
                <Text style={[styles.replyAuthor, { color: theme.accent }]}>@{reply.author}</Text>
              </View>
              <Text style={[styles.replyContent, { color: theme.textSecondary }]}>{reply.content}</Text>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity
        style={[styles.replyButton, { borderColor: theme.border }, replyingTo === item.id && { borderColor: theme.accent }]}
        onPress={() => { setReplyingTo(replyingTo === item.id ? null : item.id); setReplyContent(''); }}
      >
        <Text style={[styles.replyButtonText, { color: theme.accent }, replyingTo === item.id && { color: '#ff6b6b' }]}>
          {replyingTo === item.id ? '✕ Cancel' : '↩ Continue this chain'}
        </Text>
      </TouchableOpacity>
      {replyingTo === item.id && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={[styles.replyInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.accent }]}
            placeholder="Add to this chain..."
            placeholderTextColor={theme.textTertiary}
            value={replyContent}
            onChangeText={setReplyContent}
            multiline
            autoFocus
          />
          <TouchableOpacity
            style={[styles.sendButton, !replyContent.trim() && styles.sendButtonDisabled]}
            onPress={handleReply}
            disabled={loading || !replyContent.trim()}
          >
            <Text style={styles.sendButtonText}>{loading ? '...' : '🌊'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🌊 Ripple</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={[styles.refreshText, { color: theme.accent }]}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.feed}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textTertiary }]}>No ripples yet. Be the first!</Text>}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 48, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  refreshText: { fontSize: 16 },
  feed: { padding: 16 },
  postCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarText: { color: '#ffffff', fontWeight: 'bold' },
  username: { fontWeight: 'bold' },
  content: { fontSize: 16, lineHeight: 24, marginBottom: 12 },
  repliesContainer: { borderLeftWidth: 2, paddingLeft: 12, marginBottom: 12 },
  replyCard: { marginBottom: 10 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  replyAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#534AB7', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  replyAvatarText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  replyAuthor: { fontSize: 13 },
  replyContent: { fontSize: 14, lineHeight: 20 },
  replyButton: { padding: 8, alignItems: 'center', borderWidth: 1, borderRadius: 8 },
  replyButtonText: { fontSize: 14 },
  replyInputContainer: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 12, gap: 8 },
  replyInput: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 14, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#3a3a6e' },
  sendButtonText: { fontSize: 18 },
  emptyText: { textAlign: 'center', marginTop: 48, fontSize: 16 },
});