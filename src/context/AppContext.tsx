
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';

// Mock data for token list - in a real app, this might come from a token list service
const TOKEN_LIST = [
    { address: "0x2cfc85d8e48f8eab294be644d9e25c3030863003", symbol: "WLD", name: "Worldcoin", decimals: 18 },
    { address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1", symbol: "USDC", name: "USD Coin", decimals: 6 },
    { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
];

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
];

const WORLDCHAIN_RPC_URL = "https://worldchain-mainnet.g.alchemy.com/v2/RCo_k3jDxn6E0Iivu3bg6";

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

  const fetchTokenBalances = useCallback(async (walletAddress: string) => {
    try {
        const provider = new ethers.JsonRpcProvider(WORLDCHAIN_RPC_URL);
        const balances = await Promise.all(
            TOKEN_LIST.map(async (token) => {
                const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                const balance = await contract.balanceOf(walletAddress);
                return {
                    symbol: token.symbol,
                    balance: ethers.formatUnits(balance, token.decimals),
                    address: token.address,
                };
            })
        );
        setTokenBalances(balances.filter(b => parseFloat(b.balance) > 0));
    } catch (error) {
        console.error("Failed to fetch token balances:", error);
        // Don't clear balances on error, maybe it was a temp network issue
    }
  }, []);

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
            await fetchTokenBalances(storedAddress);
        }
        setIsLoading(false);
        setIsMounted(true);
    };
    init();
  }, [fetchTokenBalances]);

  const login = async (addr: string, user: string) => {
    localStorage.setItem('notori_address', addr);
    localStorage.setItem('notori_username', user);
    setAddress(addr);
    setUsername(user);
    setIsAuthenticated(true);
    await fetchTokenBalances(addr);
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
