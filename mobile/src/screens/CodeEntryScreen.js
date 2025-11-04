import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../stores/authStore'

export default function CodeEntryScreen({ navigation }) {
  const [code, setCodeValue] = useState('')
  const [loading, setLoading] = useState(false)
  const setCode = useAuthStore(state => state.setCode)

  const handleSubmit = async () => {
    if (!code || code.length < 6) {
      Alert.alert('Error', 'Please enter a valid code')
      return
    }

    setLoading(true)
    const success = await setCode(code)
    setLoading(false)

    if (!success) {
      Alert.alert('Error', 'Invalid code. Please contact your administrator.')
    }
  }

  const handleRequestCode = () => {
    navigation.navigate('RequestCode')
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="qr-code" size={80} color="#fff" />
          </View>
          
          <Text style={styles.title}>Enter Your Code</Text>
          <Text style={styles.subtitle}>
            Get your access code from your administrator
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="keypad" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                value={code}
                onChangeText={setCodeValue}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestCode}
            >
              <Text style={styles.requestButtonText}>
                Request Code from Admin
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#fff',
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
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  requestButton: {
    marginTop: 15,
    padding: 10,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
})

