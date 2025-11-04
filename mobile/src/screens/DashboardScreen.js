import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../stores/authStore'
import * as Location from 'expo-location'

export default function DashboardScreen() {
  const { employee, schedule } = useAuthStore()
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    requestLocationPermission()
  }, [])

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status === 'granted') {
      setIsTracking(true)
      getCurrentLocation()
    }
  }

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({})
      setCurrentLocation(location)
    } catch (error) {
      console.error('Error getting location:', error)
    }
  }

  const getCurrentShift = () => {
    if (!schedule) return null
    
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const todaySchedule = schedule.daysOfWeek?.find(day => 
      day.toLowerCase() === currentDay
    )
    
    if (!todaySchedule) return null
    
    const [startHour, startMin] = schedule.startTime.split(':').map(Number)
    const [endHour, endMin] = schedule.endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    return { startMinutes, endMinutes, currentTime }
  }

  const shift = getCurrentShift()
  const isWorkingTime = shift && shift.currentTime >= shift.startMinutes && shift.currentTime <= shift.endMinutes

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {employee?.name?.charAt(0).toUpperCase() || 'E'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{employee?.name || 'Employee'}</Text>
            <Text style={styles.role}>{employee?.role || 'Role'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons 
              name={isTracking ? "location" : "location-outline"} 
              size={24} 
              color="#fff" 
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color="#667eea" />
            <Text style={styles.cardTitle}>Current Status</Text>
          </View>
          <View style={styles.statusContainer}>
            {isWorkingTime ? (
              <>
                <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                <Text style={styles.statusText}>On Duty</Text>
                <Text style={styles.statusSubtext}>
                  {schedule?.startTime} - {schedule?.endTime}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="close-circle" size={48} color="#ef4444" />
                <Text style={styles.statusText}>Off Duty</Text>
                <Text style={styles.statusSubtext}>Outside working hours</Text>
              </>
            )}
          </View>
        </View>

        {/* Location Card */}
        {currentLocation && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="map-outline" size={24} color="#667eea" />
              <Text style={styles.cardTitle}>Current Location</Text>
            </View>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>
                Lat: {currentLocation.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                Lng: {currentLocation.coords.longitude.toFixed(6)}
              </Text>
              <Text style={styles.locationSubtext}>
                Accuracy: ±{Math.round(currentLocation.coords.accuracy)}m
              </Text>
            </View>
          </View>
        )}

        {/* Quick Info */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem}>
            <View style={styles.gridIcon}>
              <Ionicons name="calendar-outline" size={32} color="#667eea" />
            </View>
            <Text style={styles.gridLabel}>Schedule</Text>
            <Text style={styles.gridValue}>
              {schedule?.daysOfWeek?.length || 0} days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <View style={styles.gridIcon}>
              <Ionicons name="wallet-outline" size={32} color="#10b981" />
            </View>
            <Text style={styles.gridLabel}>This Month</Text>
            <Text style={styles.gridValue}>$---</Text>
          </TouchableOpacity>
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
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  role: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  statusBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
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
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  statusContainer: {
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  locationContainer: {
    padding: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  locationSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gridIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  gridValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
})

