
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MiniKit, SendTransactionInput } from '@worldcoin/minikit-js';
import { ethers } from 'ethers';
import NotoriStakeABI from '@/abi/NotoriStake.json';
import { useRouter } from 'next/navigation';

const RPC_URL = process.env.NEXT_PUBLIC_WORLDCHAIN_RPC!;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS!;

// A simple ERC20 ABI snippet to get the balance
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

interface AppState {
  isAuthenticated: boolean;
  isVerified: boolean;
  username: string | null;
  address: string | null;
  walletBalance: number;
  stakedAmount: number;
  rewardsAccumulated: number;
  apr: string;
  isLoading: boolean;
  isMounted: boolean;
  login: (address: string, username: string) => void;
  logout: () => void;
  setVerifiedStatus: (status: boolean) => void;
  stake: (amount: string) => Promise<void>;
  unstake: (amount: string) => Promise<void>;
  claimRewards: () => Promise<void>;
  handleVerifyRedirect: () => void;
  refreshAllData: (userAddress: string) => Promise<void>;
}

export const AppContext = createContext<AppState>({
  isAuthenticated: false,
  isVerified: false,
  username: null,
  address: null,
  walletBalance: 0,
  stakedAmount: 0,
  rewardsAccumulated: 0,
  apr: "12.5%",
  isLoading: true,
  isMounted: false,
  login: () => {},
  logout: () => {},
  setVerifiedStatus: () => {},
  stake: async () => {},
  unstake: async () => {},
  claimRewards: async () => {},
  handleVerifyRedirect: () => {},
  refreshAllData: async () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [rewardsAccumulated, setRewardsAccumulated] = useState(0);
  const [apr, setApr] = useState("12.5%");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const refreshAllData = useCallback(async (userAddress: string) => {
    if (!RPC_URL || !CONTRACT_ADDRESS || !TOKEN_ADDRESS) {
      console.error("Environment variables for contract/token are not set.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const stakeContract = new ethers.Contract(CONTRACT_ADDRESS, NotoriStakeABI, provider);
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);

      const [staked, rewards, balance, decimals] = await Promise.all([
        stakeContract.getStakedAmount(userAddress),
        stakeContract.getRewardsAmount(userAddress),
        tokenContract.balanceOf(userAddress),
        tokenContract.decimals()
      ]);

      const tokenDecimals = Number(decimals);
      setStakedAmount(parseFloat(ethers.formatUnits(staked, tokenDecimals)));
      setRewardsAccumulated(parseFloat(ethers.formatUnits(rewards, tokenDecimals)));
      setWalletBalance(parseFloat(ethers.formatUnits(balance, tokenDecimals)));
      
    } catch (error) {
      console.error("Failed to fetch contract data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    await MiniKit.install();
    const storedAddress = localStorage.getItem('notori_address');
    const storedUsername = localStorage.getItem('notori_username');
    const storedVerification = localStorage.getItem('notori_verified') === 'true';

    if (storedAddress && storedUsername) {
        setAddress(storedAddress);
        setUsername(storedUsername);
        setIsAuthenticated(true);
        setIsVerified(storedVerification);
        await refreshAllData(storedAddress);
    } else {
        setIsLoading(false);
    }
  }, [refreshAllData]);

  useEffect(() => {
    if (isMounted) {
        initAuth();
    }
  }, [isMounted, initAuth]);


  const login = async (addr: string, user: string) => {
    localStorage.setItem('notori_address', addr);
    localStorage.setItem('notori_username', user);
    setAddress(addr);
    setUsername(user);
    setIsAuthenticated(true);
    await refreshAllData(addr);
  };

  const logout = () => {
    localStorage.removeItem('notori_address');
    localStorage.removeItem('notori_username');
    localStorage.removeItem('notori_verified');
    setAddress(null);
    setUsername(null);
    setIsAuthenticated(false);
    setIsVerified(false);
    setWalletBalance(0);
    setStakedAmount(0);
    setRewardsAccumulated(0);
    router.push('/auth');
  };

  const setVerifiedStatus = (status: boolean) => {
    setIsVerified(status);
    localStorage.setItem('notori_verified', status.toString());
  };

  const sendTx = async (functionName: string, args: any[]) => {
    if (!MiniKit.isInstalled()) throw new Error("MiniKit not installed");
    if (!CONTRACT_ADDRESS || !TOKEN_ADDRESS) throw new Error("Contract or Token address not configured.");

    const txPayload: SendTransactionInput = {
        transaction: [{
            address: CONTRACT_ADDRESS,
            abi: NotoriStakeABI,
            functionName,
            args,
        }]
    };
    
    if(functionName === 'stake') {
        const amountToStake = args[0];
        txPayload.permit2 = [{
            permitted: {
                token: TOKEN_ADDRESS,
                amount: amountToStake,
            },
            spender: CONTRACT_ADDRESS,
            nonce: Date.now().toString(),
            deadline: (Math.floor(Date.now() / 1000) + 3600).toString(),
        }];
        // The signature placeholder is now the second argument for the stake function
        txPayload.transaction[0].args.push('PERMIT2_SIGNATURE_PLACEHOLDER_0');
    }

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction(txPayload);

    if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error_code || 'Transaction failed.');
    }

    // TODO: Poll for transaction receipt for better UX
    console.log('Transaction sent:', finalPayload.transaction_id);
    return finalPayload.transaction_id;
  }

  const stake = async (amount: string) => {
    if (!address) throw new Error("User not authenticated");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.parseUnits(amount, Number(decimals)).toString();
    await sendTx('stake', [amountInWei]);
    await new Promise(resolve => setTimeout(resolve, 3000)); // optimistic wait
    await refreshAllData(address);
  };

  const unstake = async (amount: string) => {
    if (!address) throw new Error("User not authenticated");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.parseUnits(amount, Number(decimals)).toString();
    await sendTx('unstake', [amountInWei]);
    await new Promise(resolve => setTimeout(resolve, 3000)); // optimistic wait
    await refreshAllData(address);
  };

  const claimRewards = async () => {
    if (!address) throw new Error("User not authenticated");
    await sendTx('claimRewards', []);
    await new Promise(resolve => setTimeout(resolve, 3000)); // optimistic wait
    await refreshAllData(address);
  };

  const handleVerifyRedirect = () => {
    router.push('/verify');
  };
  
  const value = {
    isAuthenticated,
    isVerified,
    username,
    address,
    walletBalance,
    stakedAmount,
    rewardsAccumulated,
    apr,
    isLoading,
    isMounted,
    login,
    logout,
    setVerifiedStatus,
    stake,
    unstake,
    claimRewards,
    handleVerifyRedirect,
    refreshAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
