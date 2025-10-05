"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Gift, User, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { addCustomer, generateId, generateQRCode, setCurrentUser, initializeStorage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export default function CustomerSignup() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<"details" | "otp">("details")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [otp, setOtp] = useState("")

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }
    // Simulate sending OTP
    setStep("otp")
    toast({
      title: "Verification Code Sent",
      description: `We've sent a code to ${formData.phone}`,
    })
  }

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      })
      return
    }

    // Initialize storage
    initializeStorage()

    // Create new customer
    const customerId = generateId("cust")
    const newCustomer = {
      id: customerId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      stamps: 0,
      totalStamps: 0,
      rewardsRedeemed: 0,
      joinedDate: new Date().toISOString().split("T")[0],
      lastVisit: new Date().toISOString().split("T")[0],
      qrCode: generateQRCode(customerId),
    }

    addCustomer(newCustomer)
    setCurrentUser(customerId)

    toast({
      title: "Account Created!",
      description: "Welcome to LoyaltyHub. Your digital card is ready!",
    })

    setTimeout(() => {
      router.push("/customer")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Gift className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">Join LoyaltyHub and start earning rewards</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{step === "details" ? "Your Information" : "Verify Your Phone"}</CardTitle>
            <CardDescription>
              {step === "details"
                ? "Enter your details to create your loyalty account"
                : "Enter the verification code sent to your phone"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "details" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Continue
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/customer/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground text-center">For demo purposes, enter any 6-digit code</p>
                </div>

                <Button onClick={handleVerifyOTP} className="w-full" disabled={otp.length !== 6}>
                  Verify & Create Account
                </Button>

                <Button variant="ghost" onClick={() => setStep("details")} className="w-full">
                  Change phone number
                </Button>

                <div className="text-center">
                  <Button variant="link" className="text-sm text-muted-foreground">
                    Resend code
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
