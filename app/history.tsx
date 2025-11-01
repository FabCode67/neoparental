import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HistoryItem {
  id: string;
  fileName: string;
  output: string;
  date: string;
  duration: string;
}

const mockHistory: HistoryItem[] = [
  { id: '1', fileName: 'Audio_001.mp3', output: 'Hungry', date: '01-01-2025', duration: '00:07' },
  { id: '2', fileName: 'Audio_001.mp3', output: 'Tired', date: '02-01-2025', duration: '00:07' },
  { id: '3', fileName: 'Audio_001.mp3', output: 'Hungry', date: '04-01-2025', duration: '00:07' },
  { id: '4', fileName: 'Audio_001.mp3', output: 'Hungry', date: '06-01-2025', duration: '00:07' },
  { id: '5', fileName: 'Audio_004.mp3', output: 'Hungry', date: '08-01-2025', duration: '00:07' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'recorded' | 'uploaded'>('recorded');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>All sound recorderd and uploaded</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'recorded' && styles.filterButtonActive]}
          onPress={() => setFilter('recorded')}
        >
          <Text style={[styles.filterText, filter === 'recorded' && styles.filterTextActive]}>
            Recorded
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterIconButton}>
          <Ionicons name="download-outline" size={20} color="#5D4037" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.historyList}>
        {mockHistory.map((item, index) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.itemContent}>
              <Ionicons name="play-circle" size={32} color="#5D4037" />
              <View style={styles.itemDivider} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemFileName}>{item.fileName}</Text>
                <Text style={styles.itemOutput}>
                  Output: <Text style={styles.itemOutputValue}>{item.output}</Text>
                </Text>
                <Text style={styles.itemDate}>Date: {item.date}</Text>
              </View>
              <Text style={styles.itemDuration}>{item.duration}</Text>
            </View>
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>View more</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8D6E63',
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
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FF5722',
  },
  filterText: {
    fontSize: 14,
    color: '#5D4037',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterIconButton: {
    backgroundColor: '#FFE0B2',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  historyItem: {
    backgroundColor: '#FFE0B2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#5D4037',
    marginHorizontal: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemFileName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemOutput: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemOutputValue: {
    fontWeight: 'normal',
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
  },
  itemDuration: {
    fontSize: 12,
    color: '#666',
  },
  viewMoreButton: {
    backgroundColor: '#5D4037',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  viewMoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
