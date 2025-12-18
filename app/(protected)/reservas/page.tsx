'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { fetchMisReservas, eliminarReserva, type Reserva } from '@/lib/api';
import { Button } from '@/componentes/ui/button';
import { Badge } from '@/componentes/ui/badge';
import { Alert } from '@/componentes/ui/alert';

function fmt(dt: string) {
    return new Date(dt).toLocaleString();
}

export default function ReservasPage() {
    const { user, token, initialized } = useAuth();
    const { toggleResponsive } = useSidebar();

    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        if (!initialized) return;

        if (!token) {
            setError('Tenés que iniciar sesión.');
            setLoading(false);
            return;
        }

        const authToken = token;

        async function cargar() {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchMisReservas(authToken);
                setReservas(data);
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar tus reservas.');
            } finally {
                setLoading(false);
            }
        }

        cargar();
    }, [initialized, token]);

    const tieneReservas = useMemo(() => reservas.length > 0, [reservas.length]);

    if (!initialized) return <p className="p-6 text-white/70">Cargando...</p>;

    if (!user || !token) {
        return (
            <div className="p-6 sm:p-8">
                <Alert variant="danger">
                    <p className="font-semibold">No autenticado</p>
                    <p className="text-sm mt-1">Iniciá sesión para ver tus reservas.</p>

                    <div className="mt-4 flex gap-3 flex-wrap">
                        <Link href="/">
                            <Button>Ir a Home</Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="secondary">Volver al dashboard</Button>
                        </Link>
                    </div>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <nav className="text-sm text-white/60 flex flex-wrap items-center gap-2">
                        <span className="text-white/30">Home</span>
                        <span className="text-white/30">/</span>
                        <span className="text-white/80">Mis reservas</span>
                    </nav>

                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">
                        Mis reservas
                    </h1>

                    <p className="text-white/65 mt-2 max-w-2xl">
                        Consultá tus reservas, revisá el estado de pago y cancelá si hace falta.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="info" className="truncate max-w-[320px]">
                            {user.email}
                        </Badge>
                        <Badge variant="neutral">
                            {reservas.length} reserva{reservas.length === 1 ? '' : 's'}
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

            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-white/60 text-sm">
                    {loading ? 'Cargando...' : tieneReservas ? 'Tus reservas recientes' : 'Sin reservas'}
                </div>

                <Link href="/reservas/nueva">
                    <Button>Crear reserva</Button>
                </Link>
            </div>

            <div className="my-6 border-t border-white/10" />

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <div className="h-4 w-40 bg-white/10 rounded mb-3" />
                            <div className="h-3 w-64 bg-white/10 rounded mb-2" />
                            <div className="h-3 w-56 bg-white/10 rounded mb-2" />
                            <div className="h-3 w-28 bg-white/10 rounded" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && error && (
                <Alert variant="danger">
                    <p className="font-semibold">Ocurrió un error</p>
                    <p className="text-sm mt-1">{error}</p>
                </Alert>
            )}

            {!loading && !error && !tieneReservas && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                    <h2 className="text-white font-semibold text-lg">
                        Todavía no tenés reservas
                    </h2>
                    <p className="text-white/65 text-sm mt-2">
                        Creá una reserva para asegurar tu horario.
                    </p>
                    <div className="mt-5">
                        <Link href="/reservas/nueva">
                            <Button variant="secondary">Crear mi primera reserva →</Button>
                        </Link>
                    </div>
                </div>
            )}

            {!loading && !error && tieneReservas && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reservas.map((r) => (
                        <div
                            key={r.id}
                            className={[
                                'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6',
                                'transition hover:bg-white/10 hover:border-white/20',
                            ].join(' ')}
                        >
                            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-cyan-500/20 to-transparent pointer-events-none" />

                            <div className="relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-white font-semibold text-lg">
                                            Reserva #{r.id}
                                        </p>
                                        <p className="text-white/65 text-sm mt-1">
                                            Cancha:{' '}
                                            <span className="text-white/80 font-semibold">
                                                {r.canchaNombre ?? r.canchaId}
                                            </span>
                                        </p>
                                    </div>

                                    <Badge variant={r.pagada ? 'success' : 'neutral'}>
                                        {r.pagada ? 'Pagada' : 'Pendiente'}
                                    </Badge>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-white/60">Inicio</span>
                                        <span className="text-white/80">{fmt(r.fechaHoraInicio)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-white/60">Fin</span>
                                        <span className="text-white/80">{fmt(r.fechaHoraFin)}</span>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-emerald-300">
                                        Ir → <span className="text-white/40">(detalle)</span>
                                    </span>

                                    <Button
                                        variant="danger"
                                        size="sm"
                                        disabled={deletingId === r.id}
                                        onClick={async () => {
                                            try {
                                                setDeletingId(r.id);
                                                await eliminarReserva(r.id, token);
                                                setReservas((prev) => prev.filter((x) => x.id !== r.id));
                                            } catch (e) {
                                                console.error(e);
                                                setError('No se pudo cancelar la reserva.');
                                            } finally {
                                                setDeletingId(null);
                                            }
                                        }}
                                    >
                                        {deletingId === r.id ? 'Cancelando...' : 'Cancelar'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}
