
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

    const handleSignIn = async () => {
        if (!MiniKit.isInstalled()) {
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
            const { finalPayload } = await MiniKit.commandsAsync.walletAuth({ nonce });

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
                    login(finalPayload.address, username);
                    toast({ title: "Success", description: `Signed in as ${username}` });
                    router.push('/');
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
                <Card className="w-full shadow-lg bg-card/80 backdrop-blur-xl border border-white/10">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Welcome to NotoriStake</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {isAuthenticated 
                                ? "You are successfully authenticated."
                                : "Sign in with your World App wallet to continue."
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
                                    {isLoading ? 'Connecting...' : 'Sign In with World App'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
