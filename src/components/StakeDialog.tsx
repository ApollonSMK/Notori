"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

interface StakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'Stake' | 'Unstake';
  balance: number;
  tokenSymbol: string;
}

export function StakeDialog({ open, onOpenChange, action, balance, tokenSymbol }: StakeDialogProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    if (numericAmount > balance) {
        toast({
            title: "Insufficient Balance",
            description: `You cannot ${action.toLowerCase()} more than your available ${action === 'Stake' ? 'wallet' : 'staked'} balance of ${balance} ${tokenSymbol}.`,
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    onOpenChange(false);
    setAmount('');
    toast({
      title: `${action} Initiated`,
      description: `Your transaction to ${action.toLowerCase()} ${numericAmount} ${tokenSymbol} has been submitted.`,
    });
  };

  const setMax = () => {
    setAmount(balance.toString());
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{action} {tokenSymbol}</DialogTitle>
          <DialogDescription>
            Enter the amount to {action.toLowerCase()}. Available: {balance.toFixed(4)} {tokenSymbol}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 relative">
                <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="pr-16"
                />
                <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7" onClick={setMax}>Max</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAction} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? `${action}ing...` : `Confirm ${action}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
