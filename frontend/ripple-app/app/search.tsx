import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://127.0.0.1:5000';

export default function SearchScreen() {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const [usersRes, groupsRes] = await Promise.all([
        axios.get(`${API_URL}/search/users?q=${query}`),
        axios.get(`${API_URL}/search/groups?q=${query}`)
      ]);
      setUsers(usersRes.data);
      setGroups(groupsRes.data);
    } catch (err) {
      console.log('Search error:', err);
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🔍 Search</Text>
      </View>
      <View style={styles.searchBar}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Search users or circles..."
          placeholderTextColor={theme.textTertiary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {loading && <Text style={[styles.loadingText, { color: theme.textTertiary }]}>Searching...</Text>}
      {searched && !loading && (
        <FlatList
          data={[
            ...(users.length > 0 ? [{ type: 'header', label: `👤 Users (${users.length})`, id: 'users-header' }] : []),
            ...users.map(u => ({ ...u, type: 'user' })),
            ...(groups.length > 0 ? [{ type: 'header', label: `👥 Circles (${groups.length})`, id: 'groups-header' }] : []),
            ...groups.map(g => ({ ...g, type: 'group' })),
          ]}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.results}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textTertiary }]}>No results for "{query}"</Text>}
          renderItem={({ item }) => {
            if (item.type === 'header') return <Text style={[styles.sectionHeader, { color: theme.accent }]}>{item.label}</Text>;
            if (item.type === 'user') return (
              <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: theme.text }]}>@{item.username}</Text>
                  <Text style={[styles.resultMeta, { color: theme.textSecondary }]}>⚡ {item.ripple_energy} energy</Text>
                </View>
              </View>
            );
            if (item.type === 'group') return (
              <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.avatar, styles.groupAvatar]}>
                  <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.resultMeta, { color: theme.textSecondary }]}>👥 {item.member_count} members</Text>
                </View>
              </View>
            );
            return null;
          }}
        />
      )}
      {!searched && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>🔍</Text>
          <Text style={[styles.placeholderText, { color: theme.textTertiary }]}>Search for users or circles</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 48, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  searchBar: { flexDirection: 'row', padding: 16, gap: 10 },
  input: { flex: 1, padding: 12, borderRadius: 12, fontSize: 15, borderWidth: 1 },
  searchButton: { backgroundColor: '#7F77DD', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  searchButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  loadingText: { textAlign: 'center', padding: 16 },
  results: { padding: 16 },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 8 },
  resultCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  groupAvatar: { backgroundColor: '#534AB7' },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  resultMeta: { fontSize: 13 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 48, marginBottom: 12 },
  placeholderText: { fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 48, fontSize: 16 },
});