/**
 * Environment Configuration Validator
 * Run this to verify your .env setup is correct
 */

import Constants from 'expo-constants';

export interface EnvConfig {
  laptopIp: string;
  backendUrl: string;
  predictionApiUrl: string;
  apiTimeout: number;
  isValid: boolean;
  warnings: string[];
}

/**
 * Get and validate environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const warnings: string[] = [];
  
  const laptopIp = Constants.expoConfig?.extra?.EXPO_PUBLIC_LAPTOP_IP || 
                   process.env.EXPO_PUBLIC_LAPTOP_IP || 
                   '';
  
  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 
                     process.env.EXPO_PUBLIC_BACKEND_URL || 
                     '';
  
  const predictionApiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_PREDICTION_API_URL || 
                           process.env.EXPO_PUBLIC_PREDICTION_API_URL || 
                           '';
  
  const apiTimeout = parseInt(
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_TIMEOUT || 
    process.env.EXPO_PUBLIC_API_TIMEOUT || 
    '10000'
  );

  // Validate Laptop IP
  if (!laptopIp || laptopIp === '192.168.1.100') {
    warnings.push('⚠️ LAPTOP_IP is using default value. Update it with your actual IP address!');
  }
  
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (laptopIp && !ipRegex.test(laptopIp)) {
    warnings.push('⚠️ LAPTOP_IP format looks incorrect. Should be like: 192.168.1.100');
  }

  // Validate Backend URL
  if (!backendUrl) {
    warnings.push('⚠️ BACKEND_URL is not set!');
  }

  // Validate Prediction API URL
  if (!predictionApiUrl) {
    warnings.push('⚠️ PREDICTION_API_URL is not set!');
  }

  // Validate API Timeout
  if (isNaN(apiTimeout) || apiTimeout < 1000) {
    warnings.push('⚠️ API_TIMEOUT should be at least 1000ms (1 second)');
  }

  const isValid = warnings.length === 0;

  return {
    laptopIp,
    backendUrl,
    predictionApiUrl,
    apiTimeout,
    isValid,
    warnings,
  };
}

/**
 * Log environment configuration to console
 */
export function logEnvConfig(): void {
  console.log('\n🔧 Environment Configuration Check\n');
  console.log('═'.repeat(50));
  
  const config = getEnvConfig();
  
  console.log('\n📋 Current Settings:');
  console.log(`   Laptop IP: ${config.laptopIp || '❌ NOT SET'}`);
  console.log(`   Backend URL: ${config.backendUrl || '❌ NOT SET'}`);
  console.log(`   Prediction API: ${config.predictionApiUrl || '❌ NOT SET'}`);
  console.log(`   API Timeout: ${config.apiTimeout}ms`);
  
  if (config.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    config.warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (config.isValid) {
    console.log('\n✅ Environment configuration looks good!\n');
  } else {
    console.log('\n❌ Please fix the warnings above.');
    console.log('   Edit your .env file and restart Expo.\n');
  }
  
  console.log('═'.repeat(50));
  console.log('\n💡 To update configuration:');
  console.log('   1. Edit .env file in project root');
  console.log('   2. Update EXPO_PUBLIC_LAPTOP_IP with your IP');
  console.log('   3. Restart: npm start');
  console.log('\n');
}

/**
 * Get IP address instructions based on platform
 */
export function getIpInstructions(): string {
  const platform = process.platform;
  
  if (platform === 'win32') {
    return 'Windows: Open Command Prompt and run "ipconfig"';
  } else if (platform === 'darwin') {
    return 'macOS: Open Terminal and run "ifconfig | grep inet"';
  } else {
    return 'Linux: Open Terminal and run "ip addr show"';
  }
}

/**
 * Quick validation function (returns boolean)
 */
export function validateEnv(): boolean {
  const config = getEnvConfig();
  return config.isValid;
}

export default {
  getEnvConfig,
  logEnvConfig,
  getIpInstructions,
  validateEnv,
};
