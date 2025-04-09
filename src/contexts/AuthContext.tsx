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
  const initializationCompleted = useRef(false);
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
      // Try to get the session directly using the client's built-in timeout
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
      
      if ((error as any)?.name === 'AbortError') {
        toast({
          title: "Connection Failed",
          description: "Request timed out. The service may be temporarily unavailable.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to server. Please check your internet connection.",
          variant: "destructive"
        });
      }
      
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      // Prevent multiple initializations
      if (initializationCompleted.current) {
        return;
      }
      
      try {
        console.log("Starting auth initialization");
        
        // First, check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (sessionData?.session) {
          console.log("Found existing session:", sessionData.session.user.id);
          if (isMounted) {
            setSession(sessionData.session);
            try {
              await fetchUserProfile(sessionData.session);
            } catch (profileError) {
              console.error("Error fetching initial profile:", profileError);
              if (sessionData.session.user && isMounted) {
                setUser({
                  id: sessionData.session.user.id,
                  username: sessionData.session.user.email?.split('@')[0] || 'User',
                  email: sessionData.session.user.email || '',
                  company: null
                });
              }
            }
          }
        }
        
        // Set up auth listener only after initial session check
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event, currentSession?.user?.id);
          
          if (isMounted) {
            if (currentSession) {
              setSession(currentSession);
              try {
                await fetchUserProfile(currentSession);
              } catch (error) {
                console.error("Error in auth listener profile fetch:", error);
                if (currentSession.user) {
                  setUser({
                    id: currentSession.user.id,
                    username: currentSession.user.email?.split('@')[0] || 'User',
                    email: currentSession.user.email || '',
                    company: null
                  });
                }
              }
            } else {
              setUser(null);
              setSession(null);
            }
          }
        });
        
        authListenerRef.current = listener;
        
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) {
          setIsOffline(true);
          if (navigator.onLine) {
            toast({
              title: "Authentication Error",
              description: "Could not initialize authentication. Please try again.",
              variant: "destructive"
            });
          }
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
          setIsLoading(false);
          initializationCompleted.current = true;
        }
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
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
    
    console.log(`Fetching profile for user: ${userSession.user.id}`);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userSession.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Still set basic user information even if profile fetch fails
        setUser({
          id: userSession.user.id,
          username: userSession.user.email?.split('@')[0] || 'User',
          email: userSession.user.email || '',
          company: null
        });
        
        return;
      }

      if (data) {
        console.log('Profile data retrieved successfully');
        setUser({
          id: userSession.user.id,
          username: data.username || userSession.user.email?.split('@')[0] || 'User',
          email: userSession.user.email || '',
          company: data.company ? transformCompany(data.company) : null
        });
      } else {
        console.warn('User profile not found:', userSession.user.id);
        
        // Set basic user info if profile doesn't exist
        setUser({
          id: userSession.user.id,
          username: userSession.user.email?.split('@')[0] || 'User',
          email: userSession.user.email || '',
          company: null
        });
      }
    } catch (error) {
      console.error('Exception fetching user profile:', error);
      
      // Still set basic user information even if profile fetch fails
      setUser({
        id: userSession.user.id,
        username: userSession.user.email?.split('@')[0] || 'User',
        email: userSession.user.email || '',
        company: null
      });
    }
  };

  const refreshUser = async () => {
    if (!session) {
      console.log('No session available for refresh');
      return;
    }

    try {
      console.log('Starting user refresh...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error in refreshUser:', error);
        // Don't throw, just set basic user info
        if (session.user) {
          setUser({
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            company: user?.company || null // Keep existing company data if available
          });
        }
        return;
      }

      if (data) {
        console.log('Profile refresh successful');
        setUser({
          id: session.user.id,
          username: data.username || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          company: data.company ? transformCompany(data.company) : null
        });
      }
    } catch (error) {
      console.error('Exception in refreshUser:', error);
      // Don't throw, just keep existing user data
      if (session.user && !user) {
        setUser({
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          company: user?.company || null // Keep existing company data if available
        });
      }
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
    
    // Clear any existing state that might interfere with the login
    setIsInitializing(false);
    
    try {
      console.log('Attempting login for:', email);
      
      // Remove the manual timeout logic and directly use the supabase client's built-in timeout
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

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

      console.log('Login successful:', data.user?.id);
      
      // Ensure we have the session and user data before proceeding
      if (data.session) {
        setSession(data.session);
        
        // Wait for fetchUserProfile to complete
        try {
          await fetchUserProfile(data.session);
        } catch (profileError) {
          console.error('Error fetching user profile after login:', profileError);
          // Continue with login even if profile fetch fails
        }
      }
      
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
      } else if ((error as any)?.name === 'AbortError') {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        
        setIsLoading(false);
        return false;
      }

      // Check if signup was successful
      if (data && data.user) {
        toast({
          title: "Account Created",
          description: "Please check your email to confirm your account before logging in.",
        });
        
        setIsLoading(false);
        return true;
      }

      toast({
        title: "Registration Error",
        description: "Could not create account. Please try again later.",
        variant: "destructive"
      });
      
      setIsLoading(false);
      return false;
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
      } else if ((error as any)?.name === 'AbortError') {
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
      console.log("Logout function called");
      
      // Clear any local storage data first
      localStorage.removeItem('faktura-smooth-auth');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      localStorage.removeItem('sb-expires-at');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        throw error;
      }
      
      // Update state
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged Out",
        description: "You have been logged out",
      });
      
      // Redirect to login page - safe way to redirect
      window.location.href = '/login';
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
