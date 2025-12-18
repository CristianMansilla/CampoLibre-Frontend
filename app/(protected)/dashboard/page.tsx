'use client';

import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

import { Button } from '@/componentes/ui/button';
import { Badge } from '@/componentes/ui/badge';
import { KpiCard } from '@/componentes/ui/kpi-card';

export default function DashboardPage() {
    const { user } = useAuth();
    const { toggleResponsive } = useSidebar();

    const esAdmin = user?.rol === 'Admin' || user?.rol === 'Operador';

    if (esAdmin) {
        // TODO: En un futuro voy a reemplazar por datos reales desde API
        const kpis = {
            reservasHoy: 12,
            pendientesPago: 4,
            cancelacionesSemana: 3,
            ocupacionHoyPct: 68,
        };

        const alertas = [
            { title: 'Pagos pendientes', desc: 'Hay reservas con estado Pendiente. Revisá antes del ingreso.' },
            { title: 'Horarios pico', desc: '18:00–22:00 tiene alta demanda. Considerá bloquear mantenimiento fuera de ese rango.' },
        ];

        const actividad = [
            { when: 'Hace 10 min', what: 'Nueva reserva creada', meta: 'Cancha Principal · 20:00' },
            { when: 'Hace 45 min', what: 'Pago confirmado', meta: 'Reserva #128 · Pagada' },
            { when: 'Hoy', what: 'Cancelación', meta: 'Reserva #122 · Cliente' },
        ];

        const ocupacion = [
            { label: 'Cancha Principal', pct: 78 },
            { label: 'Cancha 2', pct: 61 },
            { label: 'Cancha 3', pct: 44 },
        ];

        return (
            <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <nav className="text-sm text-white/60 flex flex-wrap items-center gap-2">
                            <span className="text-white/30">Home</span>
                            <span className="text-white/30">/</span>
                            <span className="text-white/80">Dashboard</span>
                        </nav>

                        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">
                            Panel administrativo
                        </h1>

                        <p className="text-white/65 mt-2 max-w-2xl">
                            Vista operativa para gestión de reservas, pagos y ocupación.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant="neutral">Rol: {user?.rol}</Badge>
                            <Badge variant="info" className="truncate max-w-[320px]">
                                {user?.email ?? '-'}
                            </Badge>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={toggleResponsive}
                        className={[
                            'shrink-0 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15',
                            'text-white/80 hover:text-white transition',
                            'h-10 w-10 grid place-items-center',
                        ].join(' ')}
                        aria-label="Abrir/cerrar menú"
                        title="Menú"
                    >
                        ☰
                    </button>
                </div>

                <div className="my-6 border-t border-white/10" />

                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiCard title="Reservas de hoy" value={kpis.reservasHoy} hint="Total del día" />
                    <KpiCard title="Pendientes de pago" value={kpis.pendientesPago} hint="Requiere revisión" />
                    <KpiCard title="Cancelaciones (semana)" value={kpis.cancelacionesSemana} hint="Tendencia semanal" />
                    <KpiCard title="Ocupación hoy" value={`${kpis.ocupacionHoyPct}%`} hint="Promedio estimado" />
                </section>

                <div className="my-6 border-t border-white/10" />

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-white">Alertas operativas</h2>
                            <Badge variant="neutral">Hoy</Badge>
                        </div>

                        <div className="mt-4 grid gap-3">
                            {alertas.map((a) => (
                                <div key={a.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="text-white font-medium">{a.title}</p>
                                    <p className="text-white/65 text-sm mt-1">{a.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <h2 className="text-lg font-semibold text-white">Accesos rápidos</h2>

                        <div className="mt-4 grid gap-3">
                            <Link href="/admin/reservas">
                                <Button className="w-full">Marcar pagada</Button>
                            </Link>

                            <Link href="/admin/canchas">
                                <Button variant="secondary" className="w-full">Bloquear horario</Button>
                            </Link>

                            <Link href="/admin/usuarios">
                                <Button variant="secondary" className="w-full">Usuarios</Button>
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="my-6 border-t border-white/10" />

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-white">Ocupación por cancha</h2>
                            <Badge variant="neutral">Mock</Badge>
                        </div>

                        <div className="mt-4 space-y-3">
                            {ocupacion.map((o) => (
                                <div key={o.label}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/80">{o.label}</span>
                                        <span className="text-white/60">{o.pct}%</span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500/60"
                                            style={{ width: `${Math.min(100, Math.max(0, o.pct))}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
                            <Badge variant="neutral">Últimos eventos</Badge>
                        </div>

                        <div className="mt-4 space-y-3">
                            {actividad.map((a, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-white font-medium">{a.what}</p>
                                        <span className="text-xs text-white/50">{a.when}</span>
                                    </div>
                                    <p className="text-white/65 text-sm mt-1">{a.meta}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        );
    }


    const email = user?.email ?? '-';
    const rolLabel = user?.rol ?? 'Cliente';

    // TODO: En un futuro voy a reemplazar por datos reales desde API
    const proximaReservaMock = null as null | {
        cancha: string;
        inicio: string;
        fin: string;
        estado: 'Pendiente' | 'Pagada';
    };

    return (
        <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <nav className="text-sm text-white/60 flex flex-wrap items-center gap-2">
                        <span className="text-white/30">Home</span>
                        <span className="text-white/30">/</span>
                        <span className="text-white/80">Dashboard</span>
                    </nav>

                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">
                        Panel de reservas
                    </h1>

                    <p className="text-white/65 mt-2 max-w-2xl">
                        Revisá tu próxima reserva, el estado de pagos y reglas importantes del sistema.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="neutral">Rol: {rolLabel}</Badge>
                        <Badge variant="info" className="truncate max-w-[320px]">
                            {email}
                        </Badge>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={toggleResponsive}
                    className={[
                        'shrink-0 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15',
                        'text-white/80 hover:text-white transition',
                        'h-10 w-10 grid place-items-center',
                    ].join(' ')}
                    aria-label="Abrir/cerrar menú"
                    title="Menú"
                >
                    ☰
                </button>
            </div>

            <div className="my-6 border-t border-white/10" />

            <section className="space-y-3">

                {proximaReservaMock ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-white font-medium">Cancha: {proximaReservaMock.cancha}</p>
                        <p className="text-white/70 text-sm mt-1">
                            {proximaReservaMock.inicio} – {proximaReservaMock.fin}
                        </p>
                        <div className="mt-3">
                            <Badge variant={proximaReservaMock.estado === 'Pagada' ? 'success' : 'neutral'}>
                                {proximaReservaMock.estado}
                            </Badge>
                        </div>

                        <div className="mt-4">
                            <Link href="/reservas">
                                <Button size="sm">Ver detalle</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-white/70">Todavía no tenés una reserva próxima.</p>
                        <div className="mt-4">
                            <Link href="/canchas">
                                <Button>Reservar ahora</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </section>

            <div className="my-6 border-t border-white/10" />

            <section className="space-y-3">
                <h2 className="text-lg font-semibold text-white">Información útil</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-white font-medium">Cancelaciones</p>
                        <p className="text-white/65 text-sm mt-1">
                            Podés cancelar desde “Mis reservas”. Próximamente se sumarán ventanas de tiempo y penalizaciones.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-white font-medium">Pagos</p>
                        <p className="text-white/65 text-sm mt-1">
                            Revisá el estado Pendiente / Pagada dentro de cada reserva.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-white font-medium">Recomendación</p>
                        <p className="text-white/65 text-sm mt-1">
                            Reservá con anticipación en horarios pico. Si una cancha no aparece, puede estar ocupada o fuera de servicio.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
