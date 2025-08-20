
"use client";

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCheck, LogIn } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { MiniKit } from '@worldcoin/minikit-js';
import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';

export default function AuthPage() {
    const { isAuthenticated, login, username } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if(isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const performSiweLogin = async (address: string, message: string, signature: string) => {
        const siweRes = await fetch('/api/complete-siwe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: { message, signature, address } }),
        });

        if (!siweRes.ok) throw new Error('SIWE verification failed on the backend.');
        
        const { isValid, username: authenticatedUsername } = await siweRes.json();
        
        if (isValid) {
            login(address, authenticatedUsername);
            toast({ title: "Success", description: `Signed in as ${authenticatedUsername}` });
            router.push('/');
        } else {
            throw new Error('Invalid signature or backend validation failed.');
        }
    }

    const handleSignIn = async () => {
        setIsLoading(true);

        try {
            // 1. Get nonce from our backend
            const nonceRes = await fetch('/api/nonce');
            if (!nonceRes.ok) throw new Error('Failed to get nonce.');
            const { nonce } = await nonceRes.json();

            // 2. Check environment (World App vs. Desktop Browser)
            if (MiniKit.isInstalled()) {
                // WORLD APP FLOW
                const { finalPayload } = await MiniKit.commandsAsync.walletAuth({ nonce });

                if (finalPayload.status === 'success') {
                    await performSiweLogin(finalPayload.address, finalPayload.message, finalPayload.signature);
                } else {
                     throw new Error('Wallet authentication was rejected or failed in World App.');
                }
            } else if (window.ethereum) {
                // DESKTOP BROWSER (METAMASK) FLOW
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                
                const siweMessage = new SiweMessage({
                    domain: window.location.host,
                    address: address,
                    statement: 'Sign in to NotoriStake Mini App',
                    uri: window.location.origin,
                    version: '1',
                    chainId: 4801, // World Chain Sepolia Testnet
                    nonce: nonce,
                });

                const messageToSign = siweMessage.prepareMessage();
                const signature = await signer.signMessage(messageToSign);

                await performSiweLogin(address, messageToSign, signature);
            } else {
                 toast({ title: "Error", description: "No wallet found. Please install World App or MetaMask.", variant: "destructive" });
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            console.error("Sign-in error:", error);
            toast({
                title: "Authentication Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="container mx-auto max-w-md px-4 py-6 flex items-center justify-center min-h-[80vh]">
                <Card className="w-full shadow-lg bg-card/80 backdrop-blur-xl border border-white/10">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Welcome to NotoriStake</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {isAuthenticated 
                                ? "You are successfully authenticated."
                                : "Sign in with your wallet to continue."
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                            {isAuthenticated ? (
                                <div className="flex flex-col items-center text-center">
                                    <UserCheck className="h-16 w-16 text-green-500 mb-4" />
                                    <p className="font-bold text-lg">{username}</p>
                                    <p className="text-muted-foreground">Authentication complete.</p>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleSignIn}
                                    disabled={isLoading}
                                    className="w-full h-14 text-lg font-semibold"
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                                    {isLoading ? 'Connecting...' : 'Sign In with Wallet'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
