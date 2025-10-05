"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CustomerNav } from "@/components/customer-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Bell, Mail, MessageSquare, Gift, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser, updateCustomer, initializeStorage } from "@/lib/storage"

export default function NotificationPreferencesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState<any>(null)
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    rewardAlerts: true,
    stampReminders: true,
  })

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    if (!user) {
      router.push("/customer/login")
      return
    }
    setCustomer(user)
    // Load preferences from user data if available
    if (user.notificationPreferences) {
      setPreferences(user.notificationPreferences)
    }
  }, [router])

  const handleSave = () => {
    if (!customer) return

    const updatedCustomer = {
      ...customer,
      notificationPreferences: preferences,
    }

    updateCustomer(updatedCustomer)
    setCustomer(updatedCustomer)

    toast({
      title: "Preferences Saved!",
      description: "Your notification preferences have been updated.",
    })
  }

  const togglePreference = (key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  if (!customer) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomerNav customerName={customer.name} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
          <p className="text-muted-foreground">Choose how you want to receive updates and alerts.</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Channels</CardTitle>
              <CardDescription>Select your preferred notification methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="push" className="text-base font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                  </div>
                </div>
                <Switch
                  id="push"
                  checked={preferences.pushNotifications}
                  onCheckedChange={() => togglePreference("pushNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Get updates via email</p>
                  </div>
                </div>
                <Switch
                  id="email"
                  checked={preferences.emailNotifications}
                  onCheckedChange={() => togglePreference("emailNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="sms" className="text-base font-medium">
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive text messages</p>
                  </div>
                </div>
                <Switch
                  id="sms"
                  checked={preferences.smsNotifications}
                  onCheckedChange={() => togglePreference("smsNotifications")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="rewards" className="text-base font-medium">
                      Reward Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">When you earn a new reward</p>
                  </div>
                </div>
                <Switch
                  id="rewards"
                  checked={preferences.rewardAlerts}
                  onCheckedChange={() => togglePreference("rewardAlerts")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <Label htmlFor="stamps" className="text-base font-medium">
                      Stamp Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">Reminders about expiring stamps</p>
                  </div>
                </div>
                <Switch
                  id="stamps"
                  checked={preferences.stampReminders}
                  onCheckedChange={() => togglePreference("stampReminders")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="marketing" className="text-base font-medium">
                      Marketing & Promotions
                    </Label>
                    <p className="text-sm text-muted-foreground">Special offers and news</p>
                  </div>
                </div>
                <Switch
                  id="marketing"
                  checked={preferences.marketingEmails}
                  onCheckedChange={() => togglePreference("marketingEmails")}
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </main>
    </div>
  )
}
