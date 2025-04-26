"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Shield, LockKeyhole } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";

// Main component that uses Suspense
export default function VerifyPageWrapper() {
  return (
    <Suspense fallback={<VerifyPageSkeleton />}>
      <VerifyPage />
    </Suspense>
  );
}

// Skeleton component for the loading state
function VerifyPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="container mx-auto max-w-md z-10 relative">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-500/10 rounded-full">
              <Shield className="h-12 w-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-indigo-400 to-sky-500 bg-clip-text text-transparent">
            Verification
          </h1>
          <p className="mt-2 text-slate-400">
            Loading verification...
          </p>
        </div>
        
        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-slate-100">Security Verification</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Loading verification details...
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main component wrapped in Suspense
function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const { refreshAuth } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    // Get email from session storage
    const email = sessionStorage.getItem("verificationEmail");
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
    } else {
      // Redirect to login if no email in session
      router.push("/login");
    }
  }, [router]);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.otp.length !== 6) {
      toast.error("Invalid OTP", {
        description: "Please enter a valid 6-digit OTP"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Determine the verification endpoint based on mode
      const endpoint = mode === "register" 
        ? "/api/auth/verify-registration/" 
        : "/api/auth/verify-login/";
      
      // Add console logs for debugging
      console.log(`Sending OTP verification to ${endpoint}`, {
        email: formData.email,
        otp: formData.otp
      });
      
      const response = await axios.post(endpoint, {
        email: formData.email,
        otp: formData.otp,
      });
      
      console.log("Verification response:", response.data);
      
      if (response.data.access_token) {
        // Store the token
        localStorage.setItem("auth_token", response.data.access_token);
        
        // Get the stored registration data if available
        const registrationDataStr = sessionStorage.getItem("registrationData");
        
        // If this was registration verification, update the user profile
        if (mode === "register" && registrationDataStr) {
          try {
            const registrationData = JSON.parse(registrationDataStr);
            
            // Clean up session storage
            sessionStorage.removeItem("registrationData");
            sessionStorage.removeItem("verificationEmail");
            
            toast.success("Account verified", {
              description: "Your account has been verified successfully"
            });
            
            // Refresh auth context
            await refreshAuth();
            
            // Redirect to dashboard
            router.push("/dashboard");
          } catch (parseError) {
            console.error("Error parsing registration data:", parseError);
            router.push("/login");
          }
        } else {
          // This was login verification
          toast.success("Login successful", {
            description: "You have been logged in successfully"
          });
          
          // Clean up session storage
          sessionStorage.removeItem("verificationEmail");
          
          // Refresh auth context
          await refreshAuth();
          
          // Redirect to dashboard
          router.push("/dashboard");
        }
      } else {
        toast.error("Verification failed", {
          description: "There was a problem verifying your account. Please try again."
        });
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error("Verification failed", {
        description: error.response?.data?.detail || "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      
      console.log("Resending OTP for email:", formData.email);
      
      const response = await axios.post("/api/auth/send-otp/", {
        email: formData.email,
      });
      
      console.log("Resend OTP response:", response.data);
      
      if (response.data) {
        toast.success("OTP resent", {
          description: "Please check your email for the new verification code"
        });
        
        // Set countdown for 30 seconds
        setCountdown(30);
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP", {
        description: error.response?.data?.detail || "Too many requests. Please try again later."
      });
    } finally {
      setResendLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="container mx-auto max-w-md z-10 relative">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-500/10 rounded-full">
              <Shield className="h-12 w-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-indigo-400 to-sky-500 bg-clip-text text-transparent">
            {mode === "register" ? "Complete Registration" : "Verify Login"}
          </h1>
          <p className="mt-2 text-slate-400">
            Enter the 6-digit code sent to your email address
          </p>
        </div>
        
        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-slate-100">Security Verification</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              We've sent a verification code to {formData.email || "your email"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-200">Verification Code</Label>
                <Input
                  id="otp"
                  name="otp"
                  placeholder="123456"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={formData.otp}
                  onChange={handleChange}
                  className="bg-slate-800/50 border-slate-700 text-slate-100"
                />
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                type="submit" 
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400 mb-2">Didn&apos;t receive a code?</p>
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={resendLoading || countdown > 0}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                >
                  {countdown > 0
                    ? `Resend OTP (${countdown}s)`
                    : resendLoading
                    ? "Sending..."
                    : "Resend OTP"}
                </Button>
                <p className="text-xs text-slate-500 mt-1 italic">
                  Remember to check your spam/junk folder for the OTP email.
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-slate-800/50 pt-4">
            <Button
              variant="link"
              onClick={() => router.push(mode === "register" ? "/register" : "/login")}
              className="text-slate-400 hover:text-slate-200"
            >
              Go back to {mode === "register" ? "registration" : "login"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}