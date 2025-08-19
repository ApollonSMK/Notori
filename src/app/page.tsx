
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
import { Coins, HelpCircle, ShieldCheck, Download, Upload, Award } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { MiniKit } from '@worldcoin/minikit-js';
import NotoriStakeABI from '@/abi/NotoriStake.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const TOKEN_SYMBOL = "WLD";

export default function Home() {
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
  const [isUnstakeDialogOpen, setIsUnstakeDialogOpen] = useState(false);
  const { isAuthenticated, isVerified, username, walletBalance, stakedAmount, rewardsAccumulated, apr, isLoading, claimRewards } = useContext(AppContext);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

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

  const handleVerifyRedirect = () => {
    router.push('/verify');
  };
  
  if (isLoading || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Coins className="text-primary h-8 w-8" />
            <h1 className="text-2xl font-bold">NotoriStake</h1>
          </div>
          <Avatar>
            <AvatarImage data-ai-hint="user avatar" src={`https://placehold.co/40x40.png?text=${username?.substring(0,2)}`} alt={username} />
            <AvatarFallback>{username?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </header>
        
        {!isVerified && (
          <Alert variant="default" className="mb-6 bg-accent/10 border-accent/50">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <AlertTitle className="font-semibold text-accent">Verify Your Identity</AlertTitle>
            <AlertDescription className="text-accent/90 flex justify-between items-center">
              To start staking, you need to verify your identity with World ID.
              <Button size="sm" className="ml-4 bg-accent text-accent-foreground hover:bg-accent/90 whitespace-nowrap" onClick={handleVerifyRedirect}>Verify Now</Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardDescription>Total Staked</CardDescription>
            <CardTitle className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{stakedAmount.toFixed(2)}</span>
              <span className="text-xl font-medium text-muted-foreground">{TOKEN_SYMBOL}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Accumulated Rewards</span>
              <span className="font-semibold text-primary">{rewardsAccumulated.toFixed(4)} {TOKEN_SYMBOL}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wallet Balance</span>
              <span className="font-semibold">{walletBalance.toFixed(2)} {TOKEN_SYMBOL}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                    APR <HelpCircle className="w-4 h-4 cursor-pointer text-muted-foreground" />
                </span>
                <Badge variant="secondary">{apr}</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 fixed bottom-16 left-0 right-0 p-4 bg-background border-t max-w-md mx-auto">
            <Button
              className="w-full h-12 text-base font-bold"
              onClick={handleClaim}
              disabled={!isVerified || rewardsAccumulated <= 0}
            >
              <Award className="mr-2 h-5 w-5" /> Claim Rewards
            </Button>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button className="w-full h-12" variant="outline" onClick={() => setIsUnstakeDialogOpen(true)} disabled={!isVerified}>
                <Download className="mr-2 h-5 w-5" /> Unstake
              </Button>
              <Button className="w-full h-12" variant="default" onClick={() => setIsStakeDialogOpen(true)} disabled={!isVerified}>
                <Upload className="mr-2 h-5 w-5" /> Stake
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <StakeDialog 
        open={isStakeDialogOpen}
        onOpenChange={setIsStakeDialogOpen}
        action="Stake"
        balance={walletBalance}
        tokenSymbol={TOKEN_SYMBOL}
      />
      <StakeDialog
        open={isUnstakeDialogOpen}
        onOpenChange={setIsUnstakeDialogOpen}
        action="Unstake"
        balance={stakedAmount}
        tokenSymbol={TOKEN_SYMBOL}
      />
    </AppLayout>
  );
}
