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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { API_CONFIG } from '@/utils/api-config';
import { useAudioPlayer } from 'expo-audio';
import { Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';



interface AudioPrediction {
  id: string;
  audio_filename: string;
  predicted_label: string;
  confidence: number;
  created_at: string;
  audio_url: string;
}

// Label descriptions mapping
const getLabelDescription = (label: string) => {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('hungry') || lowerLabel.includes('hunger')) {
    return {
      title: 'Hunger',
      description: 'Your baby is showing signs of hunger. This cry typically starts softly and becomes more rhythmic and insistent. It may be accompanied by rooting behaviors or sucking motions.',
      suggestions: [
        'Check if it\'s been 2-3 hours since the last feeding',
        'Look for early hunger cues like lip-smacking or hand-to-mouth movements',
        'Prepare feeding in a calm, quiet environment',
        'Ensure proper latch or bottle positioning'
      ]
    };
  } else if (lowerLabel.includes('tired') || lowerLabel.includes('sleepy')) {
    return {
      title: 'Tiredness',
      description: 'Your baby is showing signs of being tired or sleepy. This cry may be whiny and continuous, often accompanied by yawning, eye rubbing, or fussiness.',
      suggestions: [
        'Look for sleep cues: yawning, red eyes, or decreased activity',
        'Create a calm, dark environment',
        'Try gentle rocking or white noise',
        'Establish a consistent bedtime routine',
        'Avoid overstimulation before sleep time'
      ]
    };
  } else if (lowerLabel.includes('discomfort') || lowerLabel.includes('pain')) {
    return {
      title: 'Discomfort or Pain',
      description: 'Your baby may be experiencing discomfort or pain. This cry is often sudden, loud, and high-pitched. It can be caused by various factors including wet diaper, temperature, or physical discomfort.',
      suggestions: [
        'Check diaper and change if needed',
        'Verify room temperature (68-72°F is ideal)',
        'Check for tight clothing or irritating tags',
        'Look for signs of diaper rash or skin irritation',
        'If cry persists or is unusual, consult a healthcare provider'
      ]
    };
  } else if (lowerLabel.includes('burping')) {
    return {
      title: 'Need to Burp',
      description: 'Your baby may need to burp. This can occur during or after feeding when air is swallowed. The cry might be accompanied by squirming or arching of the back.',
      suggestions: [
        'Hold baby upright against your shoulder',
        'Gently pat or rub the back in circular motions',
        'Try different burping positions (over shoulder, sitting, or face-down on lap)',
        'Burp every 2-3 ounces during feeding',
        'Keep baby upright for 10-15 minutes after feeding'
      ]
    };
  } else if (lowerLabel.includes('belly') || lowerLabel.includes('gas')) {
    return {
      title: 'Belly Pain or Gas',
      description: 'Your baby may be experiencing gas or belly discomfort. This cry often comes in waves and may be accompanied by pulling legs up to the chest or a tense, hard belly.',
      suggestions: [
        'Try bicycle leg movements to help pass gas',
        'Gentle tummy massage in clockwise circles',
        'Hold baby in "football hold" or lay on tummy (supervised)',
        'Ensure proper feeding technique to reduce air intake',
        'Consider discussing feeding patterns with pediatrician'
      ]
    };
  } else {
    return {
      title: label,
      description: 'Your baby is crying. Every baby is unique and their cries can vary. Pay attention to the context and your baby\'s body language to understand their needs.',
      suggestions: [
        'Check basic needs: feeding, diaper, temperature',
        'Offer comfort through holding and soothing sounds',
        'Try different calming techniques',
        'Observe patterns in timing and triggers',
        'Trust your parental instincts'
      ]
    };
  }
};

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
  const [selectedPrediction, setSelectedPrediction] = useState<AudioPrediction | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

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

 // Replace the fetchPredictions function in history.tsx (around line 221)

const fetchPredictions = async (isRefreshing = false) => {
  try {
    if (!isRefreshing) {
      setLoading(true);
    }
    setError(null);

    // Get auth token from AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    
    if (!token) {
      setError('Please login to view history');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // ✅ FIXED: Added trailing slash and query parameters
    const url = `${API_CONFIG.BASE_URL}/audio-predictions/?skip=0&limit=20`;
    console.log('📡 Fetching predictions from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // ✅ FIXED: Using dynamic token
      },
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        setError('Session expired. Please login again.');
        // Optionally clear token and redirect to login
        await AsyncStorage.removeItem('authToken');
      } else {
        throw new Error(`Failed to fetch predictions: ${response.status}`);
      }
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const data = await response.json();
    console.log('✅ Predictions loaded:', data.length, 'items');
    setPredictions(data);
  } catch (err) {
    console.error('❌ Error fetching predictions:', err);
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


  const handleDetailsPress = (prediction: AudioPrediction) => {
    setSelectedPrediction(prediction);
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedPrediction(null);
  };

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
             <View style={styles.actionButtons}> <TouchableOpacity style={[ styles.playButton, isPlaying && styles.playButtonActive ]} onPress={() => playAudio(item.audio_url, item.id)} disabled={playingId !== null && playingId !== item.id} > {isPlaying ? ( <> <ActivityIndicator size="small" color="#FF6B35" /> <Text style={styles.playButtonText}>Playing...</Text> </> ) : ( <> <Ionicons name="play" size={16} color="#FF6B35" /> <Text style={styles.playButtonText}>Play</Text> </> )} </TouchableOpacity> <TouchableOpacity style={styles.detailsButton} onPress={() => handleDetailsPress(item)}> <Ionicons name="document-text-outline" size={16} color="#666" /> <Text style={styles.detailsButtonText}>Details</Text> </TouchableOpacity> </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPrediction && (() => {
              const details = getLabelDescription(selectedPrediction.predicted_label);
              const style = getPredictionStyle(selectedPrediction.predicted_label);
              
              return (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderLeft}>
                      <View style={[styles.modalIconContainer, { backgroundColor: style.iconBg }]}>
                        <Ionicons name={style.icon as any} size={32} color={style.iconColor} />
                      </View>
                      <View>
                        <Text style={styles.modalTitle}>{details.title}</Text>
                        <Text style={styles.modalConfidence}>{selectedPrediction.confidence}% confidence</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={closeDetailsModal} style={styles.closeButton}>
                      <Ionicons name="close" size={28} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* Modal Body */}
                  <ScrollView 
                    style={styles.modalBody}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Description */}
                    <View style={styles.descriptionSection}>
                      <Text style={styles.sectionLabel}>What this means</Text>
                      <Text style={styles.descriptionText}>{details.description}</Text>
                    </View>

                    {/* Recording Info */}
                    <View style={styles.infoSection}>
                      <Text style={styles.sectionLabel}>Recording Information</Text>
                      <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>{formatRelativeTime(selectedPrediction.created_at)} • {formatTime(selectedPrediction.created_at)}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Ionicons name="hourglass-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>Duration: {extractDuration(selectedPrediction.audio_filename)}</Text>
                      </View>
                    </View>

                    {/* Suggestions */}
                    <View style={styles.suggestionsSection}>
                      <Text style={styles.sectionLabel}>What you can do</Text>
                      {details.suggestions.map((suggestion, index) => (
                        <View key={index} style={styles.suggestionItem}>
                          <View style={styles.suggestionBullet}>
                            <View style={styles.bulletDot} />
                          </View>
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  modalConfidence: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 24,
  },
  descriptionSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  suggestionBullet: {
    paddingTop: 4,
    marginRight: 12,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
  disclaimerSection: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#666',
    marginLeft: 12,
  },
});
