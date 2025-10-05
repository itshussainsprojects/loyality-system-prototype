"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scan, X, Camera, AlertCircle, CheckCircle2, Gift, Award } from "lucide-react"
import { mockCustomers, defaultLoyaltyCard } from "@/lib/mock-data"

interface QRScannerProps {
  onScan: (qrCode: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [action, setAction] = useState<"earn" | "redeem" | null>(null)

  // Simulate scanning after a delay
  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        // Simulate scanning a random customer's QR code
        const randomCustomer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)]
        setScannedData(randomCustomer.qrCode)
        setScanning(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [scanning])

  const handleStartScan = () => {
    setScanning(true)
    setScannedData(null)
    setAction(null)
  }

  const handleConfirm = () => {
    if (scannedData && action) {
      onScan(scannedData)
    }
  }

  const customer = scannedData ? mockCustomers.find((c) => c.qrCode === scannedData) : null

  return (
    <div className="space-y-4">
      {/* Scanner View */}
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
        {scanning ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
              <p className="text-lg font-semibold mb-2">Scanning...</p>
              <p className="text-sm text-muted-foreground">Point camera at QR code</p>
            </div>
            {/* Scanning overlay */}
            <div className="absolute inset-0 border-4 border-primary/50 rounded-lg">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-scan" />
            </div>
          </div>
        ) : scannedData && customer ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-secondary" />
                  <h3 className="text-xl font-bold mb-1">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Current Stamps</span>
                    <Badge variant="secondary">{customer.stamps}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Stamps to Reward</span>
                    <Badge variant="outline">{defaultLoyaltyCard.stampsRequired - customer.stamps}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => setAction("earn")}
                    variant={action === "earn" ? "default" : "outline"}
                    className="w-full"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Award Stamp
                  </Button>
                  <Button
                    onClick={() => setAction("redeem")}
                    variant={action === "redeem" ? "default" : "outline"}
                    className="w-full"
                    disabled={customer.stamps < defaultLoyaltyCard.stampsRequired}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Redeem Reward
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Scan className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">Ready to Scan</p>
              <p className="text-sm text-muted-foreground">Click below to start scanning</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!scannedData ? (
          <>
            <Button onClick={handleStartScan} disabled={scanning} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              {scanning ? "Scanning..." : "Start Scan"}
            </Button>
            <Button onClick={onClose} variant="outline" className="bg-transparent">
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleConfirm} disabled={!action} className="flex-1">
              Confirm {action === "earn" ? "Stamp" : "Redemption"}
            </Button>
            <Button onClick={handleStartScan} variant="outline" className="bg-transparent">
              Scan Again
            </Button>
            <Button onClick={onClose} variant="outline" className="bg-transparent">
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
        <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
        <p className="text-xs text-muted-foreground">
          In a production environment, this would use your device's camera to scan real QR codes. This demo simulates
          the scanning process.
        </p>
      </div>
    </div>
  )
}
