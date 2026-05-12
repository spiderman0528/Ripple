import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:5000';

export default function LeaderboardScreen() {
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

  const getRankStyle = (rank) => {
    if (rank === 1) return { color: '#FFD700', fontSize: 20 };
    if (rank === 2) return { color: '#C0C0C0', fontSize: 18 };
    if (rank === 3) return { color: '#CD7F32', fontSize: 16 };
    return { color: '#666', fontSize: 14 };
  };

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
      <View style={[styles.userCard, isCurrentUser && styles.currentUserCard]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, getRankStyle(item.rank)]}>
            {getRankEmoji(item.rank)}
          </Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.username, isCurrentUser && styles.currentUsername]}>
              @{item.username}
            </Text>
            {isCurrentUser && <Text style={styles.youBadge}>You</Text>}
          </View>
          <Text style={[styles.level, { color: level.color }]}>{level.label}</Text>
        </View>

        <View style={styles.energyContainer}>
          <Text style={styles.energyNumber}>{item.ripple_energy}</Text>
          <Text style={styles.energyLabel}>energy</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
        <TouchableOpacity onPress={fetchLeaderboard}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {users.length > 0 && (
        <View style={styles.topThree}>
          <View style={styles.topCard}>
            <Text style={styles.topEmoji}>👑</Text>
            <View style={styles.topAvatar}>
              <Text style={styles.topAvatarText}>{users[0].username[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.topUsername}>@{users[0].username}</Text>
            <Text style={styles.topEnergy}>{users[0].ripple_energy} ⚡</Text>
          </View>
        </View>
      )}

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.rank.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users yet. Start rippling!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  centered: { flex: 1, backgroundColor: '#0a0a0f', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#666', fontSize: 16 },
  header: { padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#1a1a2e', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, color: '#ffffff', fontWeight: 'bold' },
  refreshText: { color: '#7F77DD', fontSize: 16 },
  topThree: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  topCard: { alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 20, padding: 20, width: '60%', borderWidth: 1, borderColor: '#FFD700' },
  topEmoji: { fontSize: 32, marginBottom: 8 },
  topAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  topAvatarText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  topUsername: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  topEnergy: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  list: { padding: 16 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a2a4e' },
  currentUserCard: { borderColor: '#7F77DD', backgroundColor: '#1a1a3e' },
  rankContainer: { width: 40, alignItems: 'center' },
  rank: { fontWeight: 'bold' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#ffffff', fontWeight: 'bold' },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  username: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  currentUsername: { color: '#7F77DD' },
  youBadge: { backgroundColor: '#7F77DD', color: '#ffffff', fontSize: 11, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, fontWeight: 'bold' },
  level: { fontSize: 12 },
  energyContainer: { alignItems: 'center' },
  energyNumber: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  energyLabel: { color: '#666', fontSize: 11 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 48, fontSize: 16 },
});