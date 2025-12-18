'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type SidebarContextType = {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    toggleCollapsed: () => void;

    mobileOpen: boolean;
    setMobileOpen: (value: boolean) => void;
    toggleMobile: () => void;
    closeMobile: () => void;

    toggleResponsive: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const [collapsed, setCollapsed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('sidebar_collapsed') === '1';
    });

    const toggleCollapsed = () => {
        setCollapsed((v) => {
            const next = !v;
            if (typeof window !== 'undefined') {
                localStorage.setItem('sidebar_collapsed', next ? '1' : '0');
            }
            return next;
        });
    };

    const toggleMobile = () => setMobileOpen((v) => !v);
    const closeMobile = () => setMobileOpen(false);

    const toggleResponsive = () => {
        if (typeof window === 'undefined') return;
        const isDesktop = window.matchMedia('(min-width: 768px)').matches; // md
        if (isDesktop) toggleCollapsed();
        else toggleMobile();
    };

    return (
        <SidebarContext.Provider
            value={{
                collapsed,
                setCollapsed,
                toggleCollapsed,
                mobileOpen,
                setMobileOpen,
                toggleMobile,
                closeMobile,
                toggleResponsive,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const ctx = useContext(SidebarContext);
    if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
    return ctx;
}
