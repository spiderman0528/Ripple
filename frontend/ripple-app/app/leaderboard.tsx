import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://127.0.0.1:5000';

export default function LeaderboardScreen() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/leaderboard/`);
      setUsers(response.data);
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
    } catch (err) {
      console.log('Error fetching leaderboard:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const getRankEmoji = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getEnergyLevel = (energy) => {
    if (energy >= 500) return { label: 'Wave Master', color: '#FFD700' };
    if (energy >= 200) return { label: 'Rippler', color: '#7F77DD' };
    if (energy >= 100) return { label: 'Surfer', color: '#5DCAA5' };
    return { label: 'Newcomer', color: '#888' };
  };

  const renderUser = ({ item }) => {
    const isCurrentUser = currentUser && item.username === currentUser.username;
    const level = getEnergyLevel(item.ripple_energy);
    return (
      <View style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border }, isCurrentUser && { borderColor: theme.accent }]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, { color: theme.textTertiary }]}>{getRankEmoji(item.rank)}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.username, { color: theme.text }, isCurrentUser && { color: theme.accent }]}>@{item.username}</Text>
            {isCurrentUser && <Text style={styles.youBadge}>You</Text>}
          </View>
          <Text style={[styles.level, { color: level.color }]}>{level.label}</Text>
        </View>
        <View style={styles.energyContainer}>
          <Text style={styles.energyNumber}>{item.ripple_energy}</Text>
          <Text style={[styles.energyLabel, { color: theme.textTertiary }]}>energy</Text>
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.textSecondary }}>Loading leaderboard...</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🏆 Leaderboard</Text>
        <TouchableOpacity onPress={fetchLeaderboard}>
          <Text style={[styles.refreshText, { color: theme.accent }]}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>
      {users.length > 0 && (
        <View style={[styles.topThree, { borderBottomColor: theme.border }]}>
          <View style={[styles.topCard, { backgroundColor: theme.surface, borderColor: '#FFD700' }]}>
            <Text style={styles.topEmoji}>👑</Text>
            <View style={styles.topAvatar}>
              <Text style={styles.topAvatarText}>{users[0].username[0].toUpperCase()}</Text>
            </View>
            <Text style={[styles.topUsername, { color: theme.text }]}>@{users[0].username}</Text>
            <Text style={styles.topEnergy}>{users[0].ripple_energy} ⚡</Text>
          </View>
        </View>
      )}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.rank.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textTertiary }]}>No users yet. Start rippling!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 16, paddingTop: 48, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  refreshText: { fontSize: 16 },
  topThree: { padding: 16, alignItems: 'center', borderBottomWidth: 1 },
  topCard: { alignItems: 'center', borderRadius: 20, padding: 20, width: '60%', borderWidth: 1 },
  topEmoji: { fontSize: 32, marginBottom: 8 },
  topAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  topAvatarText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  topUsername: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  topEnergy: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  list: { padding: 16 },
  userCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  rankContainer: { width: 40, alignItems: 'center' },
  rank: { fontWeight: 'bold', fontSize: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#ffffff', fontWeight: 'bold' },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  username: { fontSize: 15, fontWeight: 'bold' },
  youBadge: { backgroundColor: '#7F77DD', color: '#ffffff', fontSize: 11, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, fontWeight: 'bold' },
  level: { fontSize: 12 },
  energyContainer: { alignItems: 'center' },
  energyNumber: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  energyLabel: { fontSize: 11 },
  emptyText: { textAlign: 'center', marginTop: 48, fontSize: 16 },
});