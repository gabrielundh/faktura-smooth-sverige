
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login: React.FC = () => {
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
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
  const [passwordError, setPasswordError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(loginData.email, loginData.password);
    if (success) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setPasswordError('Lösenorden matchar inte');
      return;
    }
    
    // Validate password length
    if (signupData.password.length < 6) {
      setPasswordError('Lösenordet måste vara minst 6 tecken');
      return;
    }
    
    setIsLoading(true);
    
    const success = await signup(
      signupData.email, 
      signupData.password, 
      signupData.companyName
    );
    
    if (success) {
      // Clear the form
      setSignupData({
        email: '',
        password: '',
        confirmPassword: '',
        companyName: ''
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-invoice-100 mb-2">
            <FileText className="h-6 w-6 text-invoice-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">FakturaSmooth</CardTitle>
          <CardDescription className="text-center">
            Hantera dina fakturor enkelt och smidigt
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 mx-4">
            <TabsTrigger value="login">Logga in</TabsTrigger>
            <TabsTrigger value="signup">Skapa konto</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-post</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Ange din e-post"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Lösenord</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Ange ditt lösenord"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-invoice-700 hover:bg-invoice-800" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Loggar in...' : 'Logga in'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignupSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-post</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Ange din e-post"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Företagsnamn</Label>
                  <Input
                    id="company-name"
                    placeholder="Ange ditt företagsnamn"
                    value={signupData.companyName}
                    onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Lösenord</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Ange lösenord (minst 6 tecken)"
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Bekräfta lösenord</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Bekräfta ditt lösenord"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    required
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-invoice-700 hover:bg-invoice-800" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Skapar konto...' : 'Skapa konto'}
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
