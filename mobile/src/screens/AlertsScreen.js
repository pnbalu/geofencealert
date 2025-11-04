import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function AlertsScreen() {
  // Mock alerts data
  const alerts = [
    {
      id: 1,
      type: 'emergency',
      title: 'Emergency Alert',
      message: 'Please evacuate immediately',
      time: new Date().toISOString(),
    },
    {
      id: 2,
      type: 'info',
      title: 'Schedule Update',
      message: 'Your schedule has been updated',
      time: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3,
      type: 'info',
      title: 'Salary Credited',
      message: 'Your salary for January has been credited',
      time: new Date(Date.now() - 86400000).toISOString(),
    },
  ]

  const getAlertIcon = (type) => {
    switch (type) {
      case 'emergency':
        return { name: 'alert-circle', color: '#ef4444' }
      case 'info':
        return { name: 'information-circle', color: '#3b82f6' }
      default:
        return { name: 'notifications', color: '#666' }
    }
  }

  const formatTime = (timeString) => {
    const date = new Date(timeString)
    const now = new Date()
    const diff = now - date
    
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No alerts</Text>
          </View>
        ) : (
          alerts.map((alert) => {
            const icon = getAlertIcon(alert.type)
            return (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                    <Ionicons name={icon.name} size={24} color={icon.color} />
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertTime}>{formatTime(alert.time)}</Text>
                  </View>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
            )
          })
        )}
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
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  alertCard: {
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
  alertHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
})

