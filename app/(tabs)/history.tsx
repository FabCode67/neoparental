import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { API_CONFIG } from '@/utils/api-config';
import { useAudioPlayer } from 'expo-audio';
import { Button } from 'react-native';



interface AudioPrediction {
  id: string;
  audio_filename: string;
  predicted_label: string;
  confidence: number;
  created_at: string;
  audio_url: string;
}

// Helper function to get icon and color based on prediction label
const getPredictionStyle = (label: string) => {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('hungry') || lowerLabel.includes('hunger')) {
    return {
      icon: 'restaurant',
      iconColor: '#FF6B35',
      iconBg: '#FFE8E0',
    };
  } else if (lowerLabel.includes('tired') || lowerLabel.includes('sleepy')) {
    return {
      icon: 'moon',
      iconColor: '#2196F3',
      iconBg: '#E3F2FD',
    };
  } else if (lowerLabel.includes('discomfort') || lowerLabel.includes('pain')) {
    return {
      icon: 'sad',
      iconColor: '#FF6B35',
      iconBg: '#FFE8E0',
    };
  } else if (lowerLabel.includes('burping')) {
    return {
      icon: 'nutrition',
      iconColor: '#4CAF50',
      iconBg: '#E8F5E9',
    };
  } else if (lowerLabel.includes('belly') || lowerLabel.includes('gas')) {
    return {
      icon: 'fitness',
      iconColor: '#9C27B0',
      iconBg: '#F3E5F5',
    };
  } else {
    return {
      icon: 'musical-notes',
      iconColor: '#FF6B35',
      iconBg: '#FFE8E0',
    };
  }
};

// Helper function to format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Helper function to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

// Helper function to extract duration from filename (if available)
const extractDuration = (filename: string) => {
  // Try to extract duration from filename pattern
  const match = filename.match(/(\d+\.\d+)-[mf]/);
  if (match) {
    const seconds = parseFloat(match[1]);
    return `${Math.round(seconds)}s`;
  }
  return '0s';
};

export default function HistoryScreen() {
  const [predictions, setPredictions] = useState<AudioPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Configure audio mode on component mount
  useEffect(() => {
    configureAudioMode();
    return () => {
      // Cleanup sound on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const configureAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error configuring audio mode:', error);
    }
  };

  const fetchPredictions = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}/audio-predictions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTA1YzJkZjhjYjgxOTE5MjViYTQwMTUiLCJleHAiOjE3NjIwMjkwMjF9.1CpFDZ-7-GkqSTJUl2wSvDcMyZMwUJp4DrvJdcm0vgw`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to load predictions. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPredictions(true);
  };

  const playAudio = async (audioFilename: string, predictionId: string) => {
  try {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    // Stop playing if same ID pressed again
    if (playingId === predictionId) {
      setPlayingId(null);
      return;
    }

    setPlayingId(predictionId);

    // ✅ Use full Flask URL — replace with your backend IP
    const audioUrl =audioFilename;
    console.log("Loading audio from:", audioUrl);

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );

    setSound(newSound);
  } catch (error) {
    console.error("Error playing audio:", error);
    setPlayingId(null);
    Alert.alert(
      "Playback Error",
      "Failed to play audio. Please check your connection and try again.",
      [{ text: "OK" }]
    );
  }
};


  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      // Audio finished playing
      setPlayingId(null);
      if (sound) {
        sound.unloadAsync();
        setSound(null);
      }
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingId(null);
    }
  };
  const audioUrl = "https://res.cloudinary.com/dnhpmvk2p/video/upload/v1762025659/audio_predictions/audio_predictions/6905c2df8cb8191925ba4015_20251101_193416.wav";

  const player = useAudioPlayer(audioUrl);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading predictions...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B35" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchPredictions()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (predictions.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="musical-notes-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No recordings yet</Text>
          <Text style={styles.emptySubtext}>
            Start recording baby sounds to see predictions here
          </Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.historyList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
            colors={['#FF6B35']}
          />
        }
      >
        {predictions.map((item) => {
          const style = getPredictionStyle(item.predicted_label);
          const relativeTime = formatRelativeTime(item.created_at);
          const absoluteTime = formatTime(item.created_at);
          const duration = extractDuration(item.audio_filename);
          const isPlaying = playingId === item.id;

          return (
            <View key={item.id} style={styles.historyCard}>
              {/* Top Section */}
              <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: style.iconBg }]}>
                    <Ionicons name={style.icon as any} size={28} color={style.iconColor} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardType}>{item.predicted_label}</Text>
                    <Text style={styles.cardConfidence}>{item.confidence}% confidence</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>

              {/* Time and Duration */}
              <View style={styles.cardFooter}>
                <Text style={styles.timeText}>
                  {relativeTime}
                  {relativeTime !== 'Yesterday' && relativeTime !== 'Just now' && !relativeTime.includes('days ago') && !relativeTime.includes('/') && (
                    <Text style={styles.absoluteTime}> • {absoluteTime}</Text>
                  )}
                </Text>
                <Text style={styles.durationText}>Duration: {duration}</Text>
              </View>

              {/* Action Buttons */}
             <View style={styles.actionButtons}> <TouchableOpacity style={[ styles.playButton, isPlaying && styles.playButtonActive ]} onPress={() => playAudio(item.audio_url, item.id)} disabled={playingId !== null && playingId !== item.id} > {isPlaying ? ( <> <ActivityIndicator size="small" color="#FF6B35" /> <Text style={styles.playButtonText}>Playing...</Text> </> ) : ( <> <Ionicons name="play" size={16} color="#FF6B35" /> <Text style={styles.playButtonText}>Play</Text> </> )} </TouchableOpacity> <TouchableOpacity style={styles.detailsButton}> <Ionicons name="document-text-outline" size={16} color="#666" /> <Text style={styles.detailsButtonText}>Details</Text> </TouchableOpacity> </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Analysis of sounds and uploads</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Section Header */}
        {!loading && !error && predictions.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Recordings</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Text style={styles.viewAllText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
  },
  menuButton: {
    padding: 4,
  },
  notificationButton: {
    padding: 4,
  },
  titleSection: {
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.95,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  historyList: {
    flex: 1,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardConfidence: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  absoluteTime: {
    fontSize: 12,
    color: '#999',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 25,
    paddingVertical: 12,
    gap: 8,
  },
  playButtonActive: {
    backgroundColor: '#FFF3E0',
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingVertical: 12,
    gap: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
