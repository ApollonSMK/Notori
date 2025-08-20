
"use client";

import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ExternalLink, ListX, History as HistoryIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const mockHistory = [
  { id: 1, type: 'Verify', detail: 'World ID Orb Verification', date: '2024-07-19T09:00:00Z', status: 'Completed', txHash: '0x123...abc' },
  { id: 2, type: 'Login', detail: 'Successful sign-in', date: '2024-07-29T10:30:00Z', status: 'Completed', txHash: null },
  { id: 3, type: 'Profile Update', detail: 'Username changed', date: '2024-07-28T11:00:00Z', status: 'Completed', txHash: null },

];

const typeDetails: { [key: string]: { icon: React.ElementType, className: string } } = {
    Verify: { icon: ShieldCheck, className: 'text-green-400 bg-green-400/10' },
    Login: { icon: Clock, className: 'text-blue-400 bg-blue-400/10' },
    'Profile Update': { icon: HistoryIcon, className: 'text-purple-400 bg-purple-400/10' },
};

export default function HistoryPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="mb-6 flex items-center gap-4">
          <HistoryIcon className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Activity History</h1>
        </header>

        <div className="space-y-4">
          {mockHistory.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-10 text-center bg-card backdrop-blur-xl border border-white/10">
              <ListX className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No History Yet</h3>
              <p className="text-muted-foreground">Your recent activities will appear here.</p>
            </Card>
          ) : (
            mockHistory.map((item) => {
              const details = typeDetails[item.type as keyof typeof typeDetails];
              
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
                                    {item.detail}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardFooter className="p-3 bg-black/10 flex justify-between items-center text-xs">
                        <Badge variant={'secondary'} className="bg-gray-400/10 text-gray-300 border-gray-400/20">
                          {new Date(item.date).toLocaleDateString()}
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

    