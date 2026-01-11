&apos;use client&apos;;

import { useState } from &apos;react&apos;;
import Link from &apos;next/link&apos;;
import { useRouter } from &apos;next/navigation&apos;;
import { Button } from &apos;@/components/ui/button&apos;;
import { Input } from &apos;@/components/ui/input&apos;;
import { Label } from &apos;@/components/ui/label&apos;;
import { useToast } from &apos;@/components/ui/use-toast&apos;;
import { AlertCircle, Info, Check } from &apos;lucide-react&apos;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &apos;@/components/ui/card&apos;;

type FieldError = {
  field: &apos;username&apos; | &apos;email&apos; | &apos;password&apos; | &apos;confirmPassword&apos; | &apos;general&apos;;
  message: string;
};

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(&apos;&apos;);
  const [email, setEmail] = useState(&apos;&apos;);
  const [password, setPassword] = useState(&apos;&apos;);
  const [confirmPassword, setConfirmPassword] = useState(&apos;&apos;);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [generalError, setGeneralError] = useState(&apos;&apos;);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const clearFieldError = (field: FieldError[&apos;field&apos;]) => {
    setErrors(errors.filter(error => error.field !== field));
  };

  const handleInputChange = (field: FieldError[&apos;field&apos;], value: string) => {
    switch (field) {
      case &apos;username&apos;:
        setUsername(value);
        break;
      case &apos;email&apos;:
        setEmail(value);
        break;
      case &apos;password&apos;:
        setPassword(value);
        break;
      case &apos;confirmPassword&apos;:
        setConfirmPassword(value);
        break;
    }
    clearFieldError(field);
    if (generalError) setGeneralError(&apos;&apos;);
  };

  const validateForm = (): boolean => {
    const newErrors: FieldError[] = [];
    
    if (!username.trim()) {
      newErrors.push({ field: &apos;username&apos;, message: &apos;Username is required&apos; });
    } else if (username.length < 3) {
      newErrors.push({ field: &apos;username&apos;, message: &apos;Username must be at least 3 characters&apos; });
    }
    
    if (!email.trim()) {
      newErrors.push({ field: &apos;email&apos;, message: &apos;Email is required&apos; });
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push({ field: &apos;email&apos;, message: &apos;Please enter a valid email address&apos; });
    }
    
    if (!password) {
      newErrors.push({ field: &apos;password&apos;, message: &apos;Password is required&apos; });
    } else if (password.length < 8) {
      newErrors.push({ field: &apos;password&apos;, message: &apos;Password must be at least 8 characters&apos; });
    }
    
    if (password !== confirmPassword) {
      newErrors.push({ field: &apos;confirmPassword&apos;, message: &apos;Passwords do not match&apos; });
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
    setGeneralError(&apos;&apos;);
    
    try {
      const response = await fetch(&apos;/api/auth/register/&apos;, {
        method: &apos;POST&apos;,
        headers: {
          &apos;Content-Type&apos;: &apos;application/json&apos;,
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
        console.error(&apos;Registration failed:&apos;, data);
        
        // Handle field-specific errors
        if (data.field) {
          setErrors([...errors.filter(e => e.field !== data.field), 
            { field: data.field as FieldError[&apos;field&apos;], message: data.error }
          ]);
        } else {
          setGeneralError(data.error || &apos;Registration failed. Please try again.&apos;);
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
      console.error(&apos;Fetch error:&apos;, err);
      setGeneralError(&apos;Network error. Please check your connection and try again.&apos;);
      
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorForField = (field: FieldError[&apos;field&apos;]): string | null => {
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
                  className={getErrorForField(&apos;username&apos;) ? &apos;text-red-500&apos; : &apos;text-slate-200&apos;}
                >
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    type="text"
                    value={username}
                    onChange={(e) => handleInputChange(&apos;username&apos;, e.target.value)}
                    className={getErrorForField(&apos;username&apos;) 
                      ? &apos;border-red-500 focus-visible:ring-red-500&apos; 
                      : &apos;border-slate-700 bg-slate-800/50 text-white&apos;
                    }
                    disabled={loading}
                  />
                  {getErrorForField(&apos;username&apos;) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                </div>
                {getErrorForField(&apos;username&apos;) && (
                  <div className="text-sm text-red-500 flex gap-1 items-start mt-1">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{getErrorForField(&apos;username&apos;)}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className={getErrorForField(&apos;email&apos;) ? &apos;text-red-500&apos; : &apos;text-slate-200&apos;}
                >
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    placeholder="your@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => handleInputChange(&apos;email&apos;, e.target.value)}
                    className={getErrorForField(&apos;email&apos;) 
                      ? &apos;border-red-500 focus-visible:ring-red-500&apos; 
                      : &apos;border-slate-700 bg-slate-800/50 text-white&apos;
                    }
                    disabled={loading}
                  />
                  {getErrorForField(&apos;email&apos;) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                </div>
                {getErrorForField(&apos;email&apos;) && (
                  <div className="text-sm text-red-500 flex gap-1 items-start mt-1">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{getErrorForField(&apos;email&apos;)}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className={getErrorForField(&apos;password&apos;) ? &apos;text-red-500&apos; : &apos;text-slate-200&apos;}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Create a password"
                    type="password"
                    value={password}
                    onChange={(e) => handleInputChange(&apos;password&apos;, e.target.value)}
                    className={getErrorForField(&apos;password&apos;) 
                      ? &apos;border-red-500 focus-visible:ring-red-500&apos; 
                      : &apos;border-slate-700 bg-slate-800/50 text-white&apos;
                    }
                    disabled={loading}
                  />
                  {getErrorForField(&apos;password&apos;) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                </div>
                {getErrorForField(&apos;password&apos;) && (
                  <div className="text-sm text-red-500 flex gap-1 items-start mt-1">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{getErrorForField(&apos;password&apos;)}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="confirmPassword" 
                  className={getErrorForField(&apos;confirmPassword&apos;) ? &apos;text-red-500&apos; : &apos;text-slate-200&apos;}
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleInputChange(&apos;confirmPassword&apos;, e.target.value)}
                    className={getErrorForField(&apos;confirmPassword&apos;) 
                      ? &apos;border-red-500 focus-visible:ring-red-500&apos; 
                      : &apos;border-slate-700 bg-slate-800/50 text-white&apos;
                    }
                    disabled={loading}
                  />
                  {getErrorForField(&apos;confirmPassword&apos;) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle size={18} />
                    </div>
                  )}
                </div>
                {getErrorForField(&apos;confirmPassword&apos;) && (
                  <div className="text-sm text-red-500 flex gap-1 items-start mt-1">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{getErrorForField(&apos;confirmPassword&apos;)}</span>
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
                {loading ? &apos;Creating account...&apos; : &apos;Create account&apos;}
              </Button>
              
              <p className="text-xs text-center text-slate-400 mt-3">
                By creating an account, you agree to our <Link href="/terms" className="text-blue-400 hover:text-blue-300 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-400 hover:text-blue-300 hover:underline">Privacy Policy</Link>
              </p>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-slate-400">
            Already have an account?{&apos; &apos;}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 