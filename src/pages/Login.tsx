import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, WifiOff, RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { checkSupabaseConnection, supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const { login, signup, isAuthenticated, isOffline, isInitializing, retryConnection, session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [isRetrying, setIsRetrying] = useState(false);
  const [forceReady, setForceReady] = useState(false);
  const [redirectPending, setRedirectPending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const redirectAttemptCount = useRef(0);
  const lastRedirectTime = useRef(0);
  const redirectTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState<{
    checked: boolean;
    ok: boolean;
    message: string;
  }>({
    checked: false,
    ok: false,
    message: ''
  });
  
  // Clear any pending redirects on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);
  
  // Force logout function to handle stuck states
  const handleForceLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Force clear any auth data
      localStorage.removeItem('faktura-smooth-auth');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-expires-at');
      
      // Force sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Logout from our auth context
      await logout();
      
      // Reset state
      setForceReady(true);
      
      toast({
        title: "Logged out",
        description: "Successfully cleared auth state",
      });
      
      // Reload the page after logout to ensure clean state
      window.location.reload();
    } catch (err) {
      console.error("Force logout error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  // Handle session-based redirect
  useEffect(() => {
    // Skip if already redirecting or no session
    if (!session || redirectPending || isInitializing) {
      return;
    }
    
    // Prevent rapid redirect attempts
    const now = Date.now();
    if (now - lastRedirectTime.current < 5000) {
      redirectAttemptCount.current += 1;
      
      if (redirectAttemptCount.current > 3) {
        console.error("Detected redirect loop, forcing logout");
        handleForceLogout();
        return;
      }
    } else {
      redirectAttemptCount.current = 1;
    }
    
    lastRedirectTime.current = now;
    
    console.log('Session detected, preparing redirect to app');
    setRedirectPending(true);
    
    // Use a timeout to ensure state updates have propagated
    redirectTimeoutRef.current = setTimeout(() => {
      // Double check auth state before redirect
      if (session && !isInitializing) {
        console.log('Executing redirect to app');
        window.location.href = '/app';
      } else {
        setRedirectPending(false);
      }
    }, 1000);
    
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [session, isInitializing, redirectPending]);
  
  // Handle successful authentication redirect
  useEffect(() => {
    if (isAuthenticated && !redirectPending && !isInitializing) {
      console.log('Auth confirmed, redirecting to app');
      setRedirectPending(true);
      window.location.href = '/app';
    }
  }, [isAuthenticated, redirectPending, isInitializing]);
  
  // Extract tab from URL query parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    }
  }, [location]);
  
  // Check Supabase health on mount, but only once
  useEffect(() => {
    let isMounted = true;
    
    const checkHealth = async () => {
      // Skip health check if we're likely to be in a broken state
      if (document.visibilityState === 'hidden') {
        console.log('Page not visible, skipping health check');
        return;
      }
      
      try {
        const health = await checkSupabaseConnection();
        
        // Only update state if component is still mounted
        if (isMounted) {
          if (health.ok) {
            setConnectionStatus({
              checked: true,
              ok: true,
              message: `Connected to Supabase (${health.elapsed}ms)`
            });
          } else {
            setConnectionStatus({
              checked: true,
              ok: false,
              message: 'Could not connect to Supabase service'
            });
          }
        }
      } catch (error) {
        console.error('Health check error:', error);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setConnectionStatus({
            checked: true,
            ok: false,
            message: `Connection error: ${(error as Error)?.message || 'Unknown error'}`
          });
        }
      }
    };
    
    // Run health check once on mount
    checkHealth();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Emergency hard reload handler
  const handleHardReset = () => {
    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Add a flag to prevent the infinite loop
    sessionStorage.setItem('manual_reset', 'true');
    
    // Hard reload
    window.location.href = '/';
  };
  
  // Force component to render after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitializing) {
        console.log("Auth initialization taking too long, forcing ready state");
        setForceReady(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isInitializing]);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Render loader while redirecting to avoid flashing the login form
  if (redirectPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-invoice-700 mb-4" />
            <p className="text-gray-600">Redirecting to dashboard...</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleHardReset}
              className="mt-4"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Cancel redirect
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setError('');
    try {
      // First check Supabase health
      const health = await checkSupabaseConnection();
      setConnectionStatus({
        checked: true,
        ok: health.ok,
        message: health.ok 
          ? `Connected to Supabase (${health.elapsed}ms)` 
          : 'Could not connect to Supabase service'
      });
      
      // Then try to retry auth connection
      const success = await retryConnection();
      if (!success) {
        setError('Still unable to connect. Please check your internet connection.');
      }
    } catch (err) {
      console.error("Retry connection error:", err);
      setError('An error occurred while trying to reconnect.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        setRedirectPending(true);
        console.log('Login successful, will redirect soon');
        // The useEffect will handle redirecting to ensure state is updated properly
      } else {
        // Error message is handled by the AuthContext toast
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setError('');
    
    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (signupData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await signup(
        signupData.email, 
        signupData.password, 
        signupData.companyName
      );
      
      if (success) {
        setRedirectPending(true);
        console.log('Signup successful, will redirect soon');
        // The useEffect will handle redirecting to ensure state is updated properly
        
        // Clear the form
        setSignupData({
          email: '',
          password: '',
          confirmPassword: '',
          companyName: ''
        });
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while initializing auth but not if it's taking too long
  if (isInitializing && !forceReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-invoice-100 mb-2">
              <FileText className="h-6 w-6 text-invoice-700" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">FakturaSmooth</CardTitle>
            <CardDescription className="text-center">
              Connecting to service...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-invoice-700 mb-4" />
            <p className="text-gray-600">Initializing, please wait...</p>
            <div className="flex flex-col space-y-2 mt-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleForceLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear login state
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleHardReset}
                className="text-red-500 hover:text-red-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency reset (clear all data)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-invoice-100 mb-2">
            <FileText className="h-6 w-6 text-invoice-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">FakturaSmooth</CardTitle>
          <CardDescription className="text-center">
            Manage your invoices easily and smoothly
          </CardDescription>
        </CardHeader>
        
        {(isOffline || forceReady || (connectionStatus.checked && !connectionStatus.ok)) && (
          <div className="mx-4 mb-4">
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4 mr-2" />
              <AlertTitle>Connection Problem</AlertTitle>
              <AlertDescription>
                {connectionStatus.checked && !connectionStatus.ok 
                  ? connectionStatus.message
                  : forceReady && !isOffline 
                  ? "Connection to authentication service timed out. This may be temporary."
                  : "Unable to connect to the server. Please check your internet connection."}
                <div className="mt-2 flex space-x-2">
                  <Button 
                    onClick={handleRetryConnection} 
                    variant="outline" 
                    size="sm"
                    disabled={isRetrying}
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry Connection
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleForceLogout}
                    variant="destructive" 
                    size="sm"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Clear Login Data
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 mx-4">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          
          {error && (
            <div className="mx-4 mb-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required
                    disabled={isLoading || (isOffline && !forceReady)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                    disabled={isLoading || (isOffline && !forceReady)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-invoice-700 hover:bg-invoice-800" 
                  disabled={isLoading || (isOffline && !forceReady)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignupSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    required
                    disabled={isLoading || (isOffline && !forceReady)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="Enter your company name"
                    value={signupData.companyName}
                    onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                    required
                    disabled={isLoading || (isOffline && !forceReady)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    required
                    disabled={isLoading || (isOffline && !forceReady)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    required
                    disabled={isLoading || (isOffline && !forceReady)}
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-invoice-700 hover:bg-invoice-800" 
                  disabled={isLoading || (isOffline && !forceReady)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
