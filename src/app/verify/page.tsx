
"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

// MOCK: Replace with actual MiniKit integration
const MOCK_MiniKit = {
    isInstalled: () => true,
    user: {
        username: "notorious.eth" // Assume user is logged in
    },
    commandsAsync: {
        verify: async (payload: any) => {
            console.log("MiniKit verify called with:", payload);
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Simulate a successful verification
            return {
                finalPayload: {
                    status: 'success',
                    proof: 'mock_proof',
                    merkle_root: 'mock_merkle_root',
                    nullifier_hash: 'mock_nullifier_hash',
                    verification_level: 'orb',
                }
            };
        }
    }
};

export default function VerifyPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const { toast } = useToast();

    // These should come from your .env file
    const ACTION_ID = process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID || 'stakenotori'; 
    const SIGNAL = MOCK_MiniKit.user.username; 

    const handleVerify = async () => {
        if (!MOCK_MiniKit.isInstalled()) {
            toast({ title: "Error", description: "World App is not installed.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const { finalPayload } = await MOCK_MiniKit.commandsAsync.verify({
                action: ACTION_ID,
                signal: SIGNAL,
                verification_level: 'orb', // or 'device'
            });

            if (finalPayload.status === 'success') {
                const response = await fetch('/api/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        payload: finalPayload,
                        action: ACTION_ID,
                        signal: SIGNAL,
                    }),
                });
                
                const result = await response.json();

                if (response.ok && result.success) {
                    setIsVerified(true);
                    toast({
                        title: "Verification Successful",
                        description: "You are now verified and can start staking.",
                    });
                } else {
                    throw new Error(result.detail || "Verification failed on the backend.");
                }
            } else {
                throw new Error("World ID verification was rejected or failed.");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                title: "Verification Failed",
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
                        <CardTitle className="text-2xl">Human Verification</CardTitle>
                        <CardDescription>
                            To ensure fair access, please verify you are a unique human with World ID.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center space-y-4">
                            {isVerified ? (
                                <div className="text-center">
                                    <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <p className="font-bold text-lg">Verification Complete</p>
                                    <p className="text-muted-foreground">You can now use all features.</p>
                                </div>
                            ) : (
                                <>
                                  <ShieldAlert className="h-16 w-16 text-primary mx-auto mb-4" />
                                  <Button
                                      onClick={handleVerify}
                                      disabled={isLoading}
                                      className="w-full h-12 text-lg"
                                  >
                                      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                      {isLoading ? 'Verifying...' : 'Verify with World ID'}
                                  </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
