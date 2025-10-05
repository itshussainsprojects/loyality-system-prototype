"use client"

import { useState, useEffect } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getCustomers, addNotification, generateId, type Notification } from "@/lib/storage"
import type { Customer } from "@/lib/mock-data"
import { Search, Mail, Phone, Gift, Award, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [messageTitle, setMessageTitle] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadCustomers = () => {
      const data = getCustomers()
      setCustomers(data)
    }

    loadCustomers()
    const interval = setInterval(loadCustomers, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailsOpen(true)
  }

  const handleSendMessage = (customer: Customer) => {
    setSelectedCustomer(customer)
    setMessageTitle("")
    setMessageContent("")
    setIsMessageOpen(true)
  }

  const handleSubmitMessage = () => {
    if (!selectedCustomer || !messageTitle || !messageContent) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and message",
        variant: "destructive",
      })
      return
    }

    const notification: Notification = {
      id: generateId("notif"),
      customerId: selectedCustomer.id,
      title: messageTitle,
      message: messageContent,
      type: "campaign",
      read: false,
      createdAt: new Date().toISOString(),
    }

    addNotification(notification)

    toast({
      title: "Message Sent!",
      description: `Your message has been sent to ${selectedCustomer.name}`,
    })

    setIsMessageOpen(false)
    setMessageTitle("")
    setMessageContent("")
    setSelectedCustomer(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Customers</h1>
          <p className="text-muted-foreground">Manage your loyalty program members and track their activity.</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search customers by name, email, or phone..." className="pl-9" />
              </div>
              <Button variant="outline" className="bg-transparent">
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Stamps per Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.length > 0
                  ? (customers.reduce((acc, c) => acc + c.stamps, 0) / customers.length).toFixed(1)
                  : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards Given</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.reduce((acc, c) => acc + c.rewardsRedeemed, 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Customer List */}
        <div className="grid gap-4">
          {customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Customer Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{customer.name}</h3>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </div>
                      <Badge variant={customer.stamps >= 8 ? "default" : "secondary"}>
                        {customer.stamps >= 8 ? "Close to Reward" : "Active"}
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Gift className="w-3 h-3" />
                          Current Stamps
                        </div>
                        <div className="text-lg font-semibold">{customer.stamps}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Award className="w-3 h-3" />
                          Total Earned
                        </div>
                        <div className="text-lg font-semibold">{customer.totalStamps}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Award className="w-3 h-3" />
                          Rewards
                        </div>
                        <div className="text-lg font-semibold">{customer.rewardsRedeemed}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Calendar className="w-3 h-3" />
                          Last Visit
                        </div>
                        <div className="text-sm font-medium">
                          {formatDistanceToNow(new Date(customer.lastVisit), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none bg-transparent"
                      onClick={() => handleViewDetails(customer)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none bg-transparent"
                      onClick={() => handleSendMessage(customer)}
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>Complete information about {selectedCustomer?.name}</DialogDescription>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Customer ID</Label>
                    <p className="font-medium font-mono text-sm">{selectedCustomer.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">QR Code</Label>
                    <p className="font-medium font-mono text-sm">{selectedCustomer.qrCode}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Member Since</Label>
                    <p className="font-medium">{new Date(selectedCustomer.joinedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{selectedCustomer.stamps}</p>
                    <p className="text-xs text-muted-foreground">Current Stamps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">{selectedCustomer.totalStamps}</p>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{selectedCustomer.rewardsRedeemed}</p>
                    <p className="text-xs text-muted-foreground">Rewards</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {selectedCustomer.totalStamps > 0
                        ? Math.round((selectedCustomer.rewardsRedeemed / (selectedCustomer.totalStamps / 10)) * 100)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground">Redemption Rate</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Send Message Dialog */}
        <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>Send a notification to {selectedCustomer?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message-title">Message Title</Label>
                <Input
                  id="message-title"
                  placeholder="e.g., Special Offer Just for You!"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="message-content">Message</Label>
                <Textarea
                  id="message-content"
                  placeholder="Enter your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsMessageOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitMessage}>Send Message</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
