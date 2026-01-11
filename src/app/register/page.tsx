"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    full_name: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please ensure both passwords are identical"
      });
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long"
      });
      return;
    }
    
    if (formData.username.length < 3) {
      toast.error("Username too short", {
        description: "Username must be at least 3 characters long"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Use relative path to call Next.js API route
      const response = await axios.post("/api/auth/register", {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        full_name: formData.full_name || null
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.message && (
          response.data.message.toLowerCase().includes("verify") || 
          response.data.message.toLowerCase().includes("registration successful")
      )) {
        sessionStorage.setItem("verificationEmail", formData.email);
        
        toast.success("Registration Initiated", {
          description: "Please check your email for the verification OTP. Remember to check your spam folder if you don't see it in your inbox.",
          duration: 6000
        });
        
        router.push("/verify?mode=register");
      } else {
        console.warn("Unexpected registration response:", response.data);
        toast.info("Registration Complete?", {
          description: "Registration processed, but couldn't confirm verification step. Redirecting to login."
        });
        router.push("/login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Detailed error logging
      if (error.response) {
        console.error("Error Status:", error.response.status);
        console.error("Error Data:", error.response.data);
      }
      
      let errorDetail = "An unexpected error occurred";
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
           errorDetail = error.response.data;
        } else if (error.response.data.error) {
           errorDetail = error.response.data.error;
        } else if (error.response.data.detail) {
           errorDetail = error.response.data.detail;
        } else {
           // Handle field-specific errors (e.g., { email: ["Invalid email"] })
           const firstField = Object.keys(error.response.data)[0];
           const firstError = error.response.data[firstField];
           if (Array.isArray(firstError)) {
             errorDetail = `${firstField}: ${firstError[0]}`;
           } else {
             errorDetail = JSON.stringify(error.response.data);
           }
        }
      }
      
      toast.error("Registration failed", {
        description: errorDetail
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <AnimatedBackground className="fixed inset-0" />
      <Card className="w-full max-w-md relative z-10 bg-slate-900/60 backdrop-blur-xl border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-100">Create an account</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  placeholder="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 pl-10"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-slate-200">Full Name (Optional)</Label>
              <div className="relative">
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="Your Name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-400">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 