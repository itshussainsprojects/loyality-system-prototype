import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockAnalytics, mockTransactions, mockCustomers } from "@/lib/mock-data"
import { Users, TrendingUp, Gift, Award, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { AdminNav } from "@/components/admin-nav"
import { RecentActivity } from "@/components/recent-activity"
import { CustomerGrowthChart } from "@/components/customer-growth-chart"

export default function AdminDashboard() {
  const recentTransactions = mockTransactions.slice(0, 5)
  const activeCustomers = mockCustomers.filter((c) => {
    const lastVisit = new Date(c.lastVisit)
    const daysSinceVisit = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceVisit <= 30
  }).length

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your loyalty program.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.totalCustomers}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-secondary" />
                <span className="text-secondary">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCustomers}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-secondary" />
                <span className="text-secondary">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Stamps Issued</CardTitle>
              <Gift className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.stampsIssued}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-secondary" />
                <span className="text-secondary">+18%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Stamps Redeemed</CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.stampsRedeemed}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowDownRight className="w-3 h-3 text-destructive" />
                <span className="text-destructive">-3%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>New customers and stamp activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerGrowthChart data={mockAnalytics.growthData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest customer transactions and redemptions</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity transactions={recentTransactions} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/customers">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                View Customers
              </Button>
            </Link>
            <Link href="/admin/card-designer">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Gift className="w-4 h-4 mr-2" />
                Design Card
              </Button>
            </Link>
            <Link href="/admin/marketing">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <TrendingUp className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </Link>
            <Link href="/merchant">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Award className="w-4 h-4 mr-2" />
                Scan QR Code
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
