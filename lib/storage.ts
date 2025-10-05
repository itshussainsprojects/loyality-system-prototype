// localStorage-based state management for the loyalty system
// All data persists across page reloads

import type { Customer, Transaction, LoyaltyCard, Campaign } from "./mock-data"
import type { Notification as LoyaltyNotification } from "./storage" // Import Notification type for clarity

export interface QRCode {
  id: string
  code: string
  type: "customer" | "campaign" | "card" | "event"
  name: string
  description?: string
  assignedTo?: string // customer ID if assigned
  cardId?: string // card design ID if linked to specific card
  stampsPerScan?: number // how many stamps this QR gives
  expiresAt?: string
  isActive: boolean
  createdAt: string
  scansCount: number
}

export interface Notification {
  id: string
  customerId: string
  title: string
  message: string
  type: "campaign" | "reward" | "system"
  read: boolean
  createdAt: string
}

const STORAGE_KEYS = {
  CUSTOMERS: "loyalty_customers",
  TRANSACTIONS: "loyalty_transactions",
  CARD_CONFIG: "loyalty_card_config",
  CAMPAIGNS: "loyalty_campaigns",
  CURRENT_USER: "loyalty_current_user",
  ADMIN_AUTH: "loyalty_admin_auth",
  MERCHANT_AUTH: "loyalty_merchant_auth",
  NOTIFICATIONS: "loyalty_notifications",
  QR_CODES: "loyalty_qr_codes", // Added QR codes storage key
}

// Initialize storage with default data if empty
export function initializeStorage() {
  if (typeof window === "undefined") return

  // Initialize customers if not exists
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    const defaultCustomers: Customer[] = [
      {
        id: "cust_001",
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        phone: "+1 (555) 123-4567",
        stamps: 8,
        totalStamps: 23,
        rewardsRedeemed: 2,
        joinedDate: "2024-01-15",
        lastVisit: "2025-01-03",
        qrCode: "QR_SARAH_001",
      },
      {
        id: "cust_002",
        name: "Michael Chen",
        email: "mchen@email.com",
        phone: "+1 (555) 234-5678",
        stamps: 5,
        totalStamps: 15,
        rewardsRedeemed: 1,
        joinedDate: "2024-02-20",
        lastVisit: "2025-01-04",
        qrCode: "QR_MICHAEL_002",
      },
    ]
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(defaultCustomers))
  }

  // Initialize transactions if not exists
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    const defaultTransactions: Transaction[] = []
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(defaultTransactions))
  }

  // Initialize card config if not exists
  if (!localStorage.getItem(STORAGE_KEYS.CARD_CONFIG)) {
    const defaultCard: LoyaltyCard = {
      id: "card_default",
      businessName: "Coffee Haven",
      backgroundColor: "#10b981",
      textColor: "#ffffff",
      stampsRequired: 10,
      rewardDescription: "Free Coffee",
      stampIcon: "☕",
    }
    localStorage.setItem(STORAGE_KEYS.CARD_CONFIG, JSON.stringify(defaultCard))
  }

  // Initialize campaigns if not exists
  if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)) {
    const defaultCampaigns: Campaign[] = []
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(defaultCampaigns))
  }

  // Initialize notifications if not exists
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    const defaultNotifications: LoyaltyNotification[] = []
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications))
  }

  if (!localStorage.getItem(STORAGE_KEYS.QR_CODES)) {
    const defaultQRCodes: QRCode[] = []
    localStorage.setItem(STORAGE_KEYS.QR_CODES, JSON.stringify(defaultQRCodes))
  }
}

// Customer operations
export function getCustomers(): Customer[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS)
  return data ? JSON.parse(data) : []
}

export function getCustomerById(id: string): Customer | null {
  const customers = getCustomers()
  return customers.find((c) => c.id === id) || null
}

export function getCustomerByQRCode(qrCode: string): Customer | null {
  const customers = getCustomers()
  return customers.find((c) => c.qrCode === qrCode) || null
}

export function getCustomerByContact(contact: string): Customer | null {
  const customers = getCustomers()
  return customers.find((c) => c.email === contact || c.phone === contact) || null
}

export function addCustomer(customer: Customer): void {
  const customers = getCustomers()
  customers.push(customer)
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers))
}

export function updateCustomer(id: string, updates: Partial<Customer>): void {
  const customers = getCustomers()
  const index = customers.findIndex((c) => c.id === id)
  if (index !== -1) {
    customers[index] = { ...customers[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers))
  }
}

// Transaction operations
export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
  return data ? JSON.parse(data) : []
}

export function getAllTransactions(): Transaction[] {
  return getTransactions()
}

export function getCustomerTransactions(customerId: string): Transaction[] {
  return getTransactions().filter((t) => t.customerId === customerId)
}

export function addTransaction(transaction: Transaction): void {
  const transactions = getTransactions()
  transactions.unshift(transaction) // Add to beginning
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
}

// Card config operations
export function getCardConfig(): LoyaltyCard {
  if (typeof window === "undefined") {
    return {
      id: "card_default",
      businessName: "Coffee Haven",
      backgroundColor: "#10b981",
      textColor: "#ffffff",
      stampsRequired: 10,
      rewardDescription: "Free Coffee",
      stampIcon: "☕",
    }
  }
  const data = localStorage.getItem(STORAGE_KEYS.CARD_CONFIG)
  return data
    ? JSON.parse(data)
    : {
        id: "card_default",
        businessName: "Coffee Haven",
        backgroundColor: "#10b981",
        textColor: "#ffffff",
        stampsRequired: 10,
        rewardDescription: "Free Coffee",
        stampIcon: "☕",
      }
}

export function updateCardConfig(config: LoyaltyCard): void {
  localStorage.setItem(STORAGE_KEYS.CARD_CONFIG, JSON.stringify(config))
}

// Campaign operations
export function getCampaigns(): Campaign[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)
  return data ? JSON.parse(data) : []
}

export function addCampaign(campaign: Campaign): void {
  const campaigns = getCampaigns()
  campaigns.unshift(campaign)
  localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns))
}

// Auth operations
export function setCurrentUser(customerId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, customerId)
}

export function getCurrentUser(): Customer | null {
  if (typeof window === "undefined") return null
  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return userId ? getCustomerById(userId) : null
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}

export function setAdminAuth(isAuth: boolean): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, isAuth.toString())
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === "true"
}

export function setMerchantAuth(isAuth: boolean): void {
  localStorage.setItem(STORAGE_KEYS.MERCHANT_AUTH, isAuth.toString())
}

export function isMerchantAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEYS.MERCHANT_AUTH) === "true"
}

// Notification operations
export function getNotifications(customerId?: string): LoyaltyNotification[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
  const notifications: LoyaltyNotification[] = data ? JSON.parse(data) : []
  return customerId ? notifications.filter((n) => n.customerId === customerId) : notifications
}

export function addNotification(notification: LoyaltyNotification): void {
  const notifications = getNotifications()
  notifications.unshift(notification)
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
}

export function markNotificationAsRead(notificationId: string): void {
  const notifications = getNotifications()
  const notification = notifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
  }
}

// QR Code operations
export function getQRCodes(): QRCode[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.QR_CODES)
  return data ? JSON.parse(data) : []
}

export function getQRCodeById(id: string): QRCode | null {
  const qrCodes = getQRCodes()
  return qrCodes.find((qr) => qr.id === id) || null
}

export function getQRCodeByCode(code: string): QRCode | null {
  const qrCodes = getQRCodes()
  return qrCodes.find((qr) => qr.code === code) || null
}

export function addQRCode(qrCode: QRCode): void {
  const qrCodes = getQRCodes()
  qrCodes.unshift(qrCode)
  localStorage.setItem(STORAGE_KEYS.QR_CODES, JSON.stringify(qrCodes))
}

export function updateQRCode(id: string, updates: Partial<QRCode>): void {
  const qrCodes = getQRCodes()
  const index = qrCodes.findIndex((qr) => qr.id === id)
  if (index !== -1) {
    qrCodes[index] = { ...qrCodes[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.QR_CODES, JSON.stringify(qrCodes))
  }
}

export function deleteQRCode(id: string): void {
  const qrCodes = getQRCodes()
  const filtered = qrCodes.filter((qr) => qr.id !== id)
  localStorage.setItem(STORAGE_KEYS.QR_CODES, JSON.stringify(filtered))
}

export function incrementQRCodeScan(code: string): void {
  const qrCodes = getQRCodes()
  const qrCode = qrCodes.find((qr) => qr.code === code)
  if (qrCode) {
    qrCode.scansCount++
    localStorage.setItem(STORAGE_KEYS.QR_CODES, JSON.stringify(qrCodes))
  }
}

// Generate unique IDs
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate QR code string
export function generateQRCode(customerId: string): string {
  return `QR_${customerId.toUpperCase()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}
