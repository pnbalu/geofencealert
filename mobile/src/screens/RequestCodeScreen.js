import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../stores/authStore'

export default function RequestCodeScreen({ navigation }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const requestCodeFromAdmin = useAuthStore(state => state.requestCodeFromAdmin)

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message')
      return
    }

    setLoading(true)
    const success = await requestCodeFromAdmin(message)
    setLoading(false)

    if (success) {
      Alert.alert(
        'Success',
        'Your request has been sent to the administrator. You will receive your code soon.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    } else {
      Alert.alert('Error', 'Failed to send request. Please try again.')
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={80} color="#667eea" />
        </View>
        
        <Text style={styles.title}>Request Access Code</Text>
        <Text style={styles.subtitle}>
          Send a request to your administrator to receive your employee access code
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Message to Administrator</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter your message..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Request'}
            </Text>
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
  content: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

