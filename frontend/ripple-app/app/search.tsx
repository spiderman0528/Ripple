import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000';

export default function SearchScreen() {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Search</Text>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search users or circles..."
          placeholderTextColor="#444"
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

      {loading && <Text style={styles.loadingText}>Searching...</Text>}

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
          ListEmptyComponent={
            <Text style={styles.emptyText}>No results for "{query}"</Text>
          }
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return <Text style={styles.sectionHeader}>{item.label}</Text>;
            }
            if (item.type === 'user') {
              return (
                <View style={styles.resultCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>@{item.username}</Text>
                    <Text style={styles.resultMeta}>⚡ {item.ripple_energy} energy</Text>
                  </View>
                </View>
              );
            }
            if (item.type === 'group') {
              return (
                <View style={styles.resultCard}>
                  <View style={[styles.avatar, styles.groupAvatar]}>
                    <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultMeta}>👥 {item.member_count} members</Text>
                  </View>
                </View>
              );
            }
            return null;
          }}
        />
      )}

      {!searched && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>🔍</Text>
          <Text style={styles.placeholderText}>Search for users or circles</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  headerTitle: { fontSize: 24, color: '#ffffff', fontWeight: 'bold' },
  searchBar: { flexDirection: 'row', padding: 16, gap: 10 },
  input: { flex: 1, backgroundColor: '#1a1a2e', color: '#ffffff', padding: 12, borderRadius: 12, fontSize: 15, borderWidth: 1, borderColor: '#2a2a4e' },
  searchButton: { backgroundColor: '#7F77DD', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  searchButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  loadingText: { color: '#666', textAlign: 'center', padding: 16 },
  results: { padding: 16 },
  sectionHeader: { color: '#7F77DD', fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 8 },
  resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2a2a4e' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  groupAvatar: { backgroundColor: '#534AB7' },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  resultInfo: { flex: 1 },
  resultName: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  resultMeta: { color: '#666', fontSize: 13 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 48, marginBottom: 12 },
  placeholderText: { color: '#666', fontSize: 16 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 48, fontSize: 16 },
});