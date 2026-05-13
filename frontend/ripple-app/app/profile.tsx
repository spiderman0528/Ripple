import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:5000';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
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

  useEffect(() => { fetchProfile(); }, []);

  const getEnergyLevel = (energy) => {
    if (energy >= 500) return { label: 'Wave Master', color: '#FFD700' };
    if (energy >= 200) return { label: 'Rippler', color: '#7F77DD' };
    if (energy >= 100) return { label: 'Surfer', color: '#5DCAA5' };
    return { label: 'Newcomer', color: '#888' };
  };

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.textSecondary }}>Loading profile...</Text>
    </View>
  );

  if (!user) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.textSecondary }}>Please log in to see your profile</Text>
    </View>
  );

  const energyLevel = getEnergyLevel(user.ripple_energy);

  const renderPost = ({ item }) => (
    <View style={[styles.postCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.postContent, { color: theme.text }]}>{item.content}</Text>
      <View style={styles.postFooter}>
        <Text style={[styles.postMeta, { color: theme.textTertiary }]}>{item.replies.length} {item.replies.length === 1 ? 'reply' : 'replies'}</Text>
        <Text style={[styles.postMeta, { color: theme.textTertiary }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
      </View>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.feed}
        ListHeaderComponent={
          <View>
            <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{user.username[0].toUpperCase()}</Text>
              </View>
              <Text style={[styles.username, { color: theme.text }]}>@{user.username}</Text>
              <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { borderColor: energyLevel.color }]}>
                  <Text style={[styles.badgeText, { color: energyLevel.color }]}>{energyLevel.label}</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: theme.text }]}>{user.ripple_energy}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Ripple Energy</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: theme.text }]}>{posts.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Ripples</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: theme.text }]}>{posts.reduce((acc, p) => acc + p.replies.length, 0)}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Replies</Text>
                </View>
              </View>

              <View style={[styles.settingsRow, { borderTopColor: theme.border }]}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </Text>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#ddd', true: '#7F77DD' }}
                  thumbColor="#ffffff"
                />
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Ripples</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No ripples yet. Start the wave!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 16, paddingTop: 48, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  feed: { padding: 16 },
  profileCard: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLargeText: { color: '#ffffff', fontSize: 32, fontWeight: 'bold' },
  username: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 16 },
  badgeRow: { marginBottom: 20 },
  badge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  badgeText: { fontSize: 14, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, height: 40 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 20, paddingTop: 16, borderTopWidth: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  logoutButton: { marginTop: 12, width: '100%', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ff6b6b', alignItems: 'center' },
  logoutText: { color: '#ff6b6b', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  postCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  postContent: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  postMeta: { fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 24, fontSize: 15 },
});