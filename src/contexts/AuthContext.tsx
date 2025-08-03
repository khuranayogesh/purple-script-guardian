import { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_CREDENTIALS = [
  { username: 'admin', password: 'admin', userType: 'Administrator' },
  { username: 'user01', password: 'user01', userType: 'User' }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string, userType: string): boolean => {
    const credential = VALID_CREDENTIALS.find(
      cred => cred.username === username && 
              cred.password === password && 
              cred.userType === userType
    );

    if (credential) {
      setUser({
        id: credential.username,
        username: credential.username,
        userType: credential.userType as 'User' | 'Administrator'
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}