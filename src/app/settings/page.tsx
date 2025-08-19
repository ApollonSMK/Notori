"use client";

import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, ChevronRight, Languages, LogOut, ShieldQuestion } from 'lucide-react';

const MOCK_USER = {
  username: "notorious.eth",
  avatar: "https://placehold.co/80x80.png",
};

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-md px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and app preferences.</p>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage data-ai-hint="user avatar" src={MOCK_USER.avatar} alt={MOCK_USER.username} />
                    <AvatarFallback>{MOCK_USER.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{MOCK_USER.username}</CardTitle>
                    <CardDescription>World App User</CardDescription>
                </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Notifications</span>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                     <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <Languages className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Language</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">English</span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </button>
                    <Separator />
                     <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <ShieldQuestion className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Help & Support</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <Separator />
                    <Button variant="ghost" className="w-full justify-start p-3 text-destructive hover:text-destructive hover:bg-destructive/10 mt-2">
                        <LogOut className="h-5 w-5 mr-3" />
                        <span className="font-medium">Log Out</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
