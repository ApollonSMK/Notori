"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { StakeDialog } from '@/components/StakeDialog';
import { Coins, HelpCircle, ShieldCheck, Download, Upload, Award } from 'lucide-react';

const MOCK_USER = {
  username: "notorious.eth",
  avatar: "https://placehold.co/40x40.png",
  isVerified: false, 
};

const MOCK_STAKING_DATA = {
  walletBalance: 150.75,
  stakedAmount: 1000.00,
  rewardsAccumulated: 42.1234,
  apr: "12.5%",
  tokenSymbol: "WLD",
};

export default function Home() {
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
  const [isUnstakeDialogOpen, setIsUnstakeDialogOpen] = useState(false);

  const openDialog = (action: 'Stake' | 'Unstake') => {
    if (action === 'Stake') {
      setIsStakeDialogOpen(true);
    } else {
      setIsUnstakeDialogOpen(true);
    }
  };

  const handleClaim = () => {
    // MiniKit sendTransaction logic for claiming
    console.log("Claiming rewards...");
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Coins className="text-primary h-8 w-8" />
            <h1 className="text-2xl font-bold">NotoriStake</h1>
          </div>
          <Avatar>
            <AvatarImage data-ai-hint="user avatar" src={MOCK_USER.avatar} alt={MOCK_USER.username} />
            <AvatarFallback>{MOCK_USER.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </header>
        
        {!MOCK_USER.isVerified && (
          <Alert variant="default" className="mb-6 bg-accent/10 border-accent/50">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <AlertTitle className="font-semibold text-accent">Verify Your Identity</AlertTitle>
            <AlertDescription className="text-accent/90 flex justify-between items-center">
              To start staking, you need to verify your identity with World ID.
              <Button size="sm" className="ml-4 bg-accent text-accent-foreground hover:bg-accent/90 whitespace-nowrap">Verify Now</Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardDescription>Total Staked</CardDescription>
            <CardTitle className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{MOCK_STAKING_DATA.stakedAmount.toFixed(2)}</span>
              <span className="text-xl font-medium text-muted-foreground">{MOCK_STAKING_DATA.tokenSymbol}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Accumulated Rewards</span>
              <span className="font-semibold text-primary">{MOCK_STAKING_DATA.rewardsAccumulated.toFixed(4)} {MOCK_STAKING_DATA.tokenSymbol}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wallet Balance</span>
              <span className="font-semibold">{MOCK_STAKING_DATA.walletBalance.toFixed(2)} {MOCK_STAKING_DATA.tokenSymbol}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                    APR <HelpCircle className="w-4 h-4 cursor-pointer text-muted-foreground" />
                </span>
                <Badge variant="secondary">{MOCK_STAKING_DATA.apr}</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 fixed bottom-16 left-0 right-0 p-4 bg-background border-t max-w-md mx-auto">
            <Button
              className="w-full h-12 text-base font-bold"
              onClick={handleClaim}
              disabled={!MOCK_USER.isVerified || MOCK_STAKING_DATA.rewardsAccumulated <= 0}
            >
              <Award className="mr-2 h-5 w-5" /> Claim Rewards
            </Button>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button className="w-full h-12" variant="outline" onClick={() => openDialog('Unstake')} disabled={!MOCK_USER.isVerified}>
                <Download className="mr-2 h-5 w-5" /> Unstake
              </Button>
              <Button className="w-full h-12" variant="default" onClick={() => openDialog('Stake')} disabled={!MOCK_USER.isVerified}>
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
        balance={MOCK_STAKING_DATA.walletBalance}
        tokenSymbol={MOCK_STAKING_DATA.tokenSymbol}
      />
      <StakeDialog
        open={isUnstakeDialogOpen}
        onOpenChange={setIsUnstakeDialogOpen}
        action="Unstake"
        balance={MOCK_STAKING_DATA.stakedAmount}
        tokenSymbol={MOCK_STAKING_DATA.tokenSymbol}
      />
    </AppLayout>
  );
}
