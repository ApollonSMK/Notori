
"use client";

import { useContext } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, ChevronRight, LogOut, ShieldQuestion, Star, TrendingUp, User } from 'lucide-react';
import { AppContext } from '@/context/AppContext';

const StatCard = ({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value: string, unit: string }) => (
    <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-full">
            <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-bold text-lg">{value} <span className="text-sm font-normal text-muted-foreground">{unit}</span></p>
        </div>
    </div>
);

export default function ProfilePage() {
  const { username, stakedAmount, rewardsAccumulated, logout } = useContext(AppContext);
  
  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="flex items-center gap-4 mb-6">
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Profile</h1>
        </header>

        <Card className="mb-6 shadow-xl overflow-hidden">
            <div className="p-6 bg-primary/5">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg mb-3">
                        <AvatarImage data-ai-hint="user avatar" src={`https://placehold.co/80x80.png`} alt={username ?? 'user'} />
                        <AvatarFallback>{username?.substring(0, 2).toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl">{username ?? 'Not Connected'}</CardTitle>
                    <CardDescription>Member since {new Date().toLocaleDateString()}</CardDescription>
                </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
                <StatCard icon={TrendingUp} label="Total Staked" value={stakedAmount.toFixed(2)} unit="WLD" />
                <StatCard icon={Star} label="Total Rewards" value={rewardsAccumulated.toFixed(2)} unit="WLD" />
            </div>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Push Notifications</span>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                     <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                        <div className="flex items-center gap-4">
                            <ShieldQuestion className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Help & Support</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>
            </CardContent>
        </Card>
        
        <div className="mt-6">
             <Button 
                variant="ghost" 
                className="w-full justify-center p-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={logout}
             >
                <LogOut className="h-5 w-5 mr-2" />
                <span className="font-medium">Log Out</span>
            </Button>
        </div>
      </div>
    </AppLayout>
  );
}
