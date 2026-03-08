"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        setToken(session.access_token);
        
        // Fetch role from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
          email: session.user.email || '',
          role: profile?.role || 'customer'
        });
        localStorage.setItem("token", session.access_token);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      }
      setIsLoading(false);
    };

    getSession();

    // Listen for changes on auth state (login, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setToken(session.access_token);
          
          // Re-fetch role on state change
          supabase.from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
                email: session.user.email || '',
                role: profile?.role || 'customer'
              });
            });

          localStorage.setItem("token", session.access_token);
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, token, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
