'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { ui } from '@/lib/theme';
import { cn } from '@/lib/cn';
import { Card } from '@/componentes/ui/card';
import { Button } from '@/componentes/ui/button';
import { Badge } from '@/componentes/ui/badge';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    const { user, logout, initialized } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const { collapsed, mobileOpen, closeMobile } = useSidebar();

    useEffect(() => {
        if (!initialized) return;
        if (!user) router.replace('/');
    }, [initialized, user, router]);

    const esAdmin = !!user && (user.rol === 'Admin' || user.rol === 'Operador');

    const menuCliente = useMemo(
        () => [
            { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
            { href: '/reservas', label: 'Mis reservas', icon: '📅' },
            { href: '/canchas', label: 'Canchas', icon: '⚽' },
        ],
        []
    );

    const menuAdmin = useMemo(
        () => [
            { href: '/admin/reservas', label: 'Reservas', icon: '🧾' },
            { href: '/admin/canchas', label: 'Canchas', icon: '🏟️' },
            { href: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
        ],
        []
    );

    const isActive = (href: string) => {
        if (pathname === href) return true;
        if (href !== '/dashboard' && pathname.startsWith(href + '/')) return true;
        return false;
    };

    if (!initialized) return <div className={ui.scene}>Cargando...</div>;
    if (!user) return <div className={ui.scene}>Redirigiendo...</div>;

    const closeMobileIfNeeded = () => {
        if (typeof window === 'undefined') return;
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (isMobile) closeMobile();
    };

    return (
        <div className={cn(ui.scene, 'h-screen overflow-hidden')}>
            <div
                className="absolute inset-0 -z-10 bg-cover bg-center opacity-25 pointer-events-none"
                style={{ backgroundImage: "url('/hero.png')" }}
            />
            <div className={cn(ui.glowTopLeft, 'pointer-events-none')} />
            <div className={cn(ui.glowBottomRight, 'pointer-events-none')} />

            {mobileOpen && (
                <button
                    type="button"
                    onClick={closeMobile}
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    aria-label="Cerrar menú"
                />
            )}

            <div className="h-full w-full p-0">
                <div className="h-full flex gap-4">
                    <aside
                        className={cn(
                            'transition-[width,transform] duration-200 z-50',
                            'fixed inset-y-0 left-0 w-[85vw] max-w-[320px] md:static md:inset-auto md:max-w-none',
                            mobileOpen ? 'translate-x-0' : '-translate-x-full',
                            'md:translate-x-0',
                            collapsed ? 'md:w-[88px]' : 'md:w-72'
                        )}
                    >
                        <Card className={cn('h-full p-5 overflow-hidden rounded-l-none', collapsed && 'p-4')}>
                            <div className="h-full flex flex-col">
                                <div className={cn('mb-4', collapsed ? 'flex flex-col items-center gap-3' : 'flex items-center gap-3')}>
                                    <Image
                                        src="/campolibre-logo.png"
                                        alt="CampoLibre"
                                        width={40}
                                        height={40}
                                        className={cn('object-contain', collapsed ? 'mt-2 h-10 w-10' : 'h-10 w-10')}
                                        priority
                                    />

                                    {!collapsed && (
                                        <div className="min-w-0">
                                            <p className="text-white font-semibold leading-tight truncate">CampoLibre</p>
                                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                                                <span className="text-white/60 text-sm">Reservas deportivas</span>
                                                <Badge variant={esAdmin ? 'info' : 'neutral'}>{user.rol}</Badge>
                                            </div>
                                        </div>
                                    )}

                                    {collapsed && <Badge variant={esAdmin ? 'info' : 'neutral'}>{user.rol}</Badge>}
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                                    <nav className={cn('flex flex-col gap-2 text-sm', collapsed && 'items-center')}>
                                        {menuCliente.map((item) => (
                                            <SidebarLink
                                                key={item.href}
                                                href={item.href}
                                                active={isActive(item.href)}
                                                label={item.label}
                                                icon={item.icon}
                                                collapsed={collapsed}
                                                onClick={closeMobileIfNeeded}
                                            />
                                        ))}

                                        {esAdmin && (
                                            <>
                                                <div className="my-3 border-t border-white/10" />
                                                {!collapsed && (
                                                    <span className="text-xs uppercase tracking-wide text-white/45 px-1">
                                                        Administración
                                                    </span>
                                                )}
                                                {menuAdmin.map((item) => (
                                                    <SidebarLink
                                                        key={item.href}
                                                        href={item.href}
                                                        active={isActive(item.href)}
                                                        label={item.label}
                                                        icon={item.icon}
                                                        collapsed={collapsed}
                                                        onClick={closeMobileIfNeeded}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </nav>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    {!collapsed && <p className="text-xs text-white/60 mb-3 truncate">{user.email}</p>}
                                    <Button
                                        variant="danger"
                                        className={cn('w-full', collapsed && 'px-0')}
                                        onClick={() => {
                                            closeMobile();
                                            logout();
                                            router.replace('/');
                                        }}
                                    >
                                        {collapsed ? '⎋' : 'Cerrar sesión'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </aside>
                    <main className="flex-1 min-w-0 h-full overflow-y-auto">{children}</main>
                </div>
            </div>
        </div>
    );
}

function SidebarLink({
    href,
    label,
    icon,
    active,
    collapsed,
    onClick,
}: {
    href: string;
    label: string;
    icon?: string;
    active: boolean;
    collapsed: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'px-3 py-2.5 rounded-xl transition border flex items-center gap-3',
                collapsed && 'justify-center px-2 w-12',
                active
                    ? 'bg-white/10 border-white/15 text-white'
                    : 'bg-white/0 border-transparent text-white/75 hover:text-white hover:bg-white/5'
            )}
            title={collapsed ? label : undefined}
        >
            <span className="w-5 text-center">{icon ?? '•'}</span>
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}
