/**
 * API utility functions for NeoParental app
 * Handles communication with the prediction API and backend
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREDICTION_API_URL = 'https://neoparental-fast-api.onrender.com';
const BACKEND_API_URL = 'http://localhost:8000'; // Change to your deployed backend URL

export interface PredictionResponse {
  // New API response format
  prediction_value?: number;
  predicted_label?: string;
  confidence?: number;
  processing_time?: number;
  timestamp?: string;
  
  // Legacy format (for backward compatibility)
  output?: string;
  prediction?: string;
  level?: string;
  recommendation?: string;
}

export interface AudioFile {
  uri: string;
  name?: string;
  type?: string;
  mimeType?: string;
  size?: number;
}

export interface SavedAudioPrediction {
  id: string;
  user_id: string;
  audio_filename: string;
  audio_url: string;
  audio_size?: number;
  audio_duration?: number;
  prediction_result: PredictionResponse;
  created_at: string;
}

/**
 * Get auth token from storage
 * Uses AsyncStorage which works on all platforms (web, iOS, Android)
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Upload an audio file to the prediction API
 * @param file Audio file object with uri, name, and type
 * @returns Promise with prediction response
 */
export async function uploadAudioForPrediction(
  file: AudioFile
): Promise<PredictionResponse> {
  try {
    // Determine file name and mime type
    const fileName = file.name || `audio_${Date.now()}.wav`;
    let mimeType = file.mimeType || file.type || 'audio/wav';
    
    // Ensure mime type is correct based on file extension
    if (fileName.endsWith('.m4a')) {
      mimeType = 'audio/m4a';
    } else if (fileName.endsWith('.mp3')) {
      mimeType = 'audio/mpeg';
    } else if (fileName.endsWith('.wav')) {
      mimeType = 'audio/wav';
    }

    console.log('Preparing upload:', { uri: file.uri, name: fileName, type: mimeType });

    // Fetch the file as a blob first
    const fileResponse = await fetch(file.uri);
    const blob = await fileResponse.blob();
    
    console.log('Blob created:', blob.size, 'bytes');

    // Create FormData with the blob
    const formData = new FormData();
    formData.append('file', blob, fileName);

    console.log('Uploading to API...');

    const response = await fetch(`${PREDICTION_API_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Success Response:', data);
    return data;
  } catch (error) {
    console.error('Upload error details:', error);
    throw error;
  }
}

/**
 * Save audio file and prediction result to backend database
 * @param file Audio file object
 * @param predictionResult Prediction response from ML API
 * @param audioDuration Optional duration in seconds
 * @returns Promise with saved prediction data
 */
export async function saveAudioPredictionToBackend(
  file: AudioFile,
  predictionResult: PredictionResponse,
  audioDuration?: number
): Promise<SavedAudioPrediction> {
  try {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTA1YzJkZjhjYjgxOTE5MjViYTQwMTUiLCJleHAiOjE3NjIwMjcyNjZ9.7XkFHy5GxE0sLSdr8JMIgCgIZoW8Pa5rq0X-rBIrMvk"
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    // Fetch the file as a blob
    const fileResponse = await fetch(file.uri);
    const blob = await fileResponse.blob();

    // Create FormData
    const formData = new FormData();
    formData.append('audio_file', blob, file.name || 'audio.m4a');
    formData.append('prediction_result', JSON.stringify(predictionResult));
    
    if (file.size) {
      formData.append('audio_size', file.size.toString());
    }
    
    if (audioDuration) {
      formData.append('audio_duration', audioDuration.toString());
    }

    console.log('Saving to backend...');

    const response = await fetch(`${BACKEND_API_URL}/audio-predictions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend Error Response:', errorText);
      throw new Error(`Backend Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Saved to backend successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving to backend:', error);
    throw error;
  }
}

/**
 * Upload audio, get prediction, and optionally save to backend
 * @param file Audio file object
 * @param audioDuration Optional duration in seconds
 * @returns Promise with prediction response and optional save confirmation
 */
export async function uploadAndSaveAudioPrediction(
  file: AudioFile,
  audioDuration?: number
): Promise<{ prediction: PredictionResponse; saved?: SavedAudioPrediction; savedToBackend: boolean }> {
  try {
    // Step 1: Get prediction from ML API (always works)
    console.log('Step 1: Getting prediction...');
    const prediction = await uploadAudioForPrediction(file);
    console.log('Prediction received:', prediction);
    
    // Step 2: Try to save to backend database (only if authenticated)
    let saved: SavedAudioPrediction | undefined;
    let savedToBackend = false;
    
    try {
      const token = await getAuthToken();
      if (token) {
        console.log('Step 2: User is authenticated, saving to database...');
        saved = await saveAudioPredictionToBackend(file, prediction, audioDuration);
        savedToBackend = true;
        console.log('Saved to backend successfully');
      } else {
        console.log('Step 2: User not authenticated, skipping database save');
      }
    } catch (saveError) {
      console.warn('Failed to save to backend (continuing anyway):', saveError);
      // Don't throw - prediction still succeeded
    }
    
    return { prediction, saved, savedToBackend };
  } catch (error) {
    console.error('Error in upload and save flow:', error);
    throw error;
  }
}

/**
 * Get user's audio prediction history from backend
 * @param skip Number of records to skip
 * @param limit Number of records to return
 * @returns Promise with array of saved predictions
 */
export async function getAudioPredictionHistory(
  skip: number = 0,
  limit: number = 20
): Promise<SavedAudioPrediction[]> {
  try {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTA1YzJkZjhjYjgxOTE5MjViYTQwMTUiLCJleHAiOjE3NjIwMjQ2MTJ9.jypUdxrZ1_gEvNaiprzOQmHm5ySNGr2YIf4t7_DJjvY"
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await fetch(
      `${BACKEND_API_URL}/audio-predictions`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}

/**
 * Get prediction statistics
 * @returns Promise with user statistics
 */
export async function getPredictionStats(): Promise<{
  total_predictions: number;
  predictions_by_label: Array<{ label: string; count: number }>;
  average_confidence: number;
}> {
  try {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTA1YzJkZjhjYjgxOTE5MjViYTQwMTUiLCJleHAiOjE3NjIwMjIwNDh9.SJFc-vpl-yDok6Sx-W__HHSl90i60imbmS0oYDB-l_Y";
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await fetch(`${BACKEND_API_URL}/audio-predictions/stats/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

/**
 * Delete an audio prediction
 * @param predictionId ID of the prediction to delete
 */
export async function deleteAudioPrediction(predictionId: string): Promise<void> {
  try {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTA1YzJkZjhjYjgxOTE5MjViYTQwMTUiLCJleHAiOjE3NjIwMjEzMTh9.KlGbbfElEIdcyS4PTknkSm-EpnH1jg07SBXBmh75zxs"
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await fetch(`${BACKEND_API_URL}/audio-predictions/${predictionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete prediction: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting prediction:', error);
    throw error;
  }
}

/**
 * Check if the API is reachable
 * @returns Promise with boolean indicating if API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${PREDICTION_API_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Format the prediction response for display
 * @param response Raw API response
 * @returns Formatted response with default values
 */
export function formatPredictionResponse(
  response: PredictionResponse
): PredictionResponse {
  // Handle new API format
  if (response.predicted_label) {
    return {
      predicted_label: response.predicted_label,
      confidence: response.confidence,
      prediction_value: response.prediction_value,
      processing_time: response.processing_time,
      timestamp: response.timestamp,
      // Map to legacy fields for display
      output: response.predicted_label,
      level: getConfidenceLevel(response.confidence || 0),
      recommendation: getRecommendation(response.predicted_label),
    };
  }
  
  // Handle legacy format
  return {
    output: response.output || response.prediction || 'Unknown',
    prediction: response.prediction || response.output || 'Unknown',
    level: response.level || 'Medium',
    recommendation: response.recommendation || 'No recommendation available.',
  };
}

/**
 * Convert confidence percentage to level
 */
function getConfidenceLevel(confidence: number): string {
  if (confidence >= 80) return 'High';
  if (confidence >= 50) return 'Medium';
  return 'Low';
}

/**
 * Get recommendation based on predicted label
 */
function getRecommendation(label?: string): string {
  if (!label) return 'No recommendation available.';
  
  const recommendations: Record<string, string> = {
    'Hungry': 'The baby appears to be hungry. Try feeding them milk or formula. Look for hunger cues like rooting, sucking on hands, or smacking lips.',
    'Tired/Sleepy': 'The baby seems tired and needs rest. Create a calm, quiet environment. Dim the lights and help them settle for sleep. Look for sleep cues like yawning or rubbing eyes.',
    'Uncomfortable': 'The baby might be uncomfortable. Check if their diaper needs changing, if they\'re too hot or cold, or if their clothing is bothering them.',
    'Pain': 'The baby may be in pain or discomfort. Check for signs of gas, colic, or other discomfort. If crying persists, consult your pediatrician.',
    'Needs Attention': 'The baby wants your attention and comfort. Hold them close, talk or sing to them softly, or gently rock them.',
  };
  
  // Find matching recommendation (case-insensitive partial match)
  for (const [key, recommendation] of Object.entries(recommendations)) {
    if (label.toLowerCase().includes(key.toLowerCase())) {
      return recommendation;
    }
  }
  
  return `The baby is showing signs of being ${label}. Respond with comfort and care.`;
}

/**
 * Get audio file metadata
 * @param file Audio file object
 * @returns Formatted file information
 */
export function getAudioFileInfo(file: AudioFile) {
  const sizeInKB = file.size ? (file.size / 1024).toFixed(0) : 'Unknown';
  const extension = file.name?.split('.').pop()?.toUpperCase() || 'AUDIO';
  
  return {
    name: file.name || 'Unknown file',
    size: `${sizeInKB}kb`,
    type: extension,
  };
}
