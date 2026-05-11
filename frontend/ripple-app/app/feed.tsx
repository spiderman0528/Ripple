import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:5000';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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
              <Text style={styles.replyAuthor}>@{reply.author}</Text>
              <Text style={styles.replyContent}>{reply.content}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.replyButton}>
        <Text style={styles.replyButtonText}>↩ Continue this chain</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌊 Ripple</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7F77DD" />}
        contentContainerStyle={styles.feed}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No ripples yet. Be the first!</Text>
        }
      />
    </View>
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
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  replyAuthor: {
    color: '#7F77DD',
    fontSize: 13,
    marginBottom: 2,
  },
  replyContent: {
    color: '#cccccc',
    fontSize: 14,
  },
  replyButton: {
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
    borderRadius: 8,
  },
  replyButtonText: {
    color: '#7F77DD',
    fontSize: 14,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
  },
});