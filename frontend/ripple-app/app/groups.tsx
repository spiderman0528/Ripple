import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:5000';

export default function GroupsScreen() {
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
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupIcon}>
          <Text style={styles.groupIconText}>{item.name[0].toUpperCase()}</Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupMembers}>👥 {item.member_count} {item.member_count === 1 ? 'member' : 'members'}</Text>
        </View>
      </View>
      {item.description ? (
        <Text style={styles.groupDescription}>{item.description}</Text>
      ) : null}
      <TouchableOpacity style={styles.joinButton} onPress={() => handleJoin(item.id)}>
        <Text style={styles.joinButtonText}>Join Circle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Circles</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreate(!showCreate)}
        >
          <Text style={styles.createButtonText}>{showCreate ? '✕ Cancel' : '+ New'}</Text>
        </TouchableOpacity>
      </View>

      {success ? <Text style={styles.successText}>{success}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showCreate && (
        <View style={styles.createForm}>
          <TextInput
            style={styles.input}
            placeholder="Circle name"
            placeholderTextColor="#444"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            placeholderTextColor="#444"
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating...' : 'Create Circle'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No circles yet. Create the first one!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#1a1a2e', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, color: '#ffffff', fontWeight: 'bold' },
  createButton: { backgroundColor: '#7F77DD', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  createButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  successText: { color: '#6bffb8', textAlign: 'center', padding: 8, fontSize: 14 },
  errorText: { color: '#ff6b6b', textAlign: 'center', padding: 8, fontSize: 14 },
  createForm: { backgroundColor: '#1a1a2e', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a4e' },
  input: { backgroundColor: '#0a0a0f', color: '#ffffff', padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 15, borderWidth: 1, borderColor: '#2a2a4e' },
  submitButton: { backgroundColor: '#7F77DD', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#3a3a6e' },
  submitButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  list: { padding: 16 },
  groupCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a4e' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  groupIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  groupIconText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  groupInfo: { flex: 1 },
  groupName: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  groupMembers: { color: '#666', fontSize: 13 },
  groupDescription: { color: '#aaaaaa', fontSize: 14, marginBottom: 12, lineHeight: 20 },
  joinButton: { borderWidth: 1, borderColor: '#7F77DD', borderRadius: 10, padding: 10, alignItems: 'center' },
  joinButtonText: { color: '#7F77DD', fontWeight: 'bold', fontSize: 14 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 48, fontSize: 16 },
});