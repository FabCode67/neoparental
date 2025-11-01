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
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userEmail, setUserEmail] = useState('john.doe@example.com');
  const [userName, setUserName] = useState('John Doe');

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

  const handleListeningPress = () => {
    router.push('/listening');
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
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
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
          <Text style={styles.welcomeName}>{userName}</Text>
          <Text style={styles.welcomeSubtext}>
            Welcome to NeoParental
          </Text>
          <Text style={styles.welcomeSubtext2}>
            Your parenting companion
          </Text>
        </View>
        <View style={styles.familyImageContainer}>
          <View style={styles.familyIconWrapper}>
            <Ionicons name="people" size={50} color="#FF6B35" />
          </View>
        </View>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statisticsContainer}>
          <View style={styles.statisticsCard}>
            <View style={[styles.statisticsIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="calendar-outline" size={32} color="#2196F3" />
            </View>
            <Text style={styles.statisticsNumber}>4</Text>
            <Text style={styles.statisticsLabel}>This Week</Text>
          </View>
          <View style={styles.statisticsCard}>
            <View style={[styles.statisticsIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="trending-up" size={32} color="#4CAF50" />
            </View>
            <Text style={styles.statisticsNumber}>78%</Text>
            <Text style={styles.statisticsLabel}>Avg{"\n"}Confidence</Text>
          </View>
          <View style={styles.statisticsCard}>
            <View style={[styles.statisticsIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="medical" size={32} color="#9C27B0" />
            </View>
            <Text style={styles.statisticsNumber}>Pain</Text>
            <Text style={styles.statisticsLabel}>Most Common</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={handleListeningPress}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFE0B2' }]}>
              <Ionicons name="mic" size={32} color="#FF6B35" />
            </View>
            <Text style={styles.quickActionTitle}>Audio Listening</Text>
            <Text style={styles.quickActionDescription}>Analyze baby crying</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/history')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="time" size={32} color="#2196F3" />
            </View>
            <Text style={styles.quickActionTitle}>History</Text>
            <Text style={styles.quickActionDescription}>View past results</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Parenting Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parenting Skills</Text>
        <TouchableOpacity style={styles.parentingCard}>
          <View style={styles.parentingImagePlaceholder}>
            <Ionicons name="restaurant" size={60} color="#FF6B35" />
          </View>
          <View style={styles.parentingOverlay}>
            <Text style={styles.parentingTitle}>Feeding Techniques</Text>
            <Text style={styles.parentingDescription}>
              Master proper feeding techniques for both{"\n"}breastfeeding and bottle feeding.
            </Text>
            <TouchableOpacity style={styles.readMoreContainer}>
              <Text style={styles.readMoreLink}>Read more</Text>
              <Ionicons name="chevron-down" size={16} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  welcomeBanner: {
    backgroundColor: '#FF6B35',
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
    fontSize: 18,
    fontWeight: '400',
    color: '#fff',
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginTop: 8,
  },
  welcomeSubtext2: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '400',
    marginTop: 2,
  },
  familyImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  familyIconWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  statisticsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statisticsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
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
  statisticsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statisticsNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statisticsLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  parentingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  parentingImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  parentingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  parentingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  parentingDescription: {
    fontSize: 13,
    color: '#fff',
    lineHeight: 19,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readMoreLink: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
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
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 80,
  },
});
