import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://127.0.0.1:5000';

export default function GroupsScreen() {
  const { theme } = useTheme();
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups/`);
      setGroups(response.data);
    } catch (err) {
      console.log('Error fetching groups:', err);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) { setError('Group needs a name!'); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/groups/`,
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName('');
      setDescription('');
      setSuccess('Group created!');
      setShowCreate(false);
      await fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleJoin = async (groupId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/groups/${groupId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message);
      await fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not join group');
    }
  };

  const renderGroup = ({ item }) => (
    <View style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.groupHeader}>
        <View style={styles.groupIcon}>
          <Text style={styles.groupIconText}>{item.name[0].toUpperCase()}</Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.groupMembers, { color: theme.textSecondary }]}>👥 {item.member_count} {item.member_count === 1 ? 'member' : 'members'}</Text>
        </View>
      </View>
      {item.description ? <Text style={[styles.groupDescription, { color: theme.textSecondary }]}>{item.description}</Text> : null}
      <TouchableOpacity style={[styles.joinButton, { borderColor: theme.accent }]} onPress={() => handleJoin(item.id)}>
        <Text style={[styles.joinButtonText, { color: theme.accent }]}>Join Circle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>👥 Circles</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreate(!showCreate)}>
          <Text style={styles.createButtonText}>{showCreate ? '✕ Cancel' : '+ New'}</Text>
        </TouchableOpacity>
      </View>

      {success ? <Text style={styles.successText}>{success}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showCreate && (
        <View style={[styles.createForm, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TextInput style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} placeholder="Circle name" placeholderTextColor={theme.textTertiary} value={name} onChangeText={setName} />
          <TextInput style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} placeholder="Description (optional)" placeholderTextColor={theme.textTertiary} value={description} onChangeText={setDescription} />
          <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleCreate} disabled={loading}>
            <Text style={styles.submitButtonText}>{loading ? 'Creating...' : 'Create Circle'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.textTertiary }]}>No circles yet. Create the first one!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 48, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  createButton: { backgroundColor: '#7F77DD', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  createButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  successText: { color: '#6bffb8', textAlign: 'center', padding: 8, fontSize: 14 },
  errorText: { color: '#ff6b6b', textAlign: 'center', padding: 8, fontSize: 14 },
  createForm: { padding: 16, borderBottomWidth: 1 },
  input: { padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 15, borderWidth: 1 },
  submitButton: { backgroundColor: '#7F77DD', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#3a3a6e' },
  submitButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  list: { padding: 16 },
  groupCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  groupIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  groupIconText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  groupMembers: { fontSize: 13 },
  groupDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  joinButton: { borderWidth: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  joinButtonText: { fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 48, fontSize: 16 },
});