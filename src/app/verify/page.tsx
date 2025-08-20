
"use client";

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';

export default function VerifyPage() {
    const { isVerified, username, setVerifiedStatus } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const ACTION_ID = process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID!; 
    const SIGNAL = username;

    useEffect(() => {
        if(isVerified) {
            router.push('/');
        }
    }, [isVerified, router]);

    const handleVerify = async () => {
        if (!MiniKit.isInstalled()) {
            toast({ title: "Error", description: "World App is not installed.", variant: "destructive" });
            return;
        }

        if (!SIGNAL) {
            toast({ title: "Error", description: "User not signed in, cannot create signal.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const { finalPayload } = await MiniKit.commandsAsync.verify({
                action: ACTION_ID,
                signal: SIGNAL,
                verification_level: VerificationLevel.Orb,
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
                    setVerifiedStatus(true);
                    toast({
                        title: "Verification Successful",
                        description: "You are now verified and can start staking.",
                    });
                    router.push('/');
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
                <Card className="w-full shadow-2xl bg-card/80 backdrop-blur-xl border border-white/10">
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
