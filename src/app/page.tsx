
"use client";

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Loader2, Award, Activity, Users, Wallet } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';

export default function Home() {
  const { 
    isAuthenticated, 
    isVerified, 
    username, 
    isLoading, 
    handleVerifyRedirect,
    isMounted,
    address,
    tokenBalances
  } = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router, isMounted]);
  
  if (!isMounted || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }
  
  if (!isAuthenticated) {
    return null; // or a dedicated loading/redirecting component
  }

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }

  const credibilityScore = isVerified ? 850 : 450;
  const credibilityTier = isVerified ? "Verified Human" : "Unverified";
  const tierColor = isVerified ? "text-green-400" : "text-amber-400";

  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage data-ai-hint="user avatar" src={`https://placehold.co/48x48.png`} alt={username ?? 'user'} />
                    <AvatarFallback>{username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-xl font-bold">{username}</h1>
                    <p className="text-sm text-muted-foreground font-mono">{formatAddress(address)}</p>
                </div>
            </div>
        </header>
        
        {!isVerified && (
          <Alert variant="default" className="mb-6 bg-primary/10 border-primary/20 cursor-pointer" onClick={handleVerifyRedirect}>
            <ShieldCheck className="h-4 w-4 text-primary" />
            <AlertTitle className="font-semibold text-primary">Verify Your Identity</AlertTitle>
            <AlertDescription className="text-primary/90">
              Increase your credibility score by verifying you're a unique human with World ID.
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full shadow-2xl mb-6 bg-card backdrop-blur-xl border border-white/10 overflow-hidden text-center">
            <CardHeader>
                <CardDescription className="text-muted-foreground">Credibility Score</CardDescription>
                <CardTitle className="text-6xl font-extrabold tracking-tight text-primary">{credibilityScore}</CardTitle>
                <Badge className={`${tierColor} bg-opacity-10 border-opacity-20 self-center border`} variant="outline">{credibilityTier}</Badge>
            </CardHeader>
            <CardContent>
                <Progress value={credibilityScore / 10} className="h-3" />
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-6">
            <Card className="w-full shadow-lg bg-card backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <CardTitle>Credibility Stats</CardTitle>
                  <CardDescription>Factors influencing your score.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-3">
                            <Award className="w-5 h-5 text-primary/80" /> World ID Verification
                        </span>
                        <Badge variant={isVerified ? "default" : "destructive"} className={isVerified ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}>
                          {isVerified ? 'Complete' : 'Missing'}
                        </Badge>
                    </div>
                     <Separator />
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-3">
                            <Activity className="w-5 h-5 text-primary/80" /> On-chain Activity
                        </span>
                        <Badge variant="secondary">Moderate</Badge>
                    </div>
                     <Separator />
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary/80" /> Community Trust
                        </span>
                        <Badge variant="secondary">Building</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full shadow-lg bg-card backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <CardTitle>Wallet Balance</CardTitle>
                  <CardDescription>Your token holdings on World Chain.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     {tokenBalances.length > 0 ? (
                        tokenBalances.map((token, index) => (
                           <React.Fragment key={token.address}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                          <AvatarImage data-ai-hint={`${token.symbol} logo`} src={`https://placehold.co/32x32.png`} />
                                          <AvatarFallback>{token.symbol.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium">{token.symbol}</span>
                                    </div>
                                    <span className="font-mono text-right">{parseFloat(token.balance).toFixed(4)}</span>
                                </div>
                                {index < tokenBalances.length - 1 && <Separator />}
                           </React.Fragment>
                        ))
                     ) : (
                        <div className="text-center text-muted-foreground py-4">
                            <Wallet className="mx-auto h-8 w-8 mb-2" />
                            <p>No tokens found or balances are zero.</p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
