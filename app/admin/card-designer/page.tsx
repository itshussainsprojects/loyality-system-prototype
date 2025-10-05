"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoyaltyCardPreview } from "@/components/loyalty-card-preview"
import { ImageIcon, Save, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCardConfig, updateCardConfig, initializeStorage } from "@/lib/storage"

export default function CardDesignerPage() {
  const [cardConfig, setCardConfig] = useState(getCardConfig())
  const [logoPreview, setLogoPreview] = useState<string | null>(cardConfig.logoUrl || null)
  const { toast } = useToast()

  useEffect(() => {
    initializeStorage()
    const config = getCardConfig()
    setCardConfig(config)
    if (config.logoUrl) {
      setLogoPreview(config.logoUrl)
    }
  }, [])

  const updateConfig = (key: string, value: string | number) => {
    setCardConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        updateConfig("logoUrl", result)
        toast({
          title: "Logo Uploaded",
          description: "Your logo has been added to the card design.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    updateCardConfig(cardConfig)
    toast({
      title: "Design Saved!",
      description: "Your loyalty card design has been updated successfully.",
    })
  }

  const handleReset = () => {
    const defaultCard = {
      id: "card_default",
      businessName: "Coffee Haven",
      backgroundColor: "#10b981",
      textColor: "#ffffff",
      stampsRequired: 10,
      rewardDescription: "Free Coffee",
      stampIcon: "☕",
      logoUrl: "",
    }
    setCardConfig(defaultCard)
    setLogoPreview(null)
    toast({
      title: "Design Reset",
      description: "Card design has been reset to defaults.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Card Designer</h1>
          <p className="text-muted-foreground">Customize your loyalty card to match your brand identity.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Design Controls */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Customize Your Card</CardTitle>
                <CardDescription>Adjust colors, text, and stamps to create your perfect loyalty card</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="branding" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="branding">Branding</TabsTrigger>
                    <TabsTrigger value="colors">Colors</TabsTrigger>
                    <TabsTrigger value="rewards">Rewards</TabsTrigger>
                  </TabsList>

                  <TabsContent value="branding" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={cardConfig.businessName}
                        onChange={(e) => updateConfig("businessName", e.target.value)}
                        placeholder="Your Business Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stampIcon">Stamp Icon</Label>
                      <Input
                        id="stampIcon"
                        value={cardConfig.stampIcon}
                        onChange={(e) => updateConfig("stampIcon", e.target.value)}
                        placeholder="Enter emoji or icon"
                        maxLength={2}
                      />
                      <p className="text-xs text-muted-foreground">Use an emoji that represents your business</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Logo Upload</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        {logoPreview ? (
                          <div className="space-y-2">
                            <img
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo preview"
                              className="w-20 h-20 mx-auto object-contain"
                            />
                            <p className="text-sm text-muted-foreground">Logo uploaded successfully</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLogoPreview(null)
                                updateConfig("logoUrl", "")
                              }}
                            >
                              Remove Logo
                            </Button>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">Upload your logo</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        {!logoPreview && (
                          <label htmlFor="logo-upload">
                            <Button variant="outline" size="sm" className="bg-transparent" type="button" asChild>
                              <span className="cursor-pointer">Choose File</span>
                            </Button>
                          </label>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="colors" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={cardConfig.backgroundColor}
                          onChange={(e) => updateConfig("backgroundColor", e.target.value)}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          value={cardConfig.backgroundColor}
                          onChange={(e) => updateConfig("backgroundColor", e.target.value)}
                          placeholder="#10b981"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={cardConfig.textColor}
                          onChange={(e) => updateConfig("textColor", e.target.value)}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          value={cardConfig.textColor}
                          onChange={(e) => updateConfig("textColor", e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Quick Presets</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { bg: "#10b981", text: "#ffffff", name: "Emerald" },
                          { bg: "#7c3aed", text: "#ffffff", name: "Purple" },
                          { bg: "#f59e0b", text: "#ffffff", name: "Amber" },
                          { bg: "#ef4444", text: "#ffffff", name: "Red" },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              updateConfig("backgroundColor", preset.bg)
                              updateConfig("textColor", preset.text)
                            }}
                            className="aspect-square rounded-lg border-2 border-transparent hover:border-primary transition-colors"
                            style={{ backgroundColor: preset.bg }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="rewards" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="stampsRequired">Stamps Required for Reward</Label>
                      <Input
                        id="stampsRequired"
                        type="number"
                        min="1"
                        max="20"
                        value={cardConfig.stampsRequired}
                        onChange={(e) => updateConfig("stampsRequired", Number.parseInt(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">How many stamps needed to earn a reward</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rewardDescription">Reward Description</Label>
                      <Input
                        id="rewardDescription"
                        value={cardConfig.rewardDescription}
                        onChange={(e) => updateConfig("rewardDescription", e.target.value)}
                        placeholder="e.g., Free Coffee, 20% Off"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button className="flex-1" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Design
                  </Button>
                  <Button variant="outline" className="bg-transparent" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your card will look to customers</CardDescription>
              </CardHeader>
              <CardContent>
                <LoyaltyCardPreview config={cardConfig} currentStamps={7} />

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Preview Notes</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>Card will appear in customer mobile wallets</li>
                    <li>QR code is generated automatically for each customer</li>
                    <li>Stamps update in real-time when scanned</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
