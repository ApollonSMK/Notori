
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MiniKit, SendTransactionInput } from '@worldcoin/minikit-js';
import { ethers } from 'ethers';
import NotoriStakeABI from '@/abi/NotoriStake.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_WORLDCHAIN_RPC!;

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
  login: (address: string, username: string) => void;
  logout: () => void;
  setVerifiedStatus: (status: boolean) => void;
  stake: (amount: string) => Promise<void>;
  unstake: (amount: string) => Promise<void>;
  claimRewards: () => Promise<void>;
}

export const AppContext = createContext<AppState>({
  isAuthenticated: false,
  isVerified: false,
  username: null,
  address: null,
  walletBalance: 0,
  stakedAmount: 0,
  rewardsAccumulated: 0,
  apr: "0%",
  isLoading: true,
  login: () => {},
  logout: () => {},
  setVerifiedStatus: () => {},
  stake: async () => {},
  unstake: async () => {},
  claimRewards: async () => {},
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

  const fetchContractData = useCallback(async (userAddress: string) => {
    if (!RPC_URL || !CONTRACT_ADDRESS) {
      console.error("RPC URL or Contract Address is not set.");
      return;
    }
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, NotoriStakeABI, provider);

        const staked = await contract.getStakedAmount(userAddress);
        const rewards = await contract.getRewardsAmount(userAddress);
        // A more complex app would fetch token balance, but we'll mock it for now
        setStakedAmount(parseFloat(ethers.formatEther(staked)));
        setRewardsAccumulated(parseFloat(ethers.formatEther(rewards)));
        setWalletBalance(150.75); // Mock balance
    } catch (error) {
        console.error("Failed to fetch contract data:", error);
    }
  }, []);

  useEffect(() => {
    MiniKit.install();
    const storedAddress = localStorage.getItem('notori_address');
    const storedUsername = localStorage.getItem('notori_username');

    if (storedAddress && storedUsername) {
        setAddress(storedAddress);
        setUsername(storedUsername);
        setIsAuthenticated(true);
        // You'd also check verification status from your backend
        // setIsVerified(await checkVerificationStatus(storedAddress));
        fetchContractData(storedAddress);
    }
    setIsLoading(false);
  }, [fetchContractData]);

  const login = (addr: string, user: string) => {
    localStorage.setItem('notori_address', addr);
    localStorage.setItem('notori_username', user);
    setAddress(addr);
    setUsername(user);
    setIsAuthenticated(true);
    fetchContractData(addr);
  };

  const logout = () => {
    localStorage.removeItem('notori_address');
    localStorage.removeItem('notori_username');
    setAddress(null);
    setUsername(null);
    setIsAuthenticated(false);
    setIsVerified(false);
  };

  const sendTx = async (functionName: string, args: any[]) => {
    if (!MiniKit.isInstalled()) throw new Error("MiniKit not installed");

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
        txPayload.transaction[0].args.push('PERMIT2_SIGNATURE_PLACEHOLDER_0');
    }

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction(txPayload);

    if (finalPayload.status === 'error') {
        throw new Error(finalPayload.error_code || 'Transaction failed.');
    }
    console.log('Transaction sent:', finalPayload.transaction_id);
    return finalPayload.transaction_id;
  }

  const stake = async (amount: string) => {
    const amountInWei = ethers.parseEther(amount).toString();
    await sendTx('stake', [amountInWei]);
  };

  const unstake = async (amount: string) => {
    const amountInWei = ethers.parseEther(amount).toString();
    await sendTx('unstake', [amountInWei]);
  };

  const claimRewards = async () => {
    await sendTx('claimRewards', []);
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
    login,
    logout,
    setVerifiedStatus: setIsVerified,
    stake,
    unstake,
    claimRewards,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
