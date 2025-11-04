import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../stores/authStore'

export default function ProfileScreen({ navigation }) {
  const { employee, logout } = useAuthStore()

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    )
  }

  const menuItems = [
    {
      id: 1,
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => {},
    },
    {
      id: 2,
      title: 'Change Password',
      icon: 'lock-closed-outline',
      onPress: () => {},
    },
    {
      id: 3,
      title: 'Notification Settings',
      icon: 'notifications-outline',
      onPress: () => {},
    },
    {
      id: 4,
      title: 'Privacy Policy',
      icon: 'shield-checkmark-outline',
      onPress: () => {},
    },
    {
      id: 5,
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => {},
    },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employee?.name?.charAt(0).toUpperCase() || 'E'}
          </Text>
        </View>
        <Text style={styles.name}>{employee?.name || 'Employee'}</Text>
        <Text style={styles.role}>{employee?.role || 'Role'}</Text>
        <Text style={styles.id}>ID: {employee?.id || '---'}</Text>
      </View>

      <View style={styles.content}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={24} color="#667eea" />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  id: {
    fontSize: 14,
    color: '#999',
  },
  content: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginLeft: 10,
  },
})

