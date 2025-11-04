import 'react-native-gesture-handler'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Provider as PaperProvider } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'

import LoginScreen from './src/screens/LoginScreen'
import CodeEntryScreen from './src/screens/CodeEntryScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import PayrollScreen from './src/screens/PayrollScreen'
import ScheduleScreen from './src/screens/ScheduleScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import RequestCodeScreen from './src/screens/RequestCodeScreen'
import AlertsScreen from './src/screens/AlertsScreen'
import { useAuthStore } from './src/stores/authStore'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

// Background location task name
const LOCATION_TASK_NAME = 'background-location-task'

// Configure background task
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error)
    return
  }
  if (data) {
    const { locations } = data
    console.log('Received new locations', locations)
    // Send location to server
  }
})

const MainTabs = () => {
  const { employee } = useAuthStore()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Payroll') {
            iconName = focused ? 'wallet' : 'wallet-outline'
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline'
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'notifications' : 'notifications-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#3b82f6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ 
          title: 'Home',
          headerRight: () => employee && (
            <StatusBadge status={employee.status} />
          )
        }}
      />
      <Tab.Screen name="Payroll" component={PayrollScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen 
        name="Alerts" 
        component={AlertsScreen} 
        options={{
          tabBarBadge: null, // You can add badge count here
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

const App = () => {
  const { isAuthenticated, hasCode } = useAuthStore()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    // Request notification permissions on app start
    Notifications.requestPermissionsAsync()

    // Set up notification listeners
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
      // Handle emergency alerts with sound
      if (notification.request.content.data?.type === 'emergency') {
        // Play emergency sound
      }
    })

    setInitializing(false)

    return () => subscription.remove()
  }, [])

  if (initializing) {
    return null
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : !hasCode ? (
              <Stack.Screen name="CodeEntry" component={CodeEntryScreen} />
            ) : (
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen 
                  name="RequestCode" 
                  component={RequestCodeScreen}
                  options={{ 
                    presentation: 'modal',
                    headerShown: true,
                    title: 'Request Code'
                  }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  )
}

const StatusBadge = ({ status }) => {
  const color = status === 'Inside' ? '#10b981' : '#ef4444'
  const icon = status === 'Inside' ? 'checkmark-circle' : 'close-circle'
  
  return (
    <View style={{ marginRight: 15 }}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
  )
}

export default App

