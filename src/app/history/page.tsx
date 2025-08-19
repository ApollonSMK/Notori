"use client";

import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockHistory = [
  { id: 1, type: 'Stake', amount: 500, symbol: 'WLD', date: '2024-07-29', status: 'Completed' },
  { id: 2, type: 'Claim', amount: 10.5, symbol: 'WLD', date: '2024-07-25', status: 'Completed' },
  { id: 3, type: 'Unstake', amount: 200, symbol: 'WLD', date: '2024-07-22', status: 'Completed' },
  { id: 4, type: 'Stake', amount: 200, symbol: 'WLD', date: '2024-07-20', status: 'Pending' },
];

const typeDetails = {
    Stake: { icon: Upload, className: 'text-primary bg-primary/10' },
    Unstake: { icon: Download, className: 'text-foreground bg-secondary' },
    Claim: { icon: Award, className: 'text-accent-foreground bg-accent' },
};

export default function HistoryPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">Your recent staking activities.</p>
        </header>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No history yet.</TableCell>
                    </TableRow>
                ) : (
                    mockHistory.map((item) => {
                        const details = typeDetails[item.type as keyof typeof typeDetails];
                        return (
                            <TableRow key={item.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className={cn("rounded-full p-2 flex items-center justify-center w-10 h-10", details.className)}>
                                        <details.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.type}</p>
                                        <p className="text-sm text-muted-foreground">{item.date}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <p className="font-semibold">{item.type === 'Unstake' ? '-' : '+'} {item.amount} {item.symbol}</p>
                                <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'}>
                                    {item.status}
                                </Badge>
                            </TableCell>
                            </TableRow>
                        );
                    })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
