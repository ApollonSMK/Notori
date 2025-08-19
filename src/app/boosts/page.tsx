"use client";

import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket } from 'lucide-react';

const boosts = [
    { id: 1, name: '2x Rewards Boost', description: 'Duration: 24 hours', cost: 5, symbol: 'WLD', icon: '🚀' },
    { id: 2, name: '5% APR Increase', description: 'Duration: 7 days', cost: 15, symbol: 'WLD', icon: '📈' },
    { id: 3, name: 'Instant Claim', description: 'Skip the waiting period for rewards', cost: 2, symbol: 'USDC', icon: '⚡️' },
]

export default function BoostsPage() {
  const handlePurchase = (boostId: number) => {
    console.log(`Purchasing boost ${boostId}`);
    // Integrate MiniKit pay command
  };
    
  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Boosts & Perks</h1>
          <p className="text-muted-foreground">Enhance your staking experience.</p>
        </header>

        <div className="grid gap-4">
            {boosts.map((boost) => (
                <Card key={boost.id} className="shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{boost.name}</CardTitle>
                                <CardDescription>{boost.description}</CardDescription>
                            </div>
                            <div className="text-4xl">{boost.icon}</div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handlePurchase(boost.id)}>
                           <Rocket className="mr-2 h-4 w-4" /> Buy for {boost.cost} {boost.symbol}
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
