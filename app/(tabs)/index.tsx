import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getUserInfo, clearAuthData } from '@/utils/auth';

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const { token, email } = await getUserInfo();
      
      if (token) {
        setIsLoggedIn(true);
        if (email) {
          setUserEmail(email);
          // Extract name from email (before @)
          const name = email.split('@')[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAuthData();
              setIsLoggedIn(false);
              setUserName('Guest');
              setUserEmail('');
              
              // Navigate to login screen
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleProfilePress = () => {
    if (isLoggedIn) {
      // Show user menu
      Alert.alert(
        'Account',
        `Signed in as:\n${userEmail}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: handleLogout },
        ]
      );
    } else {
      // Navigate to login
      router.push('/login');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NeoParental</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
            {isLoggedIn && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleProfilePress}
          >
            <Ionicons 
              name={isLoggedIn ? "person-circle" : "person-circle-outline"} 
              size={24} 
              color={isLoggedIn ? "#FF5722" : "#000"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>{getGreeting()},</Text>
          <Text style={styles.welcomeName}>{userName}!</Text>
          <Text style={styles.welcomeSubtext}>
            {isLoggedIn 
              ? 'Your predictions are being saved securely.' 
              : 'Sign in to save and track your predictions.'}
          </Text>
          {!isLoggedIn && (
            <TouchableOpacity 
              style={styles.loginPromptButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginPromptText}>Sign In Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#FF5722" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.familyImageContainer}>
          <Ionicons name="people" size={60} color="#fff" />
        </View>
      </View>

      {/* Status Cards */}
      {isLoggedIn && (
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Account Status</Text>
              <Text style={styles.statusValue}>Active</Text>
            </View>
          </View>
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>
              <Ionicons name="calendar" size={24} color="#2196F3" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Member Since</Text>
              <Text style={styles.statusValue}>2025</Text>
            </View>
          </View>
        </View>
      )}

      {/* Category Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryContainer}>
          <TouchableOpacity style={styles.categoryCard}>
            <View style={[styles.categoryCircle, { backgroundColor: '#FF5722' }]}>
              <Ionicons name="medical" size={28} color="#fff" />
            </View>
            <Text style={styles.categoryText}>CHW</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <View style={[styles.categoryCircle, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="fitness" size={28} color="#fff" />
            </View>
            <Text style={styles.categoryText}>Pediatrician</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <View style={[styles.categoryCircle, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="heart" size={28} color="#fff" />
            </View>
            <Text style={styles.categoryText}>Family</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Track */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.trackContainer}>
          <TouchableOpacity 
            style={[styles.trackCard, { backgroundColor: '#FF5722' }]}
            onPress={() => {
              if (isLoggedIn) {
                router.push('/listening');
              } else {
                Alert.alert('Sign In Required', 'Please sign in to record audio.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign In', onPress: () => router.push('/login') },
                ]);
              }
            }}
          >
            <View style={styles.trackIconContainer}>
              <Ionicons name="mic" size={32} color="#fff" />
            </View>
            <Text style={styles.trackNumber}>5</Text>
            <Text style={styles.trackLabel}>Recorded{'\n'}Audios</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" style={styles.trackArrow} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.trackCard, { backgroundColor: '#2196F3' }]}
            onPress={() => {
              if (!isLoggedIn) {
                Alert.alert('Sign In Required', 'Please sign in to upload audio.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign In', onPress: () => router.push('/login') },
                ]);
              }
            }}
          >
            <View style={styles.trackIconContainer}>
              <Ionicons name="cloud-upload" size={32} color="#fff" />
            </View>
            <Text style={styles.trackNumber}>3</Text>
            <Text style={styles.trackLabel}>Uploaded{'\n'}Audios</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" style={styles.trackArrow} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.trackCard, { backgroundColor: '#4CAF50' }]}
            onPress={() => {
              if (isLoggedIn) {
                router.push('/history');
              } else {
                Alert.alert('Sign In Required', 'Please sign in to view feedback.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign In', onPress: () => router.push('/login') },
                ]);
              }
            }}
          >
            <View style={styles.trackIconContainer}>
              <Ionicons name="chatbox-ellipses" size={32} color="#fff" />
            </View>
            <Text style={styles.trackNumber}>7</Text>
            <Text style={styles.trackLabel}>Feedback{'\n'}Received</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" style={styles.trackArrow} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Blog */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Tips</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.blogCard}>
          <View style={styles.blogImageContainer}>
            <Ionicons name="newspaper" size={40} color="#FF5722" />
          </View>
          <View style={styles.blogContent}>
            <Text style={styles.blogCategory}>Child Health</Text>
            <Text style={styles.blogTitle}>Understanding Baby Cries</Text>
            <Text style={styles.blogText} numberOfLines={3}>
              Learn to identify different types of baby cries and what they mean. 
              From hunger to discomfort, understanding these signals helps you 
              respond better to your baby's needs.
            </Text>
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read More</Text>
              <Ionicons name="arrow-forward" size={14} color="#FF5722" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
  },
  welcomeBanner: {
    backgroundColor: '#FF5722',
    borderRadius: 20,
    margin: 20,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF5722',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  welcomeContent: {
    flex: 1,
    paddingRight: 15,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 4,
  },
  welcomeSubtext: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 18,
    marginTop: 4,
  },
  loginPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 15,
    alignSelf: 'flex-start',
    gap: 8,
  },
  loginPromptText: {
    color: '#FF5722',
    fontWeight: '700',
    fontSize: 14,
  },
  familyImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 10,
  },
  statusCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  categoryCard: {
    alignItems: 'center',
    gap: 10,
  },
  categoryCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  trackContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  trackCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    minHeight: 140,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  trackIconContainer: {
    marginBottom: 8,
  },
  trackNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  trackLabel: {
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '600',
  },
  trackArrow: {
    marginTop: 8,
    opacity: 0.8,
  },
  blogCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  blogImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogContent: {
    flex: 1,
  },
  blogCategory: {
    fontSize: 11,
    color: '#FF5722',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  blogText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#666',
    marginBottom: 12,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readMoreText: {
    fontSize: 13,
    color: '#FF5722',
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 30,
  },
});
