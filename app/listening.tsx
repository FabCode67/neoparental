import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { 
  useAudioRecorder, 
  RecordingPresets,
  setIsAudioActiveAsync,
  useAudioRecorderState,
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-audio';
import { uploadAndSaveAudioPrediction, formatPredictionResponse, PredictionResponse, AudioFile } from '@/utils/api';
import { Colors, Messages } from '@/constants/app';

export default function ListeningScreen() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<AudioFile | null>(null);
  const [recordedFile, setRecordedFile] = useState<AudioFile | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingInterval]);

  const checkPermissions = async () => {
    try {
      const permission = await getPermissionsAsync();
      setHasPermission(permission.granted);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const permission = await requestPermissionsAsync();
      setHasPermission(permission.granted);
      return permission.granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setUploadedFile({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
        });
        setRecordedFile(null); // Clear recorded file when uploading new file
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', Messages.errors.filePermission);
    }
  };

  const startRecording = async () => {
    try {
      // Check and request permissions
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert('Permission required', Messages.errors.audioPermission);
          return;
        }
      }

      // Clear previous recordings
      setRecordedFile(null);
      setUploadedFile(null);
      setRecordingDuration(0);

      await setIsAudioActiveAsync(true);
      await audioRecorder.record();

      // Start duration counter
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);

      console.log('Recording started...');
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', Messages.errors.recordingFailed);
    }
  };

  const stopRecording = async () => {
    try {
      // Stop duration counter
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }

      const uri = await audioRecorder.stop();
      await setIsAudioActiveAsync(false);
      
      console.log('Recording stopped. URI:', uri);

      if (uri) {
        const recordedAudio: AudioFile = {
          uri,
          name: `recording_${Date.now()}.m4a`,
          type: 'audio/m4a',
          mimeType: 'audio/m4a',
        };
        
        setRecordedFile(recordedAudio);
        setUploadedFile(null); // Clear uploaded file
        
        Alert.alert(
          'Recording Complete',
          `Duration: ${recordingDuration}s\nReady to upload!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Recording failed. Please try again.');
      }
      
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', Messages.errors.recordingFailed);
      setRecordingDuration(0);
    }
  };

  const uploadAudio = async (file: AudioFile) => {
    setIsUploading(true);
    
    try {
      console.log('=== UPLOAD STARTED ===');
      console.log('Uploading audio file:', JSON.stringify(file));
      
      // Upload to ML API and optionally save to backend database
      const response = await uploadAndSaveAudioPrediction(file, recordingDuration || undefined);
      console.log('=== RAW RESPONSE ===');
      console.log('Response object:', JSON.stringify(response));
      console.log('Prediction:', JSON.stringify(response.prediction));
      console.log('Saved to backend:', response.savedToBackend);
      
      console.log('=== FORMATTING RESPONSE ===');
      const formattedResponse = formatPredictionResponse(response.prediction);
      console.log('Formatted response:', JSON.stringify(formattedResponse));
      
      // Important: Set isUploading to false BEFORE setting result
      // This prevents re-render issues
      setIsUploading(false);
      
      console.log('=== SETTING RESULT ===');
      // Use setTimeout to ensure state update happens after current render cycle
      setTimeout(() => {
        setResult(formattedResponse);
        console.log('Result state updated');
      }, 100);
      
      // Show appropriate message based on whether it was saved
      const message = response.savedToBackend 
        ? 'Prediction completed and saved to your history!'
        : 'Prediction completed! (Log in to save predictions to history)';
      
      console.log('=== SUCCESS ===');
      console.log('Showing message:', message);
      
      // Show alert after result is set
      setTimeout(() => {
        Alert.alert('Success', message, [{ text: 'OK' }]);
      }, 600);
      
    } catch (error) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Error:', error);
      setIsUploading(false);
      const errorMessage = error instanceof Error ? error.message : Messages.errors.uploadFailed;
      Alert.alert('Error', errorMessage);
    } finally {
      console.log('=== UPLOAD COMPLETE ===');
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isRecording = recorderState.isRecording;

  // Debug: Log when result changes
  useEffect(() => {
    console.log('=== RESULT STATE CHANGED ===');
    console.log('Result is now:', result ? JSON.stringify(result) : 'null');
  }, [result]);

  if (result) {
    console.log('=== RENDERING RESULT VIEW ===');
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-circle-outline" size={32} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Listening</Text>
          <Text style={styles.title}>output</Text>
          <Text style={styles.subtitle}>Upload or recording audio sound</Text>
        </View>

        <View style={styles.resultModal}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Result</Text>
            <TouchableOpacity>
              <Ionicons name="expand-outline" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.resultContent}>
            <Text style={styles.resultLabel}>
              Input: <Text style={styles.resultValue}>{uploadedFile?.name || recordedFile?.name}</Text>
            </Text>
            
            <Text style={styles.resultLabel}>
              Output: <Text style={styles.resultValue}>{result.predicted_label || result.output}</Text>
            </Text>
            
            {result.confidence !== undefined && (
              <Text style={styles.resultLabel}>
                Confidence: <Text style={styles.resultValue}>{result.confidence.toFixed(1)}%</Text>
              </Text>
            )}
            
            <Text style={styles.resultLabel}>
              Level: <Text style={styles.resultValue}>{result.level}</Text>
            </Text>

            {result.processing_time !== undefined && (
              <Text style={styles.resultMeta}>
                Processing time: {result.processing_time.toFixed(2)}s
              </Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.recommendationTitle}>Recommendation:</Text>
            <Text style={styles.recommendationText}>{result.recommendation}</Text>
          </View>

          <TouchableOpacity 
            style={styles.tryAgainButton}
            onPress={() => {
              setResult(null);
              setUploadedFile(null);
              setRecordedFile(null);
            }}
          >
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={32} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Listening</Text>
        <Text style={styles.title}>output</Text>
        <Text style={styles.subtitle}>Upload or recording audio sound</Text>
      </View>

      {/* File Upload Section */}
      <View style={styles.uploadSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>File upload</Text>
          <TouchableOpacity onPress={() => setUploadedFile(null)}>
            <Ionicons name="close-circle" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {uploadedFile ? (
          <View style={styles.filePreview}>
            <Ionicons name="musical-notes" size={32} color={Colors.gray} />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{uploadedFile.name}</Text>
              <Text style={styles.fileDetails}>
                Size: {uploadedFile.size ? `${(uploadedFile.size / 1024).toFixed(0)}kb` : 'Unknown'}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={pickAudioFile}>
            <Ionicons name="cloud-upload-outline" size={48} color={Colors.gray} />
            <Text style={styles.uploadText}>Tap to select audio file</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.actionButton, (!uploadedFile || isUploading) && styles.actionButtonDisabled]}
          onPress={() => uploadedFile && uploadAudio(uploadedFile)}
          disabled={!uploadedFile || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Upload</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* File Recording Section */}
      <View style={styles.uploadSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>File recording</Text>
          <TouchableOpacity onPress={() => setRecordedFile(null)}>
            <Ionicons name="close-circle" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {recordedFile ? (
          <View style={styles.filePreview}>
            <Ionicons name="musical-notes" size={32} color={Colors.gray} />
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{recordedFile.name}</Text>
              <Text style={styles.fileDetails}>Ready to upload</Text>
            </View>
          </View>
        ) : isRecording ? (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording... {formatDuration(recordingDuration)}</Text>
          </View>
        ) : (
          <View style={styles.recordingPlaceholder}>
            <Ionicons name="mic-outline" size={48} color={Colors.gray} />
            <Text style={styles.uploadText}>Tap to start recording</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons 
            name={isRecording ? "stop" : "mic"} 
            size={24} 
            color={Colors.darkBrown} 
          />
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop Recording' : 'Start Listening'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, (!recordedFile || isUploading) && styles.actionButtonDisabled]}
          onPress={() => recordedFile && uploadAudio(recordedFile)}
          disabled={!recordedFile || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Upload</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginTop: 8,
  },
  uploadSection: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: Colors.gray,
  },
  uploadButton: {
    backgroundColor: Colors.white,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    marginTop: 8,
    color: Colors.gray,
  },
  recordingPlaceholder: {
    backgroundColor: Colors.white,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingIndicator: {
    backgroundColor: '#FFCDD2',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    marginRight: 12,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkBrown,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 30,
    marginBottom: 16,
  },
  recordButtonActive: {
    backgroundColor: '#FFCDD2',
  },
  recordButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.darkBrown,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkBrown,
    padding: 16,
    borderRadius: 30,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resultModal: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: -20,
    marginTop: -20,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  resultContent: {
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultValue: {
    fontWeight: 'normal',
  },
  resultMeta: {
    fontSize: 12,
    color: Colors.gray,
    fontStyle: 'italic',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.gray,
  },
  tryAgainButton: {
    backgroundColor: Colors.darkBrown,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  tryAgainText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
