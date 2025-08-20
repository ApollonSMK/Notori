"use client";

import { useEffect, ReactNode } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

export function MiniKitProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        const installMiniKit = async () => {
            if (typeof window !== "undefined") {
                await MiniKit.install();
            }
        };
        installMiniKit();
    }, []);

    return <>{children}</>;
}
