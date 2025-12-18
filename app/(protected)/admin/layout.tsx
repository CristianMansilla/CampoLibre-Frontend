'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { initialized, user, isAdmin } = useAuth();

    useEffect(() => {
        if (!initialized) return;
        // No logueado → Home (login)
        if (!user) {
            router.replace('/');
            return;
        }
        // Logueado pero sin permisos → Dashboard
        if (!isAdmin) {
            router.replace('/dashboard');
        }
    }, [initialized, user, isAdmin, router]);

    if (!initialized) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center">
                <p className="text-white/70">Cargando...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center">
                <p className="text-white/70">Redirigiendo a login...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center">
                <p className="text-white/70">Sin permisos. Redirigiendo...</p>
            </div>
        );
    }

    return <>{children}</>;
}
