
"use client";

import { useState, useContext } from 'react';
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
import { AppContext } from '@/context/AppContext';

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
  const { stake, unstake } = useContext(AppContext);

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
            description: `You cannot ${action.toLowerCase()} more than your available balance.`,
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    
    try {
        if (action === 'Stake') {
            await stake(amount);
        } else {
            await unstake(amount);
        }
        toast({
            title: `${action} Submitted`,
            description: `Your transaction to ${action.toLowerCase()} ${numericAmount} ${tokenSymbol} has been sent.`,
        });
        onOpenChange(false);
        setAmount('');
    } catch (error) {
        toast({
            title: `${action} Failed`,
            description: error instanceof Error ? error.message : "An unknown error occurred.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const setMax = () => {
    setAmount(Number(balance.toFixed(6)).toString());
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isLoading) onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle>{action} {tokenSymbol}</DialogTitle>
          <DialogDescription>
            Enter the amount to {action.toLowerCase()}. Available: {balance.toFixed(4)} {tokenSymbol}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-left">
              Amount
            </Label>
            <div className="relative">
                <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="pr-16 text-lg h-12 bg-input border-white/10"
                />
                <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-9" onClick={setMax}>Set Max</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleAction} disabled={isLoading || !amount} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? `${action}ing...` : `Confirm ${action}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
