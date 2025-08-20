
"use client";

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { StakeDialog } from '@/components/StakeDialog';
import { Coins, HelpCircle, ShieldCheck, Download, Upload, Award, Wallet, Loader2 } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Home() {
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
  const [isUnstakeDialogOpen, setIsUnstakeDialogOpen] = useState(false);
  const { 
    isAuthenticated, 
    isVerified, 
    username, 
    walletBalance, 
    stakedAmount, 
    rewardsAccumulated, 
    tokenSymbol,
    apr, 
    isLoading, 
    claimRewards,
    handleVerifyRedirect,
    isMounted
  } = useContext(AppContext);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router, isMounted]);

  const handleClaim = async () => {
    try {
      await claimRewards();
      toast({
        title: "Claim Submitted",
        description: "Your reward claim transaction has been sent.",
      });
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };
  
  if (!isMounted || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
                <Coins className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">NotoriStake</h1>
          </div>
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage data-ai-hint="user avatar" src={`https://placehold.co/40x40.png`} alt={username ?? 'user'} />
            <AvatarFallback>{username?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </header>
        
        {!isVerified && (
          <Alert variant="default" className="mb-6 bg-primary/10 border-primary/20 cursor-pointer" onClick={handleVerifyRedirect}>
            <ShieldCheck className="h-4 w-4 text-primary" />
            <AlertTitle className="font-semibold text-primary">Verify Your Identity</AlertTitle>
            <AlertDescription className="text-primary/90">
              To start staking, you need to verify you're a unique human with World ID. Tap here to get started.
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full shadow-2xl mb-6 bg-card backdrop-blur-xl border border-white/10 overflow-hidden">
          <CardHeader>
             <CardDescription className="text-muted-foreground">Total Staked Balance</CardDescription>
            <CardTitle className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">{stakedAmount.toFixed(4)}</span>
              <span className="text-xl font-medium text-muted-foreground">{tokenSymbol}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
             <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <div>
                    <p className="text-sm text-muted-foreground">Accumulated Rewards</p>
                    <p className="font-semibold text-lg">{rewardsAccumulated.toFixed(6)} {tokenSymbol}</p>
                </div>
                <Button
                    size="sm"
                    onClick={handleClaim}
                    disabled={!isVerified || rewardsAccumulated <= 0}
                    className="bg-primary/90 text-primary-foreground hover:bg-primary"
                >
                    <Award className="mr-2 h-4 w-4" /> Claim
                </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full shadow-lg bg-card backdrop-blur-xl border border-white/10">
            <CardContent className="p-4 grid gap-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Wallet Balance
                    </span>
                    <span className="font-semibold">{walletBalance.toFixed(2)} {tokenSymbol}</span>
                </div>
                 <Separator />
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> Staking APR
                    </span>
                    <Badge variant="secondary">{apr}</Badge>
                </div>
            </CardContent>
        </Card>

      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-white/10 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button className="w-full h-12 text-lg" variant="secondary" onClick={() => setIsUnstakeDialogOpen(true)} disabled={!isVerified || stakedAmount <= 0}>
              <Download className="mr-2 h-5 w-5" /> Unstake
            </Button>
            <Button className="w-full h-12 text-lg" variant="default" onClick={() => setIsStakeDialogOpen(true)} disabled={!isVerified}>
              <Upload className="mr-2 h-5 w-5" /> Stake
            </Button>
          </div>
      </div>

      <StakeDialog 
        open={isStakeDialogOpen}
        onOpenChange={setIsStakeDialogOpen}
        action="Stake"
        balance={walletBalance}
      />
      <StakeDialog
        open={isUnstakeDialogOpen}
        onOpenChange={setIsUnstakeDialogOpen}
        action="Unstake"
        balance={stakedAmount}
      />
    </AppLayout>
  );
}
