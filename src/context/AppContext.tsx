
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TokenBalance {
    symbol: string;
    balance: string;
    address: string;
}

interface AppState {
  isAuthenticated: boolean;
  isVerified: boolean;
  username: string | null;
  address: string | null;
  isLoading: boolean;
  isMounted: boolean;
  tokenBalances: TokenBalance[];
  login: (address: string, username: string) => void;
  logout: () => void;
  setVerifiedStatus: (status: boolean) => void;
  handleVerifyRedirect: () => void;
}

export const AppContext = createContext<AppState>({
  isAuthenticated: false,
  isVerified: false,
  username: null,
  address: null,
  isLoading: true,
  isMounted: false,
  tokenBalances: [],
  login: () => {},
  logout: () => {},
  setVerifiedStatus: () => {},
  handleVerifyRedirect: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const init = async () => {
        const storedAddress = localStorage.getItem('notori_address');
        const storedUsername = localStorage.getItem('notori_username');
        const storedVerification = localStorage.getItem('notori_verified') === 'true';

        if (storedAddress && storedUsername) {
            setAddress(storedAddress);
            setUsername(storedUsername);
            setIsAuthenticated(true);
            setIsVerified(storedVerification);
        }
        setIsLoading(false);
        setIsMounted(true);
    };
    init();
  }, []);

  const login = (addr: string, user: string) => {
    localStorage.setItem('notori_address', addr);
    localStorage.setItem('notori_username', user);
    setAddress(addr);
    setUsername(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('notori_address');
    localStorage.removeItem('notori_username');
    localStorage.removeItem('notori_verified');
    setAddress(null);
    setUsername(null);
    setIsAuthenticated(false);
    setIsVerified(false);
    setTokenBalances([]);
    router.push('/auth');
  };

  const setVerifiedStatus = (status: boolean) => {
    setIsVerified(status);
    localStorage.setItem('notori_verified', status.toString());
  };

  const handleVerifyRedirect = () => {
    router.push('/verify');
  };
  
  const value = {
    isAuthenticated,
    isVerified,
    username,
    address,
    isLoading,
    isMounted,
    tokenBalances,
    login,
    logout,
    setVerifiedStatus,
    handleVerifyRedirect,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
