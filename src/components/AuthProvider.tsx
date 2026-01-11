"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

interface User {
  id: string;
  email: string;
  username: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requiresOTP?: boolean; email?: string; success?: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  token: string | null;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: () => {},
  isAuthenticated: false,
  token: null,
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Refresh auth function to be called when needed
  const refreshAuth = async () => {
    try {
      setLoading(true);
      console.log("[AuthProvider] Refreshing authentication state");
      
      // First try to get from cookie (set by server, more secure)
      let authToken = getCookie("auth_token") as string | undefined;
      
      // Log the token source and status
      if (authToken) {
        console.log("[AuthProvider] Found token in cookie");
      }
      
      // If not in cookie, try localStorage (for client-side login)
      if (!authToken) {
        const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
        authToken = localStorageToken || undefined;
        
        if (authToken) {
          console.log("[AuthProvider] Found token in localStorage");
          
          // If found in localStorage but not in cookie, sync them
          console.log("[AuthProvider] Syncing localStorage token to cookie");
          setCookie("auth_token", authToken, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            httpOnly: false, // Allow JS access for our auth provider
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
          });
        }
      }
      
      if (authToken) {
        console.log("[AuthProvider] Setting up authorization header");
        setToken(authToken);
        
        // Configure axios with auth header
        axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
        
        try {
          // First check if token is valid
          console.log("[AuthProvider] Checking token validity");
          
          // Create a timeout for the fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          try {
            const checkResponse = await fetch(`/api/auth/check-token?token=${encodeURIComponent(authToken)}`, {
                headers: {
                "Authorization": `Bearer ${authToken}`
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            const checkResult = await checkResponse.json();
            
            if (!checkResponse.ok || !checkResult.valid) {
                console.error("[AuthProvider] Token validation failed:", checkResult);
                
                // Auto-cleanup on validation failure
                console.warn("[AuthProvider] Clearing invalid token");
                localStorage.removeItem("auth_token");
                deleteCookie("auth_token");
                setToken(null);
                setUser(null);
                
                // Redirect to login if on protected page
                if (typeof window !== 'undefined' && 
                    (window.location.pathname.startsWith('/dashboard') || 
                    window.location.pathname.startsWith('/admin'))) {
                router.push('/login');
                }
                
                // Stop execution, don't throw an error that crashes the app
                setLoading(false);
                return;
            }
            
            // If token is valid and we have user data, use it
            if (checkResult.user) {
                console.log("[AuthProvider] Setting user from token validation");
                setUser(checkResult.user);
                return; // Exit early since we have the user data
            }
          } catch (fetchError: any) {
              clearTimeout(timeoutId);
              if (fetchError.name === 'AbortError') {
                  console.error("[AuthProvider] Token validation request timed out");
              } else {
                  console.error("[AuthProvider] Token validation request failed:", fetchError);
              }
              // Don't clear token immediately on network error, but stop loading
              setLoading(false);
              return;
          }
          
          // If no user in check result, fetch user profile
          console.log("[AuthProvider] Fetching user profile");
          const response = await fetch("/api/auth/me", {
            headers: {
              "Authorization": `Bearer ${authToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch user profile: ${response.statusText}`);
          }
          
          const userData = await response.json();
          console.log("[AuthProvider] User profile fetched successfully");
          setUser(userData);
        } catch (profileError) {
          console.error("[AuthProvider] Failed to fetch user profile:", profileError);
          
          // Clear invalid auth data
          localStorage.removeItem("auth_token");
          deleteCookie("auth_token");
          setToken(null);
          setUser(null);
          
          // Redirect to login if we're on a protected page
          if (typeof window !== 'undefined' && 
              (window.location.pathname.startsWith('/dashboard') || 
               window.location.pathname.startsWith('/admin'))) {
            router.push('/login');
          }
        }
      } else {
        console.log("[AuthProvider] No auth token found");
        // Ensure user and token state are cleared
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error("[AuthProvider] Auth refresh error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in on component mount
  useEffect(() => {
    // First perform a quick local check for authentication
    const quickAuthCheck = () => {
      try {
        // Check for tokens in localStorage and cookies
        const localToken = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
        const cookieToken = getCookie("auth_token") as string | undefined;
        
        // If we have a token, immediately set it in state to avoid blank screens
        if (localToken || cookieToken) {
          console.log("[AuthProvider] Found token during initial check");
          const tokenToUse = localToken || cookieToken as string;
          if (tokenToUse) {
            setToken(tokenToUse);
            
            // Configure axios with auth header
            axios.defaults.headers.common["Authorization"] = `Bearer ${tokenToUse}`;
            
            // Create minimal user info to enable isAuthenticated
            // This will be updated with complete info when refreshAuth completes
            setUser({
              id: "temp-id",
              email: "loading@user.com",
              username: "Loading User"
            });
            
            // Important: Set loading to false earlier to let UI components render
            // We'll still complete the full refresh in background
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("[AuthProvider] Error in quick auth check:", error);
      }
    };
    
    // Do quick check first
    quickAuthCheck();
    
    // Then do full refresh - now in a setTimeout to allow the UI to render first
    setTimeout(() => {
      refreshAuth();
    }, 100);
    
    // Add event listener to refresh auth on storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        console.log("[AuthProvider] Auth token changed in another tab, refreshing");
        refreshAuth();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      // Safety timeout: ensure loading state doesn't get stuck indefinitely
      const safetyTimeout = setTimeout(() => {
        if (loading) {
            console.warn("[AuthProvider] Safety timeout triggered - forcing loading state to false");
            setLoading(false);
        }
      }, 5000); // 5 seconds max loading time
      
      return () => {
          window.removeEventListener('storage', handleStorageChange);
          clearTimeout(safetyTimeout);
      };
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("[AuthProvider] Attempting login with:", email);
      
      const response = await axios.post("/api/auth/login/", {
        username_or_email: email,
        password,
      });
      
      console.log("[AuthProvider] Login response received:", response.status);

      // Check if this is an OTP verification flow
      if (response.data.message && response.data.message.includes("OTP")) {
        console.log("[AuthProvider] OTP verification required");
        return { requiresOTP: true, email };
      }

      // Extract token and user data from response
      const { token, user } = response.data;

      if (!token) {
        console.error("[AuthProvider] No token received in login response");
        throw new Error("Authentication failed - no token received");
      }

      // Store token in localStorage for persistence
      localStorage.setItem("auth_token", token);
      console.log("[AuthProvider] Token stored in localStorage");
      
      // Also ensure cookie is set
      setCookie("auth_token", token, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: false, // Allow JS access
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
      });
      console.log("[AuthProvider] Token stored in cookie");

      // Update state
      setToken(token);
      
      // Set user data if available
      if (user) {
        setUser(user);
        console.log("[AuthProvider] User data set:", user.email);
      } else {
        // Create minimal user object if not provided in response
        const minimumUser = {
          id: "temp-id",
          email: email,
          username: email.split('@')[0] // Extract username from email
        };
        setUser(minimumUser);
        console.log("[AuthProvider] Set minimal user data");
      }

      // Configure axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("[AuthProvider] Set axios default Authorization header");

      console.log("[AuthProvider] Login successful, user authenticated");
      toast.success("Login successful", {
        description: "Welcome back!"
      });
      
      // Wait just a moment before redirecting to ensure all state is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to dashboard
      console.log("[AuthProvider] Redirecting to dashboard...");
      router.push("/dashboard");
      
      return { success: true };
    } catch (error: any) {
      console.error("[AuthProvider] Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("[AuthProvider] Logging out...");
    
    // Clear auth data
    localStorage.removeItem("auth_token");
    deleteCookie("auth_token");
    setToken(null);
    setUser(null);
    
    // Clear Authorization header
    delete axios.defaults.headers.common["Authorization"];

    toast.success("Logged out", {
      description: "You have been logged out successfully"
    });

    // Redirect to login
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        token,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 