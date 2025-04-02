
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { mockUser } from '../data/mockData';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const login = (username: string, password: string) => {
    if (username === mockUser.username && password === mockUser.password) {
      setUser(mockUser);
      toast({
        title: "Inloggad",
        description: "Du är nu inloggad som " + mockUser.username,
      });
      return true;
    } else {
      toast({
        title: "Fel inloggningsuppgifter",
        description: "Kontrollera användarnamn och lösenord",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Utloggad",
      description: "Du har loggats ut",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
