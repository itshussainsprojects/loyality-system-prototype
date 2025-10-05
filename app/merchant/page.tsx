"use client"

import { useState, useEffect } from "react"
import { MerchantNav } from "@/components/merchant-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRScanner } from "@/components/qr-scanner"
import { Scan, Gift, Award, TrendingUp, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import {
  getCustomerByQRCode,
  updateCustomer,
  addTransaction,
  getCardConfig,
  generateId,
  addNotification,
  getAllTransactions,
} from "@/lib/storage"

export default function MerchantPortal() {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [scannedCustomer, setScannedCustomer] = useState<any>(null)
  const [todayTransactions, setTodayTransactions] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadTodayTransactions()
    const interval = setInterval(loadTodayTransactions, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadTodayTransactions = () => {
    const allTransactions = getAllTransactions()
    const today = new Date()
    const filtered = allTransactions.filter((t: any) => {
      const transDate = new Date(t.timestamp)
      return transDate.toDateString() === today.toDateString()
    })
    setTodayTransactions(filtered)
  }

  const todayStampsGiven = todayTransactions.filter((t) => t.type === "earn").reduce((acc, t) => acc + t.stamps, 0)
  const todayRewardsRedeemed = todayTransactions.filter((t) => t.type === "redeem").length

  const handleScan = (qrCode: string) => {
    setLastScanned(qrCode)
    setScannerOpen(false)

    const customer = getCustomerByQRCode(qrCode)
    if (customer) {
      setScannedCustomer(customer)
      toast({
        title: "Customer Found!",
        description: `${customer.name} - ${customer.stamps} stamps`,
      })
    } else {
      toast({
        title: "Customer Not Found",
        description: "QR code not recognized",
        variant: "destructive",
      })
    }
  }

  const handleAwardStamp = () => {
    if (!scannedCustomer) {
      toast({
        title: "No Customer Scanned",
        description: "Please scan a customer QR code first",
        variant: "destructive",
      })
      return
    }

    const cardConfig = getCardConfig()
    const newStamps = scannedCustomer.stamps + 1
    const newTotalStamps = scannedCustomer.totalStamps + 1

    if (newStamps >= cardConfig.stampsRequired) {
      updateCustomer(scannedCustomer.id, {
        stamps: 0,
        totalStamps: newTotalStamps,
        rewardsRedeemed: scannedCustomer.rewardsRedeemed + 1,
        lastVisit: new Date().toISOString(),
      })

      addTransaction({
        id: generateId("trans"),
        customerId: scannedCustomer.id,
        type: "redeem",
        stamps: cardConfig.stampsRequired,
        timestamp: new Date().toISOString(),
        location: "Main Store",
      })

      addNotification({
        id: generateId("notif"),
        customerId: scannedCustomer.id,
        title: "Reward Earned!",
        message: `Congratulations! You've earned a ${cardConfig.rewardDescription}. Your stamps have been reset.`,
        type: "reward",
        read: false,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Reward Earned!",
        description: `${scannedCustomer.name} earned a ${cardConfig.rewardDescription}!`,
      })
    } else {
      updateCustomer(scannedCustomer.id, {
        stamps: newStamps,
        totalStamps: newTotalStamps,
        lastVisit: new Date().toISOString(),
      })

      addTransaction({
        id: generateId("trans"),
        customerId: scannedCustomer.id,
        type: "earn",
        stamps: 1,
        timestamp: new Date().toISOString(),
        location: "Main Store",
      })

      toast({
        title: "Stamp Awarded!",
        description: `${scannedCustomer.name} now has ${newStamps}/${cardConfig.stampsRequired} stamps`,
      })
    }

    const updatedCustomer = getCustomerByQRCode(lastScanned!)
    setScannedCustomer(updatedCustomer)
    loadTodayTransactions()
  }

  const handleTestScan = () => {
    const testQR = "QR_SARAH_001"
    handleScan(testQR)
  }

  const handleManualStamp = () => {
    toast({
      title: "Manual Entry",
      description: "Enter customer ID or phone number to award stamps.",
    })
  }

  const handleManualRedeem = () => {
    toast({
      title: "Manual Redemption",
      description: "Enter customer ID or phone number to redeem reward.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <MerchantNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Merchant Portal</h1>
          <p className="text-muted-foreground">Scan customer QR codes to award stamps or redeem rewards.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Scanner Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scanner Card */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Scanner</CardTitle>
                <CardDescription>Scan customer loyalty cards to process transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {!scannerOpen ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Scan className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ready to Scan</h3>
                    <p className="text-muted-foreground mb-6">Click the button below to open the camera scanner</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => setScannerOpen(true)} size="lg">
                        <Scan className="w-5 h-5 mr-2" />
                        Open Scanner
                      </Button>
                      <Button onClick={handleTestScan} size="lg" variant="outline" className="bg-transparent">
                        Test Scan (Demo)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
                  </div>
                )}

                {scannedCustomer && !scannerOpen && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                      <p className="text-sm font-medium mb-1">Customer: {scannedCustomer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Current Stamps: {scannedCustomer.stamps}/{getCardConfig().stampsRequired}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-2">{lastScanned}</p>
                    </div>

                    <Button onClick={handleAwardStamp} className="w-full" size="lg">
                      <Gift className="w-5 h-5 mr-2" />
                      Award Stamp
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Today's stamp awards and reward redemptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayTransactions.length > 0 ? (
                    todayTransactions.slice(0, 5).map((transaction) => {
                      const customer = getCustomerByQRCode(transaction.customerId)
                      return (
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
                            <p className="font-medium">{customer?.name || "Unknown Customer"}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.type === "earn" ? "Earned" : "Redeemed"} {transaction.stamps} stamp
                              {transaction.stamps !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No transactions today</p>
                      <p className="text-sm">Start scanning customer QR codes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{todayStampsGiven}</p>
                    <p className="text-xs text-muted-foreground">Stamps Given</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{todayRewardsRedeemed}</p>
                    <p className="text-xs text-muted-foreground">Rewards Redeemed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{todayTransactions.length}</p>
                    <p className="text-xs text-muted-foreground">Total Transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleManualStamp}>
                  <Gift className="w-4 h-4 mr-2" />
                  Manual Stamp Entry
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleManualRedeem}>
                  <Award className="w-4 h-4 mr-2" />
                  Redeem Reward
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Clock className="w-4 h-4 mr-2" />
                  View All Transactions
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Having trouble scanning QR codes or processing transactions?
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
