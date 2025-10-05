"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CustomerNav } from "@/components/customer-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoyaltyCardPreview } from "@/components/loyalty-card-preview"
import { Gift, Award, Calendar, TrendingUp, Download, Wallet, Bell, AlertCircle, Scan } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  getCurrentUser,
  getCardConfig,
  getCustomerTransactions,
  getCampaigns,
  initializeStorage,
  getNotifications,
  markNotificationAsRead,
  updateCustomer,
  addTransaction,
  generateId,
  addNotification,
} from "@/lib/storage"
import { Badge } from "@/components/ui/badge"

export default function CustomerPortal() {
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState<any>(null)
  const [cardConfig, setCardConfig] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user) {
      router.push("/customer/login")
      return
    }
    loadCustomerData(user.id)

    const interval = setInterval(() => {
      loadCustomerData(user.id)
    }, 3000)

    return () => clearInterval(interval)
  }, [router])

  const loadCustomerData = (userId: string) => {
    const user = getCurrentUser()
    if (!user) return

    setCustomer(user)
    setCardConfig(getCardConfig())
    setTransactions(getCustomerTransactions(user.id))
    setCampaigns(getCampaigns().slice(0, 3))

    const userNotifications = getNotifications(user.id)
    setNotifications(userNotifications)
    setUnreadCount(userNotifications.filter((n) => !n.read).length)

    setLoading(false)

    const newNotifications = userNotifications.filter((n) => !n.read)
    if (newNotifications.length > 0 && !sessionStorage.getItem(`notif_shown_${newNotifications[0].id}`)) {
      const latest = newNotifications[0]
      toast({
        title: latest.title,
        description: latest.message,
        duration: 5000,
      })
      sessionStorage.setItem(`notif_shown_${latest.id}`, "true")
    }
  }

  const handleTestScan = () => {
    if (!customer || !cardConfig) return

    const newStamps = customer.stamps + 1
    const newTotalStamps = customer.totalStamps + 1

    if (newStamps >= cardConfig.stampsRequired) {
      updateCustomer(customer.id, {
        stamps: 0,
        totalStamps: newTotalStamps,
        rewardsRedeemed: customer.rewardsRedeemed + 1,
        lastVisit: new Date().toISOString(),
      })

      addTransaction({
        id: generateId("trans"),
        customerId: customer.id,
        type: "redeem",
        stamps: cardConfig.stampsRequired,
        timestamp: new Date().toISOString(),
        location: "Test Location",
      })

      addNotification({
        id: generateId("notif"),
        customerId: customer.id,
        title: "Reward Earned!",
        message: `Congratulations! You've earned a ${cardConfig.rewardDescription}. Your stamps have been reset.`,
        type: "reward",
        read: false,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Reward Earned! 🎉",
        description: `You earned a ${cardConfig.rewardDescription}! Stamps reset to 0.`,
      })
    } else {
      updateCustomer(customer.id, {
        stamps: newStamps,
        totalStamps: newTotalStamps,
        lastVisit: new Date().toISOString(),
      })

      addTransaction({
        id: generateId("trans"),
        customerId: customer.id,
        type: "earn",
        stamps: 1,
        timestamp: new Date().toISOString(),
        location: "Test Location",
      })

      toast({
        title: "Stamp Earned!",
        description: `You now have ${newStamps}/${cardConfig.stampsRequired} stamps`,
      })
    }

    loadCustomerData(customer.id)
  }

  const handleAddToAppleWallet = () => {
    toast({
      title: "Generating Apple Wallet Pass",
      description: "Creating your .pkpass file...",
    })

    setTimeout(() => {
      const passData = {
        formatVersion: 1,
        passTypeIdentifier: "pass.com.loyaltyhub.card",
        serialNumber: customer.qrCode,
        teamIdentifier: "DEMO",
        organizationName: cardConfig.businessName,
        description: "Loyalty Card",
        logoText: cardConfig.businessName,
        foregroundColor: cardConfig.textColor,
        backgroundColor: cardConfig.backgroundColor,
        barcode: {
          message: customer.qrCode,
          format: "PKBarcodeFormatQR",
          messageEncoding: "iso-8859-1",
        },
        generic: {
          primaryFields: [
            {
              key: "stamps",
              label: "Current Stamps",
              value: customer.stamps.toString(),
            },
          ],
          secondaryFields: [
            {
              key: "name",
              label: "Member",
              value: customer.name,
            },
          ],
        },
      }

      const blob = new Blob([JSON.stringify(passData, null, 2)], { type: "application/vnd.apple.pkpass" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `loyalty-card-${customer.qrCode}.pkpass`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success!",
        description: "Wallet pass downloaded. Add it to Apple Wallet on your device.",
      })
    }, 1000)
  }

  const handleAddToGoogleWallet = () => {
    toast({
      title: "Generating Google Wallet Pass",
      description: "Creating your wallet pass...",
    })

    setTimeout(() => {
      const passData = {
        iss: "loyalty-hub-demo@example.com",
        aud: "google",
        typ: "savetowallet",
        iat: Math.floor(Date.now() / 1000),
        payload: {
          loyaltyObjects: [
            {
              id: `loyalty.${customer.qrCode}`,
              classId: "loyalty.loyaltyhub_card",
              state: "ACTIVE",
              barcode: {
                type: "QR_CODE",
                value: customer.qrCode,
              },
              accountName: customer.name,
              accountId: customer.id,
              loyaltyPoints: {
                label: "Stamps",
                balance: {
                  int: customer.stamps,
                },
              },
            },
          ],
        },
      }

      const blob = new Blob([JSON.stringify(passData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `google-wallet-pass-${customer.qrCode}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success!",
        description: "Wallet pass downloaded. Import it to Google Wallet.",
      })
    }, 1000)
  }

  const handleDownloadCard = () => {
    toast({
      title: "Downloading Card",
      description: "Generating your loyalty card image...",
    })

    setTimeout(() => {
      const svg = `
        <svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="250" fill="${cardConfig.backgroundColor}" rx="12"/>
          <text x="20" y="40" fill="${cardConfig.textColor}" fontSize="24" fontWeight="bold">${cardConfig.businessName}</text>
          <text x="20" y="70" fill="${cardConfig.textColor}" fontSize="14">${customer.name}</text>
          <text x="20" y="120" fill="${cardConfig.textColor}" fontSize="16">Stamps: ${customer.stamps}/${cardConfig.stampsRequired}</text>
          <text x="20" y="150" fill="${cardConfig.textColor}" fontSize="14">QR: ${customer.qrCode}</text>
          <text x="20" y="220" fill="${cardConfig.textColor}" fontSize="12">Member since ${customer.joinedDate}</text>
        </svg>
      `

      const blob = new Blob([svg], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `loyalty-card-${customer.qrCode}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Card Downloaded!",
        description: "Your loyalty card has been saved as an image.",
      })
    }, 800)
  }

  const handleRedeemReward = () => {
    if (customer.stamps < cardConfig.stampsRequired) {
      toast({
        title: "Not Enough Stamps",
        description: `You need ${cardConfig.stampsRequired - customer.stamps} more stamps to redeem.`,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Reward Ready!",
      description: "Show your QR code to staff to redeem your reward.",
      duration: 5000,
    })
  }

  if (loading || !customer || !cardConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your loyalty card...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomerNav customerName={customer.name} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {customer.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Track your rewards and redeem stamps at any location.</p>
        </div>

        {customer.stamps > 0 && customer.stamps < cardConfig.stampsRequired && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              You have {customer.stamps} stamps. Collect {cardConfig.stampsRequired - customer.stamps} more to earn a
              reward!
            </AlertDescription>
          </Alert>
        )}

        {customer.stamps >= cardConfig.stampsRequired && (
          <Alert className="mb-6 border-primary/50 bg-primary/10">
            <Gift className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              Congratulations! You have a reward ready to redeem. Show your QR code at checkout.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Loyalty Card</CardTitle>
                    <CardDescription>Show this QR code at checkout to earn or redeem stamps</CardDescription>
                  </div>
                  <Button onClick={handleTestScan} variant="outline" size="sm">
                    <Scan className="w-4 h-4 mr-2" />
                    Test Scan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <LoyaltyCardPreview config={cardConfig} currentStamps={customer.stamps} qrCode={customer.qrCode} />

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress to next reward</span>
                    <span className="text-sm text-muted-foreground">
                      {customer.stamps} / {cardConfig.stampsRequired}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min((customer.stamps / cardConfig.stampsRequired) * 100, 100)}%` }}
                    />
                  </div>
                  {customer.stamps >= cardConfig.stampsRequired && (
                    <p className="text-sm text-primary font-medium mt-2">You have a reward ready to redeem!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest transactions and rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "earn" ? "bg-secondary/10" : "bg-primary/10"
                          }`}
                        >
                          {transaction.type === "earn" ? (
                            <Gift className="w-5 h-5 text-secondary" />
                          ) : (
                            <Award className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {transaction.type === "earn" ? "Stamps Earned" : "Reward Redeemed"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.type === "earn" ? "+" : "-"}
                            {transaction.stamps} stamp{transaction.stamps !== 1 ? "s" : ""}
                            {transaction.location && ` at ${transaction.location}`}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No activity yet</p>
                      <p className="text-sm">Start earning stamps on your next visit!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{customer.stamps}</p>
                    <p className="text-xs text-muted-foreground">Current Stamps</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{customer.totalStamps}</p>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{customer.rewardsRedeemed}</p>
                    <p className="text-xs text-muted-foreground">Rewards Claimed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {formatDistanceToNow(new Date(customer.lastVisit), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-muted-foreground">Last Visit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{cardConfig.rewardDescription}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Collect {cardConfig.stampsRequired} stamps</p>
                  </div>

                  {customer.stamps >= cardConfig.stampsRequired && (
                    <Button className="w-full" onClick={handleRedeemReward}>
                      Redeem Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleDownloadCard}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Card
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleAddToAppleWallet}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Add to Apple Wallet
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={handleAddToGoogleWallet}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Add to Google Wallet
                </Button>
              </CardContent>
            </Card>

            {notifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Recent Notifications
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {unreadCount}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        notification.read ? "bg-muted" : "bg-primary/10 border border-primary/20"
                      }`}
                      onClick={() => {
                        markNotificationAsRead(notification.id)
                        loadCustomerData(customer.id)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium mb-1">{notification.title}</p>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
