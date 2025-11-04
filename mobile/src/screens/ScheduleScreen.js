import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../stores/authStore'

export default function ScheduleScreen() {
  const { schedule } = useAuthStore()

  if (!schedule) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No schedule assigned</Text>
      </View>
    )
  }

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const scheduleDays = schedule.daysOfWeek || []

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color="#667eea" />
            <Text style={styles.cardTitle}>Work Schedule</Text>
          </View>

          <View style={styles.scheduleRow}>
            <Text style={styles.label}>Start Time</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{schedule.startTime}</Text>
            </View>
          </View>

          <View style={styles.scheduleRow}>
            <Text style={styles.label}>End Time</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{schedule.endTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={24} color="#667eea" />
            <Text style={styles.cardTitle}>Working Days</Text>
          </View>

          <View style={styles.daysGrid}>
            {daysOfWeek.map((day) => {
              const isActive = scheduleDays.some(d => 
                d.toLowerCase().includes(day.toLowerCase())
              )
              return (
                <View
                  key={day}
                  style={[
                    styles.dayItem,
                    isActive && styles.dayItemActive
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    isActive && styles.dayTextActive
                  ]}>
                    {day}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  timeContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayItem: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayItemActive: {
    backgroundColor: '#667eea',
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
  },
  dayTextActive: {
    color: '#fff',
  },
})

