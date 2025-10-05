"use client"

import { useState, useEffect } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { QrCode, Download, Search, Plus, Trash2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getCustomers,
  getQRCodes,
  addQRCode,
  updateQRCode,
  deleteQRCode,
  generateId,
  initializeStorage,
  type QRCode as QRCodeType,
} from "@/lib/storage"
import QRCodeStyling from "qr-code-styling"

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRCodeType[]>([])
  const [customers, setCustomers] = useState(getCustomers())
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingQR, setEditingQR] = useState<QRCodeType | null>(null)

  // Form state
  const [qrName, setQRName] = useState("")
  const [qrType, setQRType] = useState<"customer" | "campaign" | "card" | "event">("customer")
  const [qrDescription, setQRDescription] = useState("")
  const [assignedCustomer, setAssignedCustomer] = useState("")
  const [stampsPerScan, setStampsPerScan] = useState("1")

  const { toast } = useToast()

  useEffect(() => {
    initializeStorage()
    loadData()
    const interval = setInterval(loadData, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    setQRCodes(getQRCodes())
    setCustomers(getCustomers())
  }

  const filteredQRCodes = qrCodes.filter(
    (qr) =>
      qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setQRName("")
    setQRType("customer")
    setQRDescription("")
    setAssignedCustomer("")
    setStampsPerScan("1")
    setEditingQR(null)
  }

  const handleCreateQR = () => {
    if (!qrName) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the QR code.",
        variant: "destructive",
      })
      return
    }

    const qrId = generateId("qr")
    const qrCodeString = `QR_${qrType.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const newQRCode: QRCodeType = {
      id: qrId,
      code: qrCodeString,
      type: qrType,
      name: qrName,
      description: qrDescription || undefined,
      assignedTo: assignedCustomer || undefined,
      stampsPerScan: Number.parseInt(stampsPerScan) || 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      scansCount: 0,
    }

    addQRCode(newQRCode)
    loadData()
    resetForm()
    setIsCreateOpen(false)

    toast({
      title: "QR Code Created!",
      description: `${qrName} has been created successfully.`,
    })
  }

  const handleEditQR = (qr: QRCodeType) => {
    setEditingQR(qr)
    setQRName(qr.name)
    setQRType(qr.type)
    setQRDescription(qr.description || "")
    setAssignedCustomer(qr.assignedTo || "")
    setStampsPerScan(qr.stampsPerScan?.toString() || "1")
    setIsCreateOpen(true)
  }

  const handleUpdateQR = () => {
    if (!editingQR || !qrName) return

    updateQRCode(editingQR.id, {
      name: qrName,
      type: qrType,
      description: qrDescription || undefined,
      assignedTo: assignedCustomer || undefined,
      stampsPerScan: Number.parseInt(stampsPerScan) || 1,
    })

    loadData()
    resetForm()
    setIsCreateOpen(false)

    toast({
      title: "QR Code Updated!",
      description: `${qrName} has been updated successfully.`,
    })
  }

  const handleDeleteQR = (qr: QRCodeType) => {
    if (confirm(`Are you sure you want to delete "${qr.name}"?`)) {
      deleteQRCode(qr.id)
      loadData()
      toast({
        title: "QR Code Deleted",
        description: `${qr.name} has been removed.`,
      })
    }
  }

  const handleToggleActive = (qr: QRCodeType) => {
    updateQRCode(qr.id, { isActive: !qr.isActive })
    loadData()
    toast({
      title: qr.isActive ? "QR Code Deactivated" : "QR Code Activated",
      description: `${qr.name} is now ${qr.isActive ? "inactive" : "active"}.`,
    })
  }

  const handleDownloadQR = (qr: QRCodeType) => {
    const qrCode = new QRCodeStyling({
      width: 400,
      height: 400,
      data: qr.code,
      dotsOptions: {
        color: "#10b981",
        type: "rounded",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
      },
    })

    qrCode.download({
      name: `${qr.name.replace(/\s+/g, "_")}_QR`,
      extension: "png",
    })

    toast({
      title: "QR Code Downloaded",
      description: `${qr.name} QR code has been downloaded.`,
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "customer":
        return "bg-blue-500"
      case "campaign":
        return "bg-purple-500"
      case "card":
        return "bg-emerald-500"
      case "event":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">QR Code Management</h1>
            <p className="text-muted-foreground">Create and manage different QR codes for various purposes.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create QR Code
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qrCodes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qrCodes.filter((qr) => qr.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qrCodes.reduce((acc, qr) => acc + qr.scansCount, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assigned to Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qrCodes.filter((qr) => qr.assignedTo).length}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search QR codes by name, code, or type..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredQRCodes.map((qr) => {
            const assignedCustomer = qr.assignedTo ? customers.find((c) => c.id === qr.assignedTo) : null

            return (
              <Card key={qr.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-white rounded-lg border-2 flex items-center justify-center flex-shrink-0">
                      <QrCode className="w-14 h-14 text-primary" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{qr.name}</h3>
                            <Badge className={getTypeColor(qr.type)}>{qr.type}</Badge>
                            <Badge variant={qr.isActive ? "default" : "secondary"}>
                              {qr.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {qr.description && <p className="text-sm text-muted-foreground mb-2">{qr.description}</p>}
                          <code className="text-xs bg-muted px-2 py-1 rounded">{qr.code}</code>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Stamps per Scan</p>
                          <p className="font-semibold">{qr.stampsPerScan || 1}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Scans</p>
                          <p className="font-semibold">{qr.scansCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Assigned To</p>
                          <p className="font-semibold text-sm">{assignedCustomer?.name || "Unassigned"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="font-semibold text-sm">{new Date(qr.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => handleDownloadQR(qr)}>
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditQR(qr)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggleActive(qr)}>
                          {qr.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteQR(qr)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredQRCodes.length === 0 && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <QrCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No QR Codes Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search" : "Create your first QR code to get started"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create QR Code
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingQR ? "Edit QR Code" : "Create New QR Code"}</DialogTitle>
              <DialogDescription>
                {editingQR ? "Update the QR code details" : "Generate a new QR code for your loyalty program"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-name">QR Code Name</Label>
                  <Input
                    id="qr-name"
                    placeholder="e.g., Summer Campaign 2025"
                    value={qrName}
                    onChange={(e) => setQRName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qr-type">Type</Label>
                  <Select value={qrType} onValueChange={(value: any) => setQRType(value)}>
                    <SelectTrigger id="qr-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-description">Description (Optional)</Label>
                <Textarea
                  id="qr-description"
                  placeholder="Add details about this QR code..."
                  value={qrDescription}
                  onChange={(e) => setQRDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stamps-per-scan">Stamps per Scan</Label>
                  <Input
                    id="stamps-per-scan"
                    type="number"
                    min="1"
                    max="10"
                    value={stampsPerScan}
                    onChange={(e) => setStampsPerScan(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned-customer">Assign to Customer (Optional)</Label>
                  <Select value={assignedCustomer} onValueChange={setAssignedCustomer}>
                    <SelectTrigger id="assigned-customer">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingQR ? handleUpdateQR : handleCreateQR}>
                  {editingQR ? "Update QR Code" : "Create QR Code"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
