/**
 * API utility functions for NeoParental app
 * Handles communication with the prediction API and backend
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './api-config';

// Get API URLs from configuration
const PREDICTION_API_URL = API_CONFIG.PREDICTION_API_URL;
const BACKEND_API_URL = API_CONFIG.BASE_URL;

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
 * Determine if file is WAV format
 */
function isWavFormat(file: AudioFile): boolean {
  const fileName = file.name || '';
  const mimeType = file.mimeType || file.type || '';
  
  return (
    fileName.toLowerCase().endsWith('.wav') ||
    mimeType === 'audio/wav' ||
    mimeType === 'audio/wave' ||
    mimeType === 'audio/vnd.wave'
  );
}

/**
 * Get file extension from filename or MIME type
 */
function getFileExtension(file: AudioFile): string {
  if (file.name) {
    const parts = file.name.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
  }
  
  const mimeType = file.mimeType || file.type || '';
  if (mimeType.includes('m4a')) return 'm4a';
  if (mimeType.includes('mp3')) return 'mp3';
  if (mimeType.includes('wav') || mimeType.includes('wave')) return 'wav';
  
  return 'unknown';
}

/**
 * Upload using XMLHttpRequest for better React Native compatibility
 */
function uploadWithXHR(
  url: string,
  formData: FormData,
  timeoutMs: number
): Promise<{ status: number; responseText: string; headers: any }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Set timeout
    xhr.timeout = timeoutMs;
    
    xhr.onload = () => {
      console.log(`📡 XHR Response status: ${xhr.status}`);
      resolve({
        status: xhr.status,
        responseText: xhr.responseText,
        headers: xhr.getAllResponseHeaders(),
      });
    };
    
    xhr.onerror = () => {
      console.error('❌ XHR Network error');
      reject(new Error('Network request failed'));
    };
    
    xhr.ontimeout = () => {
      console.error(`❌ XHR Timeout after ${timeoutMs / 1000}s`);
      reject(new Error(`Upload timed out after ${timeoutMs / 1000} seconds`));
    };
    
    // Track upload progress
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`📤 Upload progress: ${percentComplete.toFixed(1)}%`);
        }
      };
    }
    
    xhr.open('POST', url);
    
    // Don't set Content-Type - let FormData set it with boundary
    console.log('🚀 Starting XHR upload...');
    xhr.send(formData);
  });
}

/**
 * Upload an audio file to the prediction API
 * @param file Audio file object with uri, name, and type
 * @returns Promise with prediction response
 */
export async function uploadAudioForPrediction(
  file: AudioFile
): Promise<PredictionResponse> {
  console.log('\n🎯 === STARTING UPLOAD TO PREDICTION API ===');
  console.log('File details:', {
    uri: file.uri,
    name: file.name,
    mimeType: file.mimeType,
    size: file.size
  });

  try {
    // Check file format
    const extension = getFileExtension(file);
    const isWav = isWavFormat(file);
    
    console.log(`📁 File format detected: ${extension.toUpperCase()}`);
    
    if (!isWav) {
      console.warn('⚠️  WARNING: Non-WAV format detected!');
      console.warn('    ML API might only support WAV files');
    }

    // Determine file name and mime type
    const fileName = file.name || `audio_${Date.now()}.${extension}`;
    let mimeType = file.mimeType || file.type || '';
    
    // Fix MIME type based on extension if needed
    if (!mimeType || mimeType === 'application/octet-stream') {
      switch (extension) {
        case 'm4a':
          mimeType = 'audio/m4a';
          break;
        case 'mp3':
          mimeType = 'audio/mpeg';
          break;
        case 'wav':
          mimeType = 'audio/wav';
          break;
        default:
          mimeType = 'audio/wav';
      }
      console.log(`🔧 Fixed MIME type to: ${mimeType}`);
    }

    console.log('📦 Preparing upload:', { 
      fileName, 
      mimeType,
      platform: Platform.OS
    });

    // Validate file size (max 10MB)
    if (file.size && file.size > 10 * 1024 * 1024) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 10MB.`);
    }

    // Create FormData with platform-specific handling
    const formData = new FormData();
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // React Native expects this format
      console.log('📱 Using React Native FormData format');
      // @ts-ignore - React Native FormData typing
      formData.append('file', {
        uri: file.uri,
        name: fileName,
        type: mimeType,
      });
    } else {
      // Web expects blob
      console.log('🌐 Using Web FormData format');
      const fileResponse = await fetch(file.uri);
      const blob = await fileResponse.blob();
      formData.append('file', blob, fileName);
    }

    const url = `${PREDICTION_API_URL}/predict`;
    console.log('🚀 Uploading to ML API...');
    console.log(`   URL: ${url}`);
    console.log(`   File: ${fileName}`);
    
    // Use longer timeout for mobile (120 seconds)
    const timeoutMs = Platform.OS === 'web' ? 30000 : 120000;
    console.log(`⏱️  Timeout: ${timeoutMs / 1000}s`);

    // Use XMLHttpRequest for React Native for better reliability
    const xhrResult = await uploadWithXHR(url, formData, timeoutMs);

    console.log('📡 Response received:', {
      status: xhrResult.status,
      bodyLength: xhrResult.responseText.length
    });

    // Handle error responses
    if (xhrResult.status < 200 || xhrResult.status >= 300) {
      let errorMessage = `API Error: ${xhrResult.status}`;
      let errorDetail = '';
      
      try {
        const errorData = JSON.parse(xhrResult.responseText);
        errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
        console.error('❌ Error response (JSON):', errorData);
      } catch {
        errorDetail = xhrResult.responseText;
        console.error('❌ Error response (text):', errorDetail);
      }

      // Provide helpful error messages
      if (xhrResult.status === 500) {
        errorMessage = '🔥 ML API Server Error (500)';
        console.error('\n' + '='.repeat(60));
        console.error('💥 SERVER ERROR DETECTED');
        console.error('='.repeat(60));
        console.error('The ML prediction API crashed.');
        console.error('\nError detail:', errorDetail || '(none)');
        console.error('='.repeat(60));
        
        if (!isWav) {
          errorMessage += '\n\n⚠️ Non-WAV file detected. Try using WAV format.';
        }
      } else if (xhrResult.status === 413) {
        errorMessage = 'File too large. Please use a shorter recording.';
      } else if (xhrResult.status === 422) {
        errorMessage = 'Invalid file format. Please use a valid audio file.';
      } else if (xhrResult.status === 503) {
        errorMessage = 'ML API temporarily unavailable. Try again in a few minutes.';
      }

      throw new Error(`${errorMessage}${errorDetail ? `\nDetails: ${errorDetail}` : ''}`);
    }

    // Parse successful response
    const data = JSON.parse(xhrResult.responseText);
    console.log('✅ Prediction successful:', data);
    console.log('='.repeat(60) + '\n');
    
    return data;
  } catch (error) {
    console.error('\n❌ === UPLOAD FAILED ===');
    
    if (error instanceof Error) {
      console.error('   Error:', error.message);
    } else {
      console.error('   Unknown error:', error);
    }
    
    console.error('='.repeat(60) + '\n');
    throw error;
  }
}

/**
 * Save audio file and prediction result to backend database
 */
export async function saveAudioPredictionToBackend(
  file: AudioFile,
  predictionResult: PredictionResponse,
  audioDuration?: number
): Promise<SavedAudioPrediction> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    console.log('💾 Saving to backend database...');

    // Create FormData
    const formData = new FormData();
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // @ts-ignore
      formData.append('audio_file', {
        uri: file.uri,
        name: file.name || 'audio.m4a',
        type: file.mimeType || 'audio/m4a',
      });
    } else {
      const fileResponse = await fetch(file.uri);
      const blob = await fileResponse.blob();
      formData.append('audio_file', blob, file.name || 'audio.m4a');
    }
    
    formData.append('prediction_result', JSON.stringify(predictionResult));
    
    if (file.size) {
      formData.append('audio_size', file.size.toString());
    }
    
    if (audioDuration) {
      formData.append('audio_duration', audioDuration.toString());
    }

    const response = await fetch(`${BACKEND_API_URL}/audio-predictions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend save failed:', errorText);
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(`Failed to save: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Saved to backend successfully');
    return data;
  } catch (error) {
    console.error('❌ Error saving to backend:', error);
    throw error;
  }
}

/**
 * Upload audio, get prediction, and optionally save to backend
 */
export async function uploadAndSaveAudioPrediction(
  file: AudioFile,
  audioDuration?: number
): Promise<{ prediction: PredictionResponse; saved?: SavedAudioPrediction; savedToBackend: boolean }> {
  console.log('\n' + '='.repeat(70));
  console.log('🎵 STARTING AUDIO PREDICTION FLOW');
  console.log('='.repeat(70));
  
  try {
    // Step 1: Get prediction from ML API
    console.log('\n📍 STEP 1/2: Getting prediction from ML API...');
    const prediction = await uploadAudioForPrediction(file);
    console.log('✅ Step 1 complete - Prediction:', prediction.predicted_label || prediction.output);
    
    // Step 2: Try to save to backend
    let saved: SavedAudioPrediction | undefined;
    let savedToBackend = false;
    
    console.log('\n📍 STEP 2/2: Checking authentication for backend save...');
    const token = await getAuthToken();
    
    if (!token) {
      console.warn('⚠️  No auth token - skipping backend save');
      console.warn('   (User can still see prediction)');
    } else {
      try {
        console.log('🔐 Auth token found, saving to backend...');
        saved = await saveAudioPredictionToBackend(file, prediction, audioDuration);
        savedToBackend = true;
        console.log('✅ Step 2 complete - Saved to database');
      } catch (saveError) {
        console.error('❌ Step 2 failed:', saveError instanceof Error ? saveError.message : 'Unknown error');
        console.warn('   (Prediction still available)');
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ PREDICTION FLOW COMPLETE');
    console.log(`   Prediction: ${prediction.predicted_label || prediction.output}`);
    console.log(`   Saved to DB: ${savedToBackend ? 'Yes' : 'No'}`);
    console.log('='.repeat(70) + '\n');
    
    return { prediction, saved, savedToBackend };
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ PREDICTION FLOW FAILED');
    console.error('='.repeat(70));
    console.error(error);
    console.error('='.repeat(70) + '\n');
    throw error;
  }
}

/**
 * Get user's audio prediction history from backend
 */
export async function getAudioPredictionHistory(
  skip: number = 0,
  limit: number = 20
): Promise<SavedAudioPrediction[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await fetch(
      `${BACKEND_API_URL}/audio-predictions/?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Session expired. Please log in again.');
      }
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
 */
export async function getPredictionStats(): Promise<{
  total_predictions: number;
  predictions_by_label: Array<{ label: string; count: number }>;
  average_confidence: number;
}> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await fetch(`${BACKEND_API_URL}/audio-predictions/stats/summary/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Session expired. Please log in again.');
      }
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
 */
export async function deleteAudioPrediction(predictionId: string): Promise<void> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await fetch(`${BACKEND_API_URL}/audio-predictions/${predictionId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(`Failed to delete prediction: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting prediction:', error);
    throw error;
  }
}

/**
 * Check if the API is reachable
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
 */
export function formatPredictionResponse(
  response: PredictionResponse
): PredictionResponse {
  if (response.predicted_label) {
    return {
      predicted_label: response.predicted_label,
      confidence: response.confidence,
      prediction_value: response.prediction_value,
      processing_time: response.processing_time,
      timestamp: response.timestamp,
      output: response.predicted_label,
      level: getConfidenceLevel(response.confidence || 0),
      recommendation: getRecommendation(response.predicted_label),
    };
  }
  
  return {
    output: response.output || response.prediction || 'Unknown',
    prediction: response.prediction || response.output || 'Unknown',
    level: response.level || 'Medium',
    recommendation: response.recommendation || 'No recommendation available.',
  };
}

function getConfidenceLevel(confidence: number): string {
  if (confidence >= 80) return 'High';
  if (confidence >= 50) return 'Medium';
  return 'Low';
}

function getRecommendation(label?: string): string {
  if (!label) return 'No recommendation available.';
  
  const recommendations: Record<string, string> = {
    'Hungry': 'The baby appears to be hungry. Try feeding them milk or formula.',
    'Tired/Sleepy': 'The baby seems tired and needs rest. Create a calm environment.',
    'Uncomfortable': 'Check diaper, temperature, or clothing comfort.',
    'Pain': 'The baby may be in pain. Check for gas or colic. Consult pediatrician if persists.',
    'Needs Attention': 'The baby wants comfort. Hold them close and speak softly.',
  };
  
  for (const [key, recommendation] of Object.entries(recommendations)) {
    if (label.toLowerCase().includes(key.toLowerCase())) {
      return recommendation;
    }
  }
  
  return `The baby is showing signs of being ${label}. Respond with comfort and care.`;
}

export function getAudioFileInfo(file: AudioFile) {
  const sizeInKB = file.size ? (file.size / 1024).toFixed(0) : 'Unknown';
  const extension = file.name?.split('.').pop()?.toUpperCase() || 'AUDIO';
  
  return {
    name: file.name || 'Unknown file',
    size: `${sizeInKB}kb`,
    type: extension,
  };
}