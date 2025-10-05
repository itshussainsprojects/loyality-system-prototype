"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Gift, Mail } from "lucide-react"
import Link from "next/link"
import { getCustomerByContact, setCurrentUser, initializeStorage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export default function CustomerLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<"input" | "otp">("input")
  const [contact, setContact] = useState("")
  const [otp, setOtp] = useState("")
  const [foundCustomer, setFoundCustomer] = useState<any>(null)

  useEffect(() => {
    initializeStorage()
  }, [])

  const handleSendOTP = () => {
    const customer = getCustomerByContact(contact)
    if (!customer) {
      toast({
        title: "Account Not Found",
        description: "No account found with this email or phone. Please sign up first.",
        variant: "destructive",
      })
      return
    }

    setFoundCustomer(customer)
    setStep("otp")
    toast({
      title: "Verification Code Sent",
      description: `We've sent a code to ${contact}`,
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

    if (foundCustomer) {
      setCurrentUser(foundCustomer.id)
      toast({
        title: "Welcome Back!",
        description: `Logged in as ${foundCustomer.name}`,
      })
      setTimeout(() => {
        router.push("/customer")
      }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Gift className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to LoyaltyHub</h1>
          <p className="text-muted-foreground">Sign in to access your loyalty rewards</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{step === "input" ? "Sign In" : "Verify OTP"}</CardTitle>
            <CardDescription>
              {step === "input"
                ? "Enter your email or phone number to continue"
                : "Enter the verification code (any 6 digits for demo)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "input" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Email or Phone Number</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contact"
                      placeholder="email@example.com or +1 234 567 8900"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button onClick={handleSendOTP} className="w-full" disabled={!contact}>
                  Send Verification Code
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  New customer?{" "}
                  <Link href="/customer/signup" className="text-primary hover:underline">
                    Create an account
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
                </div>

                <Button onClick={handleVerifyOTP} className="w-full" disabled={otp.length !== 6}>
                  Verify & Continue
                </Button>

                <Button variant="ghost" onClick={() => setStep("input")} className="w-full">
                  Use different contact
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
