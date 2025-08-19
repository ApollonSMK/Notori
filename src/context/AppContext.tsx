
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MiniKit, SendTransactionInput } from '@worldcoin/minikit-js';
import { ethers } from 'ethers';
import NotoriStakeABI from '@/abi/NotoriStake.json';
import { useRouter } from 'next/navigation';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_WORLDCHAIN_RPC!;

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
  login: (address: string, username: string) => void;
  logout: () => void;
  setVerifiedStatus: (status: boolean) => void;
  stake: (amount: string) => Promise<void>;
  unstake: (amount: string) => Promise<void>;
  claimRewards: () => Promise<void>;
  handleVerifyRedirect: () => void;
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
  handleVerifyRedirect: () => {},
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
  const router = useRouter();

  const fetchContractData = useCallback(async (userAddress: string) => {
    if (!RPC_URL || !CONTRACT_ADDRESS || !TOKEN_ADDRESS) {
      console.error("RPC URL, Contract Address, or Token Address is not set.");
      setIsLoading(false);
      return;
    }
    
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

      setStakedAmount(parseFloat(ethers.formatUnits(staked, decimals)));
      setRewardsAccumulated(parseFloat(ethers.formatUnits(rewards, decimals)));
      setWalletBalance(parseFloat(ethers.formatUnits(balance, decimals)));
      
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

    if (storedAddress && storedUsername) {
        setAddress(storedAddress);
        setUsername(storedUsername);
        setIsAuthenticated(true);
        // In a real app, you'd check verification status from your backend
        // For now, let's assume not verified until they go through the flow.
        // setIsVerified(await checkVerificationStatus(storedAddress)); 
        await fetchContractData(storedAddress);
    } else {
        setIsLoading(false);
    }
  }, [fetchContractData]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);


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

    console.log('Transaction sent:', finalPayload.transaction_id);
    // You can use the transaction_id to monitor the transaction status
    return finalPayload.transaction_id;
  }

  const stake = async (amount: string) => {
    const amountInWei = ethers.parseEther(amount).toString();
    await sendTx('stake', [amountInWei]);
    if(address) await fetchContractData(address);
  };

  const unstake = async (amount: string) => {
    const amountInWei = ethers.parseEther(amount).toString();
    await sendTx('unstake', [amountInWei]);
     if(address) await fetchContractData(address);
  };

  const claimRewards = async () => {
    await sendTx('claimRewards', []);
    if(address) await fetchContractData(address);
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
    login,
    logout,
    setVerifiedStatus: setIsVerified,
    stake,
    unstake,
    claimRewards,
    handleVerifyRedirect,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
