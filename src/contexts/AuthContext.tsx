
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, companyName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          await fetchUserProfile(session);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (session: Session) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUser({
          id: session.user.id,
          username: data.username,
          email: session.user.email || '',
          company: data.company
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshUser = async () => {
    if (session) {
      await fetchUserProfile(session);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Fel inloggningsuppgifter",
          description: "Kontrollera e-postadress och lösenord",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Inloggad",
        description: "Du är nu inloggad",
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte logga in. Försök igen senare.",
        variant: "destructive"
      });
      return false;
    }
  };

  const signup = async (email: string, password: string, companyName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName
          }
        }
      });

      if (error) {
        toast({
          title: "Registrering misslyckades",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Konto skapat",
        description: "Ditt konto har skapats. Du kan nu logga in.",
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte skapa konto. Försök igen senare.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast({
        title: "Utloggad",
        description: "Du har loggats ut",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte logga ut. Försök igen senare.",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAuthenticated: !!user, 
      login, 
      signup,
      logout,
      refreshUser
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
