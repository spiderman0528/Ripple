import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const API_URL = 'http://127.0.0.1:5000';

export default function VideoFeedScreen() {
  const { theme } = useTheme();
  const [videos, setVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef({});

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/?type=video`);
      setVideos(response.data);
    } catch (err) {
      console.log('Error fetching videos:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleLike = async (postId, index) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = [...videos];
      updated[index] = { ...updated[index], likes: response.data.likes };
      setVideos(updated);
    } catch (err) {
      console.log('Error liking:', err);
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setActiveIndex(newIndex);
      Object.keys(videoRefs.current).forEach(key => {
        if (videoRefs.current[key]) {
          if (parseInt(key) === newIndex) {
            videoRefs.current[key].playAsync();
          } else {
            videoRefs.current[key].pauseAsync();
          }
        }
      });
    }
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  const renderVideo = ({ item, index }) => (
    <View style={styles.videoContainer}>
      {item.video_url ? (
        <Video
          ref={ref => { videoRefs.current[index] = ref; }}
          source={{ uri: `${API_URL}${item.video_url}` }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={index === activeIndex}
          isMuted={false}
        />
      ) : (
        <View style={[styles.video, { backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: '#fff', fontSize: 16 }}>No video available</Text>
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.bottomInfo}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.author[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.authorName}>@{item.author}</Text>
          </View>
          {item.content ? (
            <Text style={styles.caption} numberOfLines={2}>{item.content}</Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id, index)}>
            <Text style={styles.actionIcon}>❤️</Text>
            <Text style={styles.actionCount}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{item.replies.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🌊</Text>
            <Text style={styles.actionCount}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: '#000' }]}>
      <Text style={{ color: '#fff' }}>Loading videos...</Text>
    </View>
  );

  if (videos.length === 0) return (
    <View style={[styles.centered, { backgroundColor: '#000' }]}>
      <Text style={{ color: '#fff', fontSize: 48, marginBottom: 16 }}>🎬</Text>
      <Text style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>No videos yet</Text>
      <Text style={{ color: '#aaa', fontSize: 14 }}>Be the first to post a video!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={item => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>🌊 Ripple</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  videoContainer: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 80,
  },
  bottomInfo: {
    flex: 1,
    marginRight: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7F77DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  authorName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  caption: { color: '#fff', fontSize: 14, lineHeight: 20 },
  actions: {
    alignItems: 'center',
    gap: 20,
    paddingBottom: 8,
  },
  actionButton: { alignItems: 'center' },
  actionIcon: { fontSize: 32 },
  actionCount: { color: '#fff', fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topBarTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});