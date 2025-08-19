
"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCheck } from 'lucide-react';

// MOCK: Replace with actual MiniKit integration
const MOCK_MiniKit = {
    isInstalled: () => true,
    user: {
        username: null as string | null,
    },
    commandsAsync: {
        walletAuth: async (payload: { nonce: string }) => {
            console.log("MiniKit walletAuth called with:", payload);
            // Simulate API call and wallet interaction
            await new Promise(resolve => setTimeout(resolve, 1500));
            return {
                finalPayload: {
                    status: 'success',
                    message: 'mock_message',
                    signature: 'mock_signature',
                    address: '0x123...abc',
                }
            }
        }
    }
}

export default function AuthPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { toast } = useToast();

    const handleSignIn = async () => {
        if (!MOCK_MiniKit.isInstalled()) {
            toast({ title: "Error", description: "World App is not installed.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        try {
            // 1. Get nonce from our backend
            const nonceRes = await fetch('/api/nonce');
            if (!nonceRes.ok) throw new Error('Failed to get nonce.');
            const { nonce } = await nonceRes.json();

            // 2. Call MiniKit walletAuth
            const { finalPayload } = await MOCK_MiniKit.commandsAsync.walletAuth({ nonce });

            if (finalPayload.status === 'success') {
                // 3. Send payload to backend to complete SIWE
                const siweRes = await fetch('/api/complete-siwe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ payload: finalPayload, nonce }),
                });

                if (!siweRes.ok) throw new Error('SIWE verification failed.');
                
                const { isValid, username } = await siweRes.json();
                
                if (isValid) {
                    setIsAuthenticated(true);
                    MOCK_MiniKit.user.username = username; // Mock setting username
                    toast({ title: "Success", description: `Signed in as ${username}` });
                } else {
                    throw new Error('Invalid signature.');
                }
            } else {
                 throw new Error('Wallet authentication was rejected or failed.');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
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
                <Card className="w-full shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Sign In with World ID</CardTitle>
                        <CardDescription>
                            {isAuthenticated 
                                ? "You are successfully authenticated."
                                : "Connect your wallet to access NotoriStake."
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center space-y-4">
                            {isAuthenticated ? (
                                <div className="flex flex-col items-center text-center">
                                    <UserCheck className="h-16 w-16 text-green-500 mb-4" />
                                    <p className="font-bold text-lg">{MOCK_MiniKit.user.username}</p>
                                    <p className="text-muted-foreground">Authentication complete.</p>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleSignIn}
                                    disabled={isLoading}
                                    className="w-full h-12 text-lg"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                    {isLoading ? 'Connecting...' : 'Sign In'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
