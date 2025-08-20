"use client";

import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

const boosts = [
    { id: 1, name: '2x Rewards Boost', description: 'Duration: 24 hours', cost: 5, symbol: 'WLD', icon: Rocket, color: 'text-purple-500' },
    { id: 2, name: '5% APR Increase', description: 'Duration: 7 days', cost: 15, symbol: 'WLD', icon: TrendingUp, color: 'text-green-500' },
    { id: 3, name: 'Instant Claim', description: 'Skip the reward waiting period', cost: 2, symbol: 'USDC', icon: Zap, color: 'text-yellow-500' },
    { id: 4, name: 'Stake Insurance', description: 'Protect your stake for 30 days', cost: 10, symbol: 'USDC', icon: ShieldCheck, color: 'text-blue-500' },
]

export default function BoostsPage() {
  const handlePurchase = (boostId: number) => {
    console.log(`Purchasing boost ${boostId}`);
    // Integrate MiniKit pay command
  };
    
  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Boosts & Perks</h1>
          <p className="text-muted-foreground mt-2">Enhance your staking experience with powerful upgrades.</p>
        </header>

        <div className="grid gap-5">
            {boosts.map((boost) => {
                const Icon = boost.icon;
                return (
                    <Card key={boost.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full bg-muted`}>
                                  <Icon className={`w-6 h-6 ${boost.color}`} />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{boost.name}</CardTitle>
                                    <CardDescription>{boost.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full h-11" onClick={() => handlePurchase(boost.id)}>
                               Buy for {boost.cost} {boost.symbol}
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
      </div>
    </AppLayout>
  );
}
