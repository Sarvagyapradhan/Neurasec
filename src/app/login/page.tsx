"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Info, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  try {
    const [loading, setLoading] = useState(false);
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [errorDetail, setErrorDetail] = useState('');
    const [errorType, setErrorType] = useState<'username' | 'password' | 'general' | null>(null);
    const [uiVisible, setUiVisible] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
      // Ensure UI is visible
      if (!uiVisible) {
        setUiVisible(true);
      }
    }, [uiVisible]);

    useEffect(() => {
      // Reset error state when user starts typing
      if (usernameOrEmail || password) {
        if (errorType === 'username' && usernameOrEmail) {
          setErrorType(null);
          setError('');
        } else if (errorType === 'password' && password) {
          setErrorType(null);
          setError('');
        }
      }
    }, [usernameOrEmail, password, errorType]);

    const categorizeError = (errorMsg: string, status: number): 'username' | 'password' | 'general' => {
      const lowerError = errorMsg.toLowerCase();
      
      if (status === 404 || lowerError.includes('does not exist') || lowerError.includes('not found')) {
        return 'username';
      } else if (status === 401 || lowerError.includes('incorrect password')) {
        return 'password';
      } else {
        return 'general';
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setErrorDetail('');
      setErrorType(null);

      // Basic validation
      if (!usernameOrEmail) {
        setError('Please enter your username or email');
        setErrorType('username');
        setLoading(false);
        return;
      }

      if (!password) {
        setError('Please enter your password');
        setErrorType('password');
        setLoading(false);
        return;
      }

      try {
        console.log('Attempting login with:', usernameOrEmail);
        const response = await fetch('/api/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username_or_email: usernameOrEmail,
            password,
          }),
        });

        console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('Login response data:', data);

        if (!response.ok) {
          console.error('Login failed:', data);
          // Add better error handling for empty response
          if (!data || Object.keys(data).length === 0) {
            setErrorType('general');
            setError('Login failed. Please check your connection and try again.');
          } else {
            const errorType = categorizeError(data.error, response.status);
            setErrorType(errorType);
            setError(data.error || 'Authentication failed');
            setErrorDetail(data.detail || '');
          }
          
          toast({
            variant: "destructive",
            title: "Login failed",
            description: data.error || 'Authentication failed',
          });
        } else {
          // Success - token should be in the data
          console.log('Login successful with data:', data);
          
          // Format the token for compatibility with AuthProvider
          const token = data.access_token;
          
          if (token) {
            // Store token in localStorage for persistence
            localStorage.setItem("auth_token", token);
            console.log("Token stored in localStorage");
            
            // Also set a cookie for API requests
            document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
            console.log("Token stored in cookie");
            
            // Configure axios auth header for future requests
            try {
              // Import axios dynamically
              import('axios').then(axiosModule => {
                axiosModule.default.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                console.log("Axios header configured");
              });
            } catch (e) {
              console.error("Failed to configure axios:", e);
            }
            
            // Force reload auth context
            if (window.dispatchEvent) {
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'auth_token',
                newValue: token
              }));
            }
          } else {
            console.error("No access token in response:", data);
          }
          
          // Show a success toast
          toast({
            title: "Login successful",
            description: "Redirecting you to dashboard...",
          });
          
          // Navigate to the dashboard with a small delay to allow token processing
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Network error. Please check your connection and try again.');
        setErrorType('general');
        
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Unable to connect to the server. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex h-screen w-full items-center justify-center dark">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 z-[-1]"></div>
        <Card className="w-full max-w-md shadow-lg border-slate-800 bg-slate-900/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">Welcome back</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Enter your credentials to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="username-or-email" 
                  className={errorType === 'username' ? 'text-red-500' : 'text-slate-200'}
                >
                  Username or Email
                </Label>
                <div className="relative">
                  <Input
                    id="username-or-email"
                    placeholder="Enter your username or email"
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className={`${
                      errorType === 'username' 
                        ? 'border-red-500 focus-visible:ring-red-500' 
                        : 'border-slate-700 bg-slate-800/50 text-white'
                    }`}
                    disabled={loading}
                  />
                  {errorType === 'username' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                </div>
                {errorType === 'username' && (
                  <div className="text-sm text-red-500 flex gap-1 items-start mt-1">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className={errorType === 'password' ? 'text-red-500' : 'text-slate-200'}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${
                      errorType === 'password' 
                        ? 'border-red-500 focus-visible:ring-red-500' 
                        : 'border-slate-700 bg-slate-800/50 text-white'
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errorType === 'password' && (
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                </div>
                {errorType === 'password' && (
                  <div className="text-sm text-red-500 flex gap-1 items-start mt-1">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              {errorType === 'general' && (
                <div className="p-3 bg-red-900/30 text-red-300 rounded-md flex items-start gap-2 border border-red-800/50">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{error}</p>
                    {errorDetail && <p className="text-sm opacity-90 mt-1">{errorDetail}</p>}
                  </div>
                </div>
              )}
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error rendering login page:', error);
    // Fallback UI
    return (
      <div className="flex h-screen w-full items-center justify-center dark">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 z-[-1]"></div>
        <Card className="w-full max-w-md shadow-lg border-slate-800 bg-slate-900/80 p-6">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">Login</CardTitle>
            <CardDescription className="text-center text-slate-400">
              There was an error loading the login page. Please try refreshing.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
} 