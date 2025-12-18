'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { Card } from '@/componentes/ui/card';
import { Badge } from '@/componentes/ui/badge';
import { cn } from '@/lib/cn';

const LABELS: Record<string, string> = {
    admin: 'Admin',
    reservas: 'Reservas',
    canchas: 'Canchas',
    usuarios: 'Usuarios',
    dashboard: 'Dashboard',
    nueva: 'Nueva',
    mias: 'Mías',
};

type HeaderProps = {
    collapsed: boolean;
    ontoggleResponsive: () => void;
};

function toLabel(seg: string) {
    return LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
}

function roleBadgeVariant(rol?: string) {
    if (rol === 'Admin') return 'success' as const;
    if (rol === 'Operador') return 'info' as const;
    return 'neutral' as const;
}

export default function Header({ collapsed, ontoggleResponsive }: HeaderProps) {
    const { user } = useAuth();
    const pathname = usePathname();

    const parts = useMemo(() => {
        const segs = pathname.split('/').filter(Boolean);
        return segs.map((seg, idx) => {
            const href = '/' + segs.slice(0, idx + 1).join('/');
            return { seg, href, label: toLabel(seg) };
        });
    }, [pathname]);

    const nombre = useMemo(() => {
        const email = user?.email ?? '';
        const base = email.includes('@') ? email.split('@')[0] : email;
        return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Usuario';
    }, [user?.email]);

    return (
        <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-start gap-3">
                        <button
                            type="button"
                            onClick={ontoggleResponsive}
                            className={cn(
                                'rounded-xl border border-white/10 bg-white/10 hover:bg-white/15',
                                'text-white/80 hover:text-white transition',
                                'h-10 w-10 grid place-items-center shrink-0'
                            )}
                            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
                            title={collapsed ? 'Expandir' : 'Contraer'}
                        >
                            ☰
                        </button>

                        <div className="min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-semibold text-white">
                                    Hola, {nombre}
                                </h1>

                                <Badge variant={roleBadgeVariant(user?.rol)}>
                                    {user?.rol ?? 'Cliente'}
                                </Badge>
                            </div>

                            <p className="text-sm text-white/60 mt-1 truncate">
                                {user?.email ?? ''}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="text-sm text-white/60 flex flex-wrap items-center gap-2">
                    <Link href="/dashboard" className="hover:text-white transition">
                        Home
                    </Link>

                    {parts.map((c) => (
                        <span key={c.href} className="flex items-center gap-2">
                            <span className="text-white/30">/</span>
                            <Link
                                href={c.href}
                                className="hover:text-white transition"
                                aria-current={c.href === pathname ? 'page' : undefined}
                            >
                                {c.label}
                            </Link>
                        </span>
                    ))}
                </nav>
            </div>
        </Card>
    );
}
