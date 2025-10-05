// Mock data for the loyalty system - all sample data for demo purposes

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  stamps: number
  totalStamps: number
  rewardsRedeemed: number
  joinedDate: string
  lastVisit: string
  qrCode: string
}

export interface Transaction {
  id: string
  customerId: string
  customerName: string
  type: "earn" | "redeem"
  stamps: number
  timestamp: string
  location?: string
}

export interface LoyaltyCard {
  id: string
  businessName: string
  backgroundColor: string
  textColor: string
  logoUrl?: string
  stampsRequired: number
  rewardDescription: string
  stampIcon: string
}

export interface Notification {
  id: string
  title: string
  message: string
  sentDate: string
  recipients: number
}

export interface Campaign {
  id: string
  title: string
  message: string
  type: "push" | "email"
  status: "sent" | "scheduled" | "draft"
  recipients: number
  openRate: number
  sentAt: string
}

// Sample customers
export const mockCustomers: Customer[] = [
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
  {
    id: "cust_003",
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "+1 (555) 345-6789",
    stamps: 3,
    totalStamps: 18,
    rewardsRedeemed: 2,
    joinedDate: "2024-01-10",
    lastVisit: "2025-01-02",
    qrCode: "QR_EMILY_003",
  },
  {
    id: "cust_004",
    name: "James Wilson",
    email: "jwilson@email.com",
    phone: "+1 (555) 456-7890",
    stamps: 9,
    totalStamps: 9,
    rewardsRedeemed: 0,
    joinedDate: "2024-12-01",
    lastVisit: "2025-01-05",
    qrCode: "QR_JAMES_004",
  },
  {
    id: "cust_005",
    name: "Olivia Martinez",
    email: "olivia.m@email.com",
    phone: "+1 (555) 567-8901",
    stamps: 2,
    totalStamps: 27,
    rewardsRedeemed: 3,
    joinedDate: "2023-11-15",
    lastVisit: "2025-01-01",
    qrCode: "QR_OLIVIA_005",
  },
]

// Sample transactions
export const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    customerId: "cust_004",
    customerName: "James Wilson",
    type: "earn",
    stamps: 2,
    timestamp: "2025-01-05T14:30:00",
    location: "Main Street Store",
  },
  {
    id: "txn_002",
    customerId: "cust_002",
    customerName: "Michael Chen",
    type: "earn",
    stamps: 1,
    timestamp: "2025-01-04T11:15:00",
    location: "Downtown Location",
  },
  {
    id: "txn_003",
    customerId: "cust_001",
    customerName: "Sarah Johnson",
    type: "redeem",
    stamps: 10,
    timestamp: "2025-01-03T16:45:00",
    location: "Main Street Store",
  },
  {
    id: "txn_004",
    customerId: "cust_003",
    customerName: "Emily Rodriguez",
    type: "earn",
    stamps: 3,
    timestamp: "2025-01-02T10:20:00",
    location: "Mall Location",
  },
  {
    id: "txn_005",
    customerId: "cust_005",
    customerName: "Olivia Martinez",
    type: "earn",
    stamps: 2,
    timestamp: "2025-01-01T13:00:00",
    location: "Downtown Location",
  },
]

// Default loyalty card template
export const defaultLoyaltyCard: LoyaltyCard = {
  id: "card_default",
  businessName: "Coffee Haven",
  backgroundColor: "#10b981",
  textColor: "#ffffff",
  stampsRequired: 10,
  rewardDescription: "Free Coffee",
  stampIcon: "☕",
}

// Sample notifications
export const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    title: "Weekend Special",
    message: "Get double stamps this weekend! Visit us Sat-Sun.",
    sentDate: "2025-01-03",
    recipients: 156,
  },
  {
    id: "notif_002",
    title: "New Reward Available",
    message: "Redeem 10 stamps for a FREE pastry with any drink!",
    sentDate: "2024-12-28",
    recipients: 203,
  },
  {
    id: "notif_003",
    title: "Happy Holidays",
    message: "Thank you for being a loyal customer. Enjoy 20% off today!",
    sentDate: "2024-12-25",
    recipients: 189,
  },
]

// Sample campaigns
export const mockCampaigns: Campaign[] = [
  {
    id: "camp1",
    title: "Weekend Special Offer",
    message: "Visit us this weekend and earn double stamps on all purchases!",
    type: "push",
    status: "sent",
    recipients: 156,
    openRate: 68,
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "camp2",
    title: "You're Almost There!",
    message: "Just 2 more stamps until your next reward. Don't miss out!",
    type: "push",
    status: "sent",
    recipients: 43,
    openRate: 82,
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "camp3",
    title: "New Rewards Program Updates",
    message: "We've added exciting new rewards to our loyalty program. Check them out!",
    type: "email",
    status: "sent",
    recipients: 234,
    openRate: 45,
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "camp4",
    title: "Happy Birthday!",
    message: "Celebrate your special day with a free reward on us!",
    type: "push",
    status: "sent",
    recipients: 12,
    openRate: 95,
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Analytics data
export const mockAnalytics = {
  totalCustomers: 156,
  activeCustomers: 89,
  stampsIssued: 1247,
  stampsRedeemed: 423,
  growthData: [
    { month: "Jul", customers: 45, stamps: 320 },
    { month: "Aug", customers: 67, stamps: 485 },
    { month: "Sep", customers: 89, stamps: 672 },
    { month: "Oct", customers: 112, stamps: 843 },
    { month: "Nov", customers: 134, stamps: 1056 },
    { month: "Dec", customers: 156, stamps: 1247 },
  ],
}
