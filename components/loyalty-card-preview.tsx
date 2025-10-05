import type { LoyaltyCard } from "@/lib/mock-data"
import { QRCodeSVG } from "qrcode.react"

interface LoyaltyCardPreviewProps {
  config: LoyaltyCard
  currentStamps: number
  qrCode?: string
}

export function LoyaltyCardPreview({ config, currentStamps, qrCode = "DEMO_QR_CODE" }: LoyaltyCardPreviewProps) {
  const stamps = Array.from({ length: config.stampsRequired }, (_, i) => i < currentStamps)

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className="rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
      >
        {/* Card Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {config.logoUrl && (
                <img
                  src={config.logoUrl || "/placeholder.svg"}
                  alt={`${config.businessName} logo`}
                  className="w-12 h-12 object-contain rounded-lg bg-white/20 p-1"
                />
              )}
              <h3 className="text-2xl font-bold">{config.businessName}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              {config.stampIcon}
            </div>
          </div>
          <p className="text-sm opacity-90">Loyalty Rewards Card</p>
        </div>

        {/* Stamps Grid */}
        <div className="px-6 py-4 bg-white/10">
          <div className="grid grid-cols-5 gap-3 mb-3">
            {stamps.map((filled, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg flex items-center justify-center text-2xl transition-all"
                style={{
                  backgroundColor: filled ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
                  border: filled ? "2px solid rgba(255, 255, 255, 0.5)" : "2px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {filled && config.stampIcon}
              </div>
            ))}
          </div>
          <p className="text-center text-sm opacity-90">
            {currentStamps} / {config.stampsRequired} stamps
          </p>
        </div>

        {/* Reward Info */}
        <div className="px-6 py-4 bg-white/5">
          <p className="text-xs opacity-75 mb-1">Reward</p>
          <p className="font-semibold">{config.rewardDescription}</p>
        </div>

        {/* QR Code */}
        <div className="p-6 flex justify-center bg-white">
          <QRCodeSVG value={qrCode} size={120} level="M" />
        </div>
      </div>
    </div>
  )
}
