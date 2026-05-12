import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:5000';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const response = await axios.get(`${API_URL}/posts/`);
        const myPosts = response.data.filter(p => p.author === parsedUser.username);
        setPosts(myPosts);
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getEnergyLevel = (energy) => {
    if (energy >= 500) return { label: 'Wave Master', color: '#FFD700' };
    if (energy >= 200) return { label: 'Rippler', color: '#7F77DD' };
    if (energy >= 100) return { label: 'Surfer', color: '#5DCAA5' };
    return { label: 'Newcomer', color: '#888' };
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Please log in to see your profile</Text>
      </View>
    );
  }

  const energyLevel = getEnergyLevel(user.ripple_energy);

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postFooter}>
        <Text style={styles.postMeta}>
          {item.replies.length} {item.replies.length === 1 ? 'reply' : 'replies'}
        </Text>
        <Text style={styles.postMeta}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.feed}
        ListHeaderComponent={
          <View>
            <View style={styles.profileCard}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {user.username[0].toUpperCase()}
                </Text>
              </View>

              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>

              <View style={styles.badgeRow}>
                <View style={[styles.badge, { borderColor: energyLevel.color }]}>
                  <Text style={[styles.badgeText, { color: energyLevel.color }]}>
                    {energyLevel.label}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{user.ripple_energy}</Text>
                  <Text style={styles.statLabel}>Ripple Energy</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{posts.length}</Text>
                  <Text style={styles.statLabel}>Ripples</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>
                    {posts.reduce((acc, p) => acc + p.replies.length, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Replies</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Your Ripples</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No ripples yet. Start the wave!</Text>
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
  centered: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
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
  profileCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7F77DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  username: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  badgeRow: {
    marginBottom: 20,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#2a2a4e',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  postContent: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postMeta: {
    color: '#444',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 15,
  },
});