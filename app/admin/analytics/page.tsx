"use client"

import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockAnalytics, mockCustomers, mockTransactions } from "@/lib/mock-data"
import { Download, FileText, Gift, Award } from "lucide-react"
import { CustomerGrowthChart } from "@/components/customer-growth-chart"
import { StampActivityChart } from "@/components/stamp-activity-chart"
import { useToast } from "@/hooks/use-toast"

export default function AnalyticsPage() {
  const { toast } = useToast()

  const handleExportCSV = () => {
    toast({
      title: "Exporting to CSV",
      description: "Your analytics report is being downloaded...",
    })
  }

  const handleExportPDF = () => {
    toast({
      title: "Exporting to PDF",
      description: "Your analytics report is being generated...",
    })
  }

  // Calculate additional metrics
  const avgStampsPerCustomer = (mockAnalytics.stampsIssued / mockAnalytics.totalCustomers).toFixed(1)
  const redemptionRate = ((mockAnalytics.stampsRedeemed / mockAnalytics.stampsIssued) * 100).toFixed(1)
  const activeRate = ((mockAnalytics.activeCustomers / mockAnalytics.totalCustomers) * 100).toFixed(1)

  const stampActivityData = mockAnalytics.growthData.map((item, index) => ({
    month: item.month,
    issued: item.stamps,
    redeemed: Math.floor(item.stamps * 0.34), // ~34% redemption rate
  }))

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
            <p className="text-muted-foreground">Detailed insights into your loyalty program performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <FileText className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockAnalytics.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime registrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Visited in last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Stamps/Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgStampsPerCustomer}</div>
              <p className="text-xs text-muted-foreground mt-1">Per customer lifetime</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Redemption Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{redemptionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Stamps redeemed vs issued</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth Trend</CardTitle>
              <CardDescription>New customer acquisitions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerGrowthChart data={mockAnalytics.growthData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stamp Activity</CardTitle>
              <CardDescription>Stamps issued and redeemed monthly</CardDescription>
            </CardHeader>
            <CardContent>
              <StampActivityChart data={stampActivityData} />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Most active loyalty program members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCustomers
                  .sort((a, b) => b.totalStamps - a.totalStamps)
                  .slice(0, 5)
                  .map((customer, index) => (
                    <div key={customer.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.totalStamps} total stamps</p>
                      </div>
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest customer activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === "earn" ? "bg-secondary/10" : "bg-primary/10"
                      }`}
                    >
                      {transaction.type === "earn" ? (
                        <Gift className="w-4 h-4 text-secondary" />
                      ) : (
                        <Award className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{transaction.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.type === "earn" ? "+" : "-"}
                        {transaction.stamps} stamps
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
