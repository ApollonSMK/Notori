
"use client";

import { useContext } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, ChevronRight, LogOut, ShieldQuestion, Settings } from 'lucide-react';
import { AppContext } from '@/context/AppContext';

export default function SettingsPage() {
  const { logout } = useContext(AppContext);
  
  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="flex items-center gap-4 mb-6">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Settings</h1>
        </header>

        <Card className="mb-6 bg-card backdrop-blur-xl border border-white/10">
            <CardHeader>
                <CardTitle className="text-lg">Preferences</CardTitle>
                <CardDescription>Manage your app settings and notifications.</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Push Notifications</span>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                     <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-left">
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
                className="w-full justify-center p-3 text-red-400 hover:text-red-400 hover:bg-red-400/10"
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

    