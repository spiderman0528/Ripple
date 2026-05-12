import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:5000';

export default function BattlesScreen() {
  const [battles, setBattles] = useState([]);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEnter, setShowEnter] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [hours, setHours] = useState('24');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchBattles = async () => {
    try {
      const response = await axios.get(`${API_URL}/battles/`);
      setBattles(response.data);
    } catch (err) {
      console.log('Error fetching battles:', err);
    }
  };

  const fetchEntries = async (battleId) => {
    try {
      const response = await axios.get(`${API_URL}/battles/${battleId}/entries`);
      setEntries(response.data);
    } catch (err) {
      console.log('Error fetching entries:', err);
    }
  };

  useEffect(() => { fetchBattles(); }, []);

  const handleCreateBattle = async () => {
    if (!title.trim()) { setError('Battle needs a title!'); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/battles/`,
        { title, description, hours: parseInt(hours) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setDescription('');
      setHours('24');
      setSuccess('Battle created!');
      setShowCreate(false);
      await fetchBattles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleEnterBattle = async () => {
    if (!entryContent.trim()) { setError('Write your entry first!'); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/battles/${selectedBattle.id}/enter`,
        { content: entryContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEntryContent('');
      setSuccess('Entry submitted!');
      setShowEnter(false);
      await fetchEntries(selectedBattle.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not submit entry');
    }
    setLoading(false);
  };

  const handleVote = async (entryId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/battles/entries/${entryId}/vote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEntries(selectedBattle.id);
    } catch (err) {
      console.log('Error voting:', err);
    }
  };

  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  if (selectedBattle) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setSelectedBattle(null); setEntries([]); setError(''); setSuccess(''); }}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>⚔️ {selectedBattle.title}</Text>
        </View>

        <View style={styles.battleInfo}>
          <Text style={styles.battleDescription}>{selectedBattle.description}</Text>
          <View style={styles.battleMeta}>
            <Text style={[styles.timeLeft, !selectedBattle.is_active && styles.ended]}>
              {getTimeLeft(selectedBattle.expires_at)}
            </Text>
            <Text style={styles.entryCount}>{selectedBattle.entry_count} entries</Text>
          </View>
        </View>

        {success ? <Text style={styles.successText}>{success}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {selectedBattle.is_active && (
          <TouchableOpacity
            style={styles.enterButton}
            onPress={() => setShowEnter(!showEnter)}
          >
            <Text style={styles.enterButtonText}>
              {showEnter ? '✕ Cancel' : '⚔️ Submit Entry'}
            </Text>
          </TouchableOpacity>
        )}

        {showEnter && (
          <View style={styles.entryForm}>
            <TextInput
              style={styles.entryInput}
              placeholder="Your battle entry..."
              placeholderTextColor="#444"
              value={entryContent}
              onChangeText={setEntryContent}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleEnterBattle}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Submitting...' : 'Submit Entry'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={entries}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No entries yet. Be the first!</Text>
          }
          renderItem={({ item, index }) => (
            <View style={[styles.entryCard, index === 0 && styles.topEntry]}>
              {index === 0 && entries.length > 0 && (
                <Text style={styles.topBadge}>👑 Leading</Text>
              )}
              <View style={styles.entryHeader}>
                <View style={styles.entryAvatar}>
                  <Text style={styles.entryAvatarText}>{item.author[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.entryAuthor}>@{item.author}</Text>
              </View>
              <Text style={styles.entryContent}>{item.content}</Text>
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => handleVote(item.id)}
              >
                <Text style={styles.voteButtonText}>⚡ {item.votes} votes</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚔️ Wave Battles</Text>
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
            placeholder="Battle title (e.g. Best exam meme)"
            placeholderTextColor="#444"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            placeholderTextColor="#444"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Duration in hours (default 24)"
            placeholderTextColor="#444"
            value={hours}
            onChangeText={setHours}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleCreateBattle}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating...' : 'Start Battle'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={battles}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No battles yet. Start one!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.battleCard}
            onPress={() => { setSelectedBattle(item); fetchEntries(item.id); setError(''); setSuccess(''); }}
          >
            <View style={styles.battleCardHeader}>
              <Text style={styles.battleTitle}>{item.title}</Text>
              <View style={[styles.statusBadge, !item.is_active && styles.statusBadgeEnded]}>
                <Text style={styles.statusText}>{item.is_active ? '🔥 Live' : '🏁 Ended'}</Text>
              </View>
            </View>
            {item.description ? (
              <Text style={styles.battleCardDescription}>{item.description}</Text>
            ) : null}
            <View style={styles.battleCardFooter}>
              <Text style={styles.battleCardMeta}>by @{item.creator}</Text>
              <Text style={styles.battleCardMeta}>{item.entry_count} entries · {getTimeLeft(item.expires_at)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#1a1a2e', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, color: '#ffffff', fontWeight: 'bold', flex: 1 },
  backButton: { color: '#7F77DD', fontSize: 16, marginRight: 12 },
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
  battleCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a4e' },
  battleCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  battleTitle: { color: '#ffffff', fontSize: 17, fontWeight: 'bold', flex: 1, marginRight: 8 },
  statusBadge: { backgroundColor: '#3a2a0f', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeEnded: { backgroundColor: '#1a1a2e' },
  statusText: { fontSize: 12, color: '#FFD700' },
  battleCardDescription: { color: '#aaaaaa', fontSize: 14, marginBottom: 10 },
  battleCardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  battleCardMeta: { color: '#666', fontSize: 12 },
  battleInfo: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  battleDescription: { color: '#aaaaaa', fontSize: 15, marginBottom: 10 },
  battleMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  timeLeft: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },
  ended: { color: '#666' },
  entryCount: { color: '#666', fontSize: 14 },
  enterButton: { margin: 16, backgroundColor: '#7F77DD', padding: 14, borderRadius: 12, alignItems: 'center' },
  enterButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  entryForm: { marginHorizontal: 16, marginBottom: 16 },
  entryInput: { backgroundColor: '#1a1a2e', color: '#ffffff', padding: 12, borderRadius: 10, marginBottom: 10, fontSize: 15, borderWidth: 1, borderColor: '#2a2a4e', minHeight: 80 },
  entryCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a4e' },
  topEntry: { borderColor: '#FFD700' },
  topBadge: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  entryAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#7F77DD', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  entryAvatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  entryAuthor: { color: '#7F77DD', fontWeight: 'bold' },
  entryContent: { color: '#ffffff', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  voteButton: { borderWidth: 1, borderColor: '#7F77DD', borderRadius: 8, padding: 8, alignItems: 'center' },
  voteButtonText: { color: '#7F77DD', fontWeight: 'bold', fontSize: 14 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 48, fontSize: 16 },
});