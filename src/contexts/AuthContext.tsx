import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { User, Company, Address, Contact } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isOffline: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, companyName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  retryConnection: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const authListenerRef = useRef<any>(null);
  const { toast } = useToast();

  const transformCompany = (data: any): Company => ({
    name: data.name,
    orgNumber: data.orgNumber,
    vatNumber: data.vatNumber,
    address: data.address as Address,
    contact: data.contact as Contact,
    bankgiro: data.bankgiro,
    plusgiro: data.plusgiro,
    iban: data.iban,
    swish: data.swish,
    accountNumber: data.accountNumber,
    clearingNumber: data.clearingNumber,
    bankName: data.bankName,
    swift: data.swift,
    taxRate: data.taxRate,
    logo: data.logo
  });

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      setIsOffline(false);
      // Automatically retry connection when back online
      if (!user) {
        retryConnection();
      }
    };

    const handleOffline = () => {
      console.log('Network connection lost');
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial offline state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Retry connection function
  const retryConnection = async (): Promise<boolean> => {
    if (connectionAttempts > 3) {
      toast({
        title: "Too Many Attempts",
        description: "Please try again later or check your internet connection.",
        variant: "destructive"
      });
      return false;
    }

    setConnectionAttempts(prev => prev + 1);
    setIsLoading(true);
    
    try {
      console.log('Retrying Supabase connection...');
      // Try to get the session directly without a timeout for retry attempts
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (data?.session) {
        setSession(data.session);
        await fetchUserProfile(data.session);
        setIsOffline(false);
        toast({
          title: "Connection Restored",
          description: "Successfully reconnected to the server.",
        });
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Retry connection failed:', error);
      setIsLoading(false);
      setIsOffline(true);
      toast({
        title: "Connection Failed",
        description: "Could not connect to server. Please check your internet connection.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener with error handling
    const setupAuthListener = async () => {
      try {
        const { data } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Auth state changed:", event);
            
            if (currentSession) {
              setSession(currentSession);
              try {
                await fetchUserProfile(currentSession);
              } catch (error) {
                console.error("Error fetching user profile:", error);
              }
            } else {
              setUser(null);
              setSession(null);
            }
            
            setIsInitializing(false);
            setIsLoading(false);
          }
        );
        
        authListenerRef.current = data;
      } catch (error) {
        console.error("Error setting up auth listener:", error);
        setIsInitializing(false);
        setIsLoading(false);
        setIsOffline(true);
      }
    };

    // Initial session check
    const checkSession = async () => {
      try {
        // Add timeout for session check to prevent infinite waiting
        const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timed out')), 10000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        // Race between session check and timeout
        const { data, error } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (error) {
          console.error("Error checking session:", error);
          setIsOffline(true);
          
          if (navigator.onLine) {
            toast({
              title: "Authentication Error",
              description: "Could not authenticate. Please try signing in again.",
              variant: "destructive"
            });
          }
          return;
        }
        
        if (data?.session) {
          setSession(data.session);
          await fetchUserProfile(data.session);
          setIsOffline(false);
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Exception checking session:", error);
        setIsOffline(true);
        
        if ((error as Error).message === 'Operation timed out') {
          toast({
            title: "Connection Error",
            description: "Request timed out. The service may be temporarily unavailable.",
            variant: "destructive"
          });
        } else if (navigator.onLine) {
          toast({
            title: "Connection Error",
            description: "Could not connect to authentication service. Please try again later.",
            variant: "destructive"
          });
        }
      } finally {
        setIsInitializing(false);
        setIsLoading(false);
      }
    };

    // Setup auth first, then check session
    setupAuthListener().then(() => {
      checkSession();
    });

    // Cleanup function
    return () => {
      if (authListenerRef.current?.subscription) {
        authListenerRef.current.subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userSession: Session) => {
    if (!userSession?.user?.id) {
      console.error('Invalid session or user ID');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userSession.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUser({
          id: userSession.user.id,
          username: data.username,
          email: userSession.user.email || '',
          company: transformCompany(data.company)
        });
      } else {
        console.warn('User profile not found:', userSession.user.id);
      }
    } catch (error) {
      console.error('Exception fetching user profile:', error);
    }
  };

  const refreshUser = async () => {
    if (session) {
      await fetchUserProfile(session);
    }
  };

  const login = async (email: string, password: string) => {
    if (isOffline) {
      toast({
        title: "Offline Mode",
        description: "You appear to be offline. Please check your internet connection and try again.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      // Add timeout to prevent infinite waiting
      const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), 10000)
      );
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Race between auth operation and timeout
      const { data, error } = await Promise.race([authPromise, timeoutPromise]);

      if (error) {
        console.error('Login error details:', {
          message: error.message,
          status: (error as AuthError)?.status || 'unknown',
          name: error.name
        });
        
        toast({
          title: "Authentication Failed",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive"
        });
        
        setIsLoading(false);
        return false;
      }

      console.log('Login successful:', data);
      
      toast({
        title: "Login Successful",
        description: "You are now logged in",
      });
      
      setIsOffline(false);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login exception:', error);
      
      // Check if it's a network error
      if (!navigator.onLine) {
        setIsOffline(true);
        toast({
          title: "Network Error",
          description: "You are offline. Please check your internet connection and try again.",
          variant: "destructive"
        });
      } else if ((error as Error).message === 'Operation timed out') {
        toast({
          title: "Connection Error",
          description: "Request timed out. The service may be temporarily unavailable.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (email: string, password: string, companyName: string) => {
    if (isOffline) {
      toast({
        title: "Offline Mode",
        description: "You appear to be offline. Please check your internet connection and try again.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      // Add timeout to prevent infinite waiting
      const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), 10000)
      );
      
      const authPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName
          },
          emailRedirectTo: window.location.origin
        }
      });
      
      // Race between auth operation and timeout
      const { data, error } = await Promise.race([authPromise, timeoutPromise]);

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        
        setIsLoading(false);
        return false;
      }

      // Automatically sign in after successful registration
      if (data && data.user) {
        const loginRes = await login(email, password);
        
        if (loginRes) {
          toast({
            title: "Account Created",
            description: "Your account has been created and you are now logged in.",
          });
          
          return true;
        }
      }

      toast({
        title: "Account Created",
        description: "Your account has been created. You can now log in.",
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup exception:', error);
      
      // Check if it's a network error
      if (!navigator.onLine) {
        setIsOffline(true);
        toast({
          title: "Network Error",
          description: "You are offline. Please check your internet connection and try again.",
          variant: "destructive"
        });
      } else if ((error as Error).message === 'Operation timed out') {
        toast({
          title: "Connection Error",
          description: "Request timed out. The service may be temporarily unavailable.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Error",
          description: "Could not create account. Please try again later.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged Out",
        description: "You have been logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      toast({
        title: "Logout Error",
        description: "Could not log out. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAuthenticated: !!user,
      isOffline,
      isInitializing,
      login, 
      signup,
      logout,
      refreshUser,
      retryConnection
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
