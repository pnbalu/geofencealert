import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'

export default function PayrollScreen() {
  const { employee } = useAuthStore()
  const { currency } = useSettingsStore()
  
  // Mock payroll data
  const payrollData = [
    {
      id: 1,
      period: 'January 2024',
      baseSalary: 2500,
      overtime: 500,
      bonuses: 200,
      advances: 100,
      deductions: 50,
      netPay: 3050,
      status: 'paid',
      payDate: '2024-01-31',
    },
    {
      id: 2,
      period: 'December 2023',
      baseSalary: 2500,
      overtime: 300,
      bonuses: 100,
      advances: 0,
      deductions: 50,
      netPay: 2850,
      status: 'paid',
      payDate: '2023-12-31',
    },
  ]

  const getCurrencySymbol = () => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
    }
    return symbols[currency] || '$'
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>My Payroll</Text>
          <Text style={styles.headerSubtitle}>
            {getCurrencySymbol()} {payrollData.reduce((sum, p) => sum + p.netPay, 0).toLocaleString()} 
            {' '}this year
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employee?.name?.charAt(0).toUpperCase() || 'E'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryValue}>
              {getCurrencySymbol()}{payrollData[0]?.netPay?.toLocaleString() || '0'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Hours</Text>
            <Text style={styles.summaryValue}>---</Text>
          </View>
        </View>

        {/* Payroll History */}
        <Text style={styles.sectionTitle}>Payroll History</Text>
        {payrollData.map((item) => (
          <View key={item.id} style={styles.payrollCard}>
            <View style={styles.payrollHeader}>
              <View>
                <Text style={styles.payrollPeriod}>{item.period}</Text>
                <Text style={styles.payrollDate}>
                  Paid on {new Date(item.payDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                item.status === 'paid' && styles.statusBadgePaid
              ]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'paid' && styles.statusTextPaid
                ]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.payrollDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Base Salary</Text>
                <Text style={styles.detailValue}>
                  {getCurrencySymbol()}{item.baseSalary.toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Overtime</Text>
                <Text style={styles.detailValue}>
                  {getCurrencySymbol()}{item.overtime.toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bonuses</Text>
                <Text style={styles.detailValue}>
                  {getCurrencySymbol()}{item.bonuses.toLocaleString()}
                </Text>
              </View>
              {item.advances > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Advances</Text>
                  <Text style={[styles.detailValue, styles.detailDeduction]}>
                    -{getCurrencySymbol()}{item.advances.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Deductions</Text>
                <Text style={[styles.detailValue, styles.detailDeduction]}>
                  -{getCurrencySymbol()}{item.deductions.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.payrollTotal}>
              <Text style={styles.totalLabel}>Net Pay</Text>
              <Text style={styles.totalValue}>
                {getCurrencySymbol()}{item.netPay.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.button}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Download Payslip</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e5e5e5',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  payrollCard: {
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
  payrollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  payrollPeriod: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  payrollDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgePaid: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
  },
  statusTextPaid: {
    color: '#065f46',
  },
  payrollDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailDeduction: {
    color: '#ef4444',
  },
  payrollTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#e5e5e5',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
})

