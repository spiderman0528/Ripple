import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:5000';

export default function FeedScreen() {
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

  useEffect(() => {
    fetchPosts();
  }, []);

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
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.author[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>@{item.author}</Text>
      </View>

      <Text style={styles.content}>{item.content}</Text>

      {item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map(reply => (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.replyHeader}>
                <View style={styles.replyAvatar}>
                  <Text style={styles.replyAvatarText}>{reply.author[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.replyAuthor}>@{reply.author}</Text>
              </View>
              <Text style={styles.replyContent}>{reply.content}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.replyButton, replyingTo === item.id && styles.replyButtonActive]}
        onPress={() => {
          setReplyingTo(replyingTo === item.id ? null : item.id);
          setReplyContent('');
        }}
      >
        <Text style={[styles.replyButtonText, replyingTo === item.id && styles.replyButtonTextActive]}>
          {replyingTo === item.id ? '✕ Cancel' : '↩ Continue this chain'}
        </Text>
      </TouchableOpacity>

      {replyingTo === item.id && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Add to this chain..."
            placeholderTextColor="#444"
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌊 Ripple</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.feed}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No ripples yet. Be the first!</Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  refreshText: {
    color: '#7F77DD',
    fontSize: 16,
  },
  feed: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7F77DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  username: {
    color: '#7F77DD',
    fontWeight: 'bold',
  },
  content: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  repliesContainer: {
    borderLeftWidth: 2,
    borderLeftColor: '#7F77DD',
    paddingLeft: 12,
    marginBottom: 12,
  },
  replyCard: {
    marginBottom: 10,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#534AB7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  replyAvatarText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  replyAuthor: {
    color: '#7F77DD',
    fontSize: 13,
  },
  replyContent: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  replyButton: {
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
    borderRadius: 8,
  },
  replyButtonActive: {
    borderColor: '#7F77DD',
  },
  replyButtonText: {
    color: '#7F77DD',
    fontSize: 14,
  },
  replyButtonTextActive: {
    color: '#ff6b6b',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    color: '#ffffff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7F77DD',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7F77DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#3a3a6e',
  },
  sendButtonText: {
    fontSize: 18,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
  },
});