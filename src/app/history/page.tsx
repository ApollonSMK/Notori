"use client";

import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Award, ShieldCheck, ExternalLink, ListX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const mockHistory = [
  { id: 1, type: 'Stake', amount: 500, symbol: 'WLD', date: '2024-07-29T10:30:00Z', status: 'Completed', txHash: '0x123...abc' },
  { id: 2, type: 'Claim', amount: 10.5, symbol: 'WLD', date: '2024-07-25T15:45:00Z', status: 'Completed', txHash: '0x456...def' },
  { id: 3, type: 'Unstake', amount: 200, symbol: 'WLD', date: '2024-07-22T08:00:00Z', status: 'Completed', txHash: '0x789...ghi' },
  { id: 4, type: 'Stake', amount: 200, symbol: 'WLD', date: '2024-07-20T12:00:00Z', status: 'Pending', txHash: '0xabc...123' },
  { id: 5, type: 'Verify', amount: null, symbol: 'World ID', date: '2024-07-19T09:00:00Z', status: 'Completed', txHash: null },
];

const typeDetails: { [key: string]: { icon: React.ElementType, className: string } } = {
    Stake: { icon: Upload, className: 'text-primary bg-primary/10' },
    Unstake: { icon: Download, className: 'text-foreground bg-secondary' },
    Claim: { icon: Award, className: 'text-green-400 bg-green-400/10' },
    Verify: { icon: ShieldCheck, className: 'text-blue-400 bg-blue-400/10' },
};

export default function HistoryPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">Your recent staking activities.</p>
        </header>

        <div className="space-y-4">
          {mockHistory.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-10 text-center bg-card backdrop-blur-xl border border-white/10">
              <ListX className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No History Yet</h3>
              <p className="text-muted-foreground">Your transactions will appear here once you start staking.</p>
            </Card>
          ) : (
            mockHistory.map((item) => {
              const details = typeDetails[item.type as keyof typeof typeDetails];
              const isPositive = item.type === 'Stake' || item.type === 'Claim';
              
              return (
                <Card key={item.id} className="shadow-lg overflow-hidden bg-card backdrop-blur-xl border-white/10">
                    <CardHeader className="p-4">
                        <div className="flex items-center gap-4">
                            <div className={cn("rounded-full p-2.5 flex items-center justify-center w-12 h-12", details.className)}>
                                <details.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-lg">{item.type}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(item.date).toLocaleString()}
                                </p>
                            </div>
                            {item.amount !== null ? (
                                <div className={cn(
                                    "text-lg font-bold",
                                    isPositive ? "text-green-400" : "text-red-400"
                                )}>
                                    {isPositive ? '+' : '-'} {item.amount} {item.symbol}
                                </div>
                            ) : (
                                <Badge variant="secondary" className="bg-blue-400/10 text-blue-300 border-blue-400/20">
                                    {item.symbol}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardFooter className="p-3 bg-black/10 flex justify-between items-center text-xs">
                        <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'} 
                            className={cn(
                                item.status === 'Completed' && 'bg-green-400/10 text-green-300 border-green-400/20',
                                item.status === 'Pending' && 'bg-amber-400/10 text-amber-300 border-amber-400/20',
                            )}>
                            {item.status}
                        </Badge>

                        {item.txHash && (
                            <a
                                href={`https://worldscan.org/tx/${item.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
                            >
                                View on Explorer <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                            </a>
                        )}
                    </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
