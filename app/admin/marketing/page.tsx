"use client"

import { useState } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockCustomers, mockCampaigns } from "@/lib/mock-data"
import { Send, Users, TrendingUp, Mail, Bell, Calendar, Target } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { addCampaign, addNotification, getCustomers, generateId } from "@/lib/storage"

export default function MarketingPage() {
  const [campaignTitle, setCampaignTitle] = useState("")
  const [campaignMessage, setCampaignMessage] = useState("")
  const [selectedSegment, setSelectedSegment] = useState<"all" | "active" | "inactive">("all")
  const { toast } = useToast()

  const segments = {
    all: mockCustomers.length,
    active: mockCustomers.filter((c) => c.stamps > 0).length,
    inactive: mockCustomers.filter((c) => c.stamps === 0).length,
  }

  const handleSendCampaign = (type: "push" | "email") => {
    const campaign = {
      id: generateId("camp"),
      title: campaignTitle,
      message: campaignMessage,
      type,
      status: "sent" as const,
      recipients: segments[selectedSegment],
      openRate: 0,
      sentAt: new Date().toISOString(),
    }

    addCampaign(campaign)

    const customers = getCustomers()
    const targetCustomers =
      selectedSegment === "all"
        ? customers
        : selectedSegment === "active"
          ? customers.filter((c) => c.stamps > 0)
          : customers.filter((c) => c.stamps === 0)

    targetCustomers.forEach((customer) => {
      addNotification({
        id: generateId("notif"),
        customerId: customer.id,
        title: campaignTitle,
        message: campaignMessage,
        type: "campaign",
        read: false,
        createdAt: new Date().toISOString(),
      })
    })

    toast({
      title: "Campaign Sent!",
      description: `Your ${type === "push" ? "push notification" : "email"} has been sent to ${segments[selectedSegment]} customers.`,
    })
    setCampaignTitle("")
    setCampaignMessage("")
  }

  const handleScheduleCampaign = () => {
    const campaign = {
      id: generateId("camp"),
      title: campaignTitle,
      message: campaignMessage,
      type: "push" as const,
      status: "scheduled" as const,
      recipients: segments[selectedSegment],
      openRate: 0,
      sentAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Schedule for tomorrow
    }

    addCampaign(campaign)

    toast({
      title: "Campaign Scheduled",
      description: "Your campaign has been scheduled for delivery.",
    })
    setCampaignTitle("")
    setCampaignMessage("")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Marketing & Campaigns</h1>
          <p className="text-muted-foreground">Create and manage marketing campaigns to engage your customers.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Campaign */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
                <CardDescription>Send targeted messages to your loyalty program members</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="push" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="push">
                      <Bell className="w-4 h-4 mr-2" />
                      Push Notification
                    </TabsTrigger>
                    <TabsTrigger value="email">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="push" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="push-title">Notification Title</Label>
                      <Input
                        id="push-title"
                        placeholder="e.g., Special Offer Just for You!"
                        value={campaignTitle}
                        onChange={(e) => setCampaignTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="push-message">Message</Label>
                      <Textarea
                        id="push-message"
                        placeholder="Enter your message here..."
                        value={campaignMessage}
                        onChange={(e) => setCampaignMessage(e.target.value)}
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">Keep it short and engaging (max 160 characters)</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["all", "active", "inactive"] as const).map((segment) => (
                          <button
                            key={segment}
                            onClick={() => setSelectedSegment(segment)}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              selectedSegment === segment
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <p className="text-2xl font-bold">{segments[segment]}</p>
                            <p className="text-xs text-muted-foreground capitalize">{segment} Users</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs font-medium mb-2 text-muted-foreground">Preview</p>
                      <div className="bg-background p-3 rounded-lg shadow-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <Bell className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{campaignTitle || "Notification Title"}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {campaignMessage || "Your message will appear here..."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        className="flex-1"
                        disabled={!campaignTitle || !campaignMessage}
                        onClick={() => handleSendCampaign("push")}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Now
                      </Button>
                      <Button variant="outline" className="bg-transparent" onClick={handleScheduleCampaign}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Email Subject</Label>
                      <Input
                        id="email-subject"
                        placeholder="e.g., Exclusive Rewards Waiting for You"
                        value={campaignTitle}
                        onChange={(e) => setCampaignTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-message">Email Body</Label>
                      <Textarea
                        id="email-message"
                        placeholder="Enter your email content here..."
                        value={campaignMessage}
                        onChange={(e) => setCampaignMessage(e.target.value)}
                        rows={8}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["all", "active", "inactive"] as const).map((segment) => (
                          <button
                            key={segment}
                            onClick={() => setSelectedSegment(segment)}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              selectedSegment === segment
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <p className="text-2xl font-bold">{segments[segment]}</p>
                            <p className="text-xs text-muted-foreground capitalize">{segment} Users</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        className="flex-1"
                        disabled={!campaignTitle || !campaignMessage}
                        onClick={() => handleSendCampaign("email")}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      <Button variant="outline" className="bg-transparent" onClick={handleScheduleCampaign}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Campaign History */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign History</CardTitle>
                <CardDescription>View past campaigns and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          campaign.type === "push" ? "bg-primary/10" : "bg-secondary/10"
                        }`}
                      >
                        {campaign.type === "push" ? (
                          <Bell className="w-5 h-5 text-primary" />
                        ) : (
                          <Mail className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="font-semibold">{campaign.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{campaign.message}</p>
                          </div>
                          <Badge variant={campaign.status === "sent" ? "secondary" : "outline"}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {campaign.recipients} recipients
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {campaign.openRate}% opened
                          </span>
                          <span>{formatDistanceToNow(new Date(campaign.sentAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockCampaigns.length}</p>
                    <p className="text-xs text-muted-foreground">Total Campaigns</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockCampaigns.reduce((acc, c) => acc + c.recipients, 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Reach</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(mockCampaigns.reduce((acc, c) => acc + c.openRate, 0) / mockCampaigns.length).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Avg. Open Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    setCampaignTitle("You're close to a reward!")
                    setCampaignMessage("Just 2 more stamps and you'll earn a free reward. Visit us today!")
                  }}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Almost There
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    setCampaignTitle("We miss you!")
                    setCampaignMessage("It's been a while since your last visit. Come back and earn double stamps!")
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Win Back
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    setCampaignTitle("Special Offer Inside")
                    setCampaignMessage("Exclusive deal for our loyal members. Show this notification for 20% off!")
                  }}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Special Offer
                </Button>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Send campaigns during peak hours (10am-2pm, 6pm-8pm)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Personalize messages with customer names when possible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Include clear call-to-action in every message</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Test campaigns with small segments first</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
