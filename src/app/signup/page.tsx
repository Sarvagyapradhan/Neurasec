'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Info, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type FieldError = {
  field: 'username' | 'email' | 'password' | 'confirmPassword' | 'general';
  message: string;
};

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const clearFieldError = (field: FieldError['field']) => {
    setErrors(errors.filter(error => error.field !== field));
  };

  const handleInputChange = (field: FieldError['field'], value: string) => {
    switch (field) {
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    clearFieldError(field);
    if (generalError) setGeneralError('');
  };

  const validateForm = (): boolean => {
    const newErrors: FieldError[] = [];
    
    if (!username.trim()) {
      newErrors.push({ field: 'username', message: 'Username is required' });
    } else if (username.length < 3) {
      newErrors.push({ field: 'username', message: 'Username must be at least 3 characters' });
    }
    
    if (!email.trim()) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
    
    if (!password) {
      newErrors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 8) {
      newErrors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }
    
    if (password !== confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setGeneralError('');
    
    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          password_confirm: confirmPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Registration failed:', data);
        
        // Handle field-specific errors
        if (data.field) {
          setErrors([...errors.filter(e => e.field !== data.field), 
            { field: data.field as FieldError['field'], message: data.error }
          ]);
        } else {
          setGeneralError(data.error || 'Registration failed. Please try again.');
        }
        
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: data.error || "Could not create your account",
        });
      } else {
        // Success
        setSuccess(true);
        
        // Store email for verification
        sessionStorage.setItem("verificationEmail", email);
        
        toast({
          title: "Registration successful",
          description: "Please check your email for the verification OTP",
        });
        
        // Redirect to verification page instead of login
        setTimeout(() => {
          router.push(`/verify?mode=register&email=${encodeURIComponent(email)}`);
        }, 3000);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setGeneralError('Network error. Please check your connection and try again.');
      
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorForField = (field: FieldError['field']): string | null => {
    const error = errors.find(e => e.field === field);
    return error ? error.message : null;
  };

  return (
    <div className="flex h-screen w-full items-center justify-center dark">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 z-[-1]"></div>
      <Card className="w-full max-w-md shadow-lg border-slate-800 bg-slate-900/80">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Create an account</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Enter your information to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="p-4 bg-green-900/30 text-green-300 rounded-md flex items-start gap-2 border border-green-800/50">
              <Check size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Registration successful!</p>
                <p className="text-sm mt-1">We&apos;ve sent a verification code to your email. Please check your inbox (and spam folder).</p>
                <p className="text-sm mt-2">Redirecting to verification page...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="username" 
                  className={getErrorForField('username') ? 'text-red-500' : 'text-slate-200'}
                >
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    type="text"
                    value={username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={getErrorForField('username') 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : 'border-slate-700 bg-slate-800/50 text-white'
                    }
                    disabled={loading}
                  />
                  {getErrorForField('username') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                </div>
                {getErrorForField('username') && (
                  <div className="text-sm text-red-500 flex gap-1 items-start mt-1">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{getErrorForField('username')}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className={getErrorForField('email') ? 'text-red-500' : 'text-slate-200'}
                >
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    placeholder="your@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={getErrorForField('email') 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : 'border-slate-700 bg-slate-800/50 text-white'
                    }
                    disabled={loading}
                  />
                  {getErrorForField('email') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                </div>
                {getErrorForField('email') && (
                  <div className="text-sm text-red-500 flex gap-1 items-start mt-1">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{getErrorForField('email')}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className={getErrorForField('password') ? 'text-red-500' : 'text-slate-200'}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Create a password"
                    type="password"
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={getErrorForField('password') 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : 'border-slate-700 bg-slate-800/50 text-white'
                    }
                    disabled={loading}
                  />
                  {getErrorForField('password') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                </div>
                {getErrorForField('password') && (
                  <div className="text-sm text-red-500 flex gap-1 items-start mt-1">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{getErrorForField('password')}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="confirmPassword" 
                  className={getErrorForField('confirmPassword') ? 'text-red-500' : 'text-slate-200'}
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={getErrorForField('confirmPassword') 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : 'border-slate-700 bg-slate-800/50 text-white'
                    }
                    disabled={loading}
                  />
                  {getErrorForField('confirmPassword') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                </div>
                {getErrorForField('confirmPassword') && (
                  <div className="text-sm text-red-500 flex gap-1 items-start mt-1">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{getErrorForField('confirmPassword')}</span>
                  </div>
                )}
              </div>
              
              {generalError && (
                <div className="p-3 bg-red-900/30 text-red-300 rounded-md flex items-start gap-2 border border-red-800/50">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{generalError}</p>
                  </div>
                </div>
              )}
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
              
              <p className="text-xs text-center text-slate-400 mt-3">
                By creating an account, you agree to our <Link href="/terms" className="text-blue-400 hover:text-blue-300 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-400 hover:text-blue-300 hover:underline">Privacy Policy</Link>
              </p>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 