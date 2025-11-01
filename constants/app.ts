/**
 * Application constants including colors, spacing, and configuration
 */

export const Colors = {
  primary: '#FF5722',
  secondary: '#8D6E63',
  background: '#FFFFFF',
  cardBackground: '#D7CCC8',
  darkBrown: '#5D4037',
  lightOrange: '#FFE0B2',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#666666',
  lightGray: '#E0E0E0',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const API = {
  baseUrl: 'https://neoparental-fast-api.onrender.com',
  endpoints: {
    predict: '/predict',
    health: '/health',
  },
};

export const AudioConfig = {
  recordingOptions: {
    android: {
      extension: '.m4a',
      outputFormat: 2, // MPEG_4
      audioEncoder: 3, // AAC
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: 'mpeg4aac',
      audioQuality: 127,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  },
};

export const Messages = {
  errors: {
    audioPermission: 'Audio recording permission is required to record baby sounds.',
    filePermission: 'File access permission is required to select audio files.',
    uploadFailed: 'Failed to upload audio file. Please try again.',
    recordingFailed: 'Failed to record audio. Please check your microphone.',
    networkError: 'Network error. Please check your connection.',
    apiError: 'Server error. Please try again later.',
  },
  success: {
    uploadComplete: 'Audio uploaded successfully!',
    recordingComplete: 'Recording completed successfully!',
  },
};
