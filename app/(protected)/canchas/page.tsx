'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { fetchCanchas, type Cancha } from '@/lib/api';
import { Button } from '@/componentes/ui/button';
import { Badge } from '@/componentes/ui/badge';
import { Alert } from '@/componentes/ui/alert';

const currencyAR = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

type FiltroTipo = 'Todos' | string;
type FiltroBool = 'Sí' | 'No' | null;




export default function CanchasPage() {
    const { user, initialized } = useAuth();
    const { toggleResponsive } = useSidebar();

    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tipo, setTipo] = useState<FiltroTipo>('Todos');
    const [techada, setTechada] = useState<FiltroBool>(null);
    const [iluminacion, setIluminacion] = useState<FiltroBool>(null);

    useEffect(() => {
        async function cargar() {
            try {
                setLoading(true);
                setError(null);
                setCanchas(await fetchCanchas());
            } catch (e) {
                console.error(e);
                setError('No se pudieron cargar las canchas.');
            } finally {
                setLoading(false);
            }
        }
        cargar();
    }, []);

    const tiposDisponibles = useMemo(() => {
        const set = new Set<string>();
        canchas.forEach((c) => {
            if (c.tipo?.trim()) set.add(c.tipo.trim());
        });
        return ['Todos', ...Array.from(set).sort((a, b) => a.localeCompare(b))] as const;
    }, [canchas]);

    const filtradas = useMemo(() => {
        return canchas.filter((c) => {
            if (tipo !== 'Todos' && c.tipo !== tipo) return false;

            if (techada != null) {
                const want = techada === 'Sí';
                if (!!c.techada !== want) return false;
            }

            if (iluminacion != null) {
                const want = iluminacion === 'Sí';
                if (!!c.iluminacion !== want) return false;
            }


            return true;
        });
    }, [canchas, tipo, techada, iluminacion]);

    const resumen = useMemo(() => {
        const total = canchas.length;
        const techadas = canchas.filter((c) => c.techada).length;
        const conLuz = canchas.filter((c) => c.iluminacion).length;

        const precios = canchas.map((c) => Number(c.precioHora) || 0).filter((x) => x > 0);
        const min = precios.length ? Math.min(...precios) : 0;
        const max = precios.length ? Math.max(...precios) : 0;

        return { total, techadas, conLuz, min, max };
    }, [canchas]);

    if (!initialized) return <p className="p-6 text-white/70">Cargando...</p>;

    return (
        <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <nav className="text-sm text-white/60 flex flex-wrap items-center gap-2">
                        <span className="text-white/30">Home</span>
                        <span className="text-white/30">/</span>
                        <span className="text-white/80">Canchas</span>
                    </nav>

                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">
                        Canchas disponibles
                    </h1>

                    <p className="text-white/65 mt-2 max-w-2xl">
                        Explorá canchas y precios. Usá filtros para encontrar la que necesitás.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="info" className="truncate max-w-[320px]">
                            {user?.email ?? '-'}
                        </Badge>
                        <Badge variant="neutral">{loading ? 'Cargando…' : `${filtradas.length} visibles`}</Badge>
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

            {error && (
                <div className="mb-4">
                    <Alert variant="danger">{error}</Alert>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
                <section className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <p className="text-white/60 text-sm">Listado</p>
                            <p className="text-white/75 text-sm mt-1">
                                {loading ? 'Cargando canchas…' : `${filtradas.length} cancha${filtradas.length === 1 ? '' : 's'} según filtros`}
                            </p>
                        </div>

                        <Link href="/reservas/nueva">
                            <Button size="sm">Reservar ahora</Button>
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-4">
                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                        <div className="h-4 w-40 bg-white/10 rounded mb-3" />
                                        <div className="h-3 w-56 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-44 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-28 bg-white/10 rounded" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && !error && filtradas.length === 0 && (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <p className="text-white font-medium">No hay canchas con esos filtros</p>
                                <p className="text-white/65 text-sm mt-1">
                                    Probá cambiar tipo / techada / iluminación.
                                </p>
                            </div>
                        )}

                        {!loading && !error && filtradas.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filtradas.map((c) => (
                                    <div
                                        key={c.id}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/10 transition"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="text-white font-semibold truncate">{c.nombre}</h3>
                                                <p className="text-sm text-white/60 mt-1">
                                                    Tipo: <span className="text-white/75">{c.tipo}</span>
                                                </p>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Badge variant={c.techada ? 'success' : 'neutral'}>
                                                        {c.techada ? 'Techada' : 'No techada'}
                                                    </Badge>
                                                    <Badge variant={c.iluminacion ? 'info' : 'neutral'}>
                                                        {c.iluminacion ? 'Con iluminación' : 'Sin iluminación'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-white/50">Precio/hora</p>
                                                <p className="text-white font-semibold">
                                                    {currencyAR.format(c.precioHora)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <span className="text-xs text-white/50">ID #{c.id}</span>
                                            <Link href="/reservas/nueva" className="text-sm text-emerald-300 hover:text-emerald-200">
                                                Elegir →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <aside className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-white">Filtros</h2>
                    <p className="text-white/65 text-sm mt-1">
                        Refiná el listado para reservar más rápido.
                    </p>

                    <div className="mt-5 space-y-4">
                        <div>
                            <p className="text-xs text-white/60 mb-2">Tipo</p>
                            <div className="flex flex-wrap gap-2">
                                {tiposDisponibles.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTipo(t)}
                                        className={[
                                            'px-3 py-2 rounded-xl border text-sm transition',
                                            t === tipo
                                                ? 'border-white/20 bg-white/10 text-white'
                                                : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/10',
                                        ].join(' ')}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <BoolToggle label="Techada" value={techada} onChange={setTechada} />
                            <BoolToggle label="Iluminación" value={iluminacion} onChange={setIluminacion} />
                        </div>

                        <div className="border-t border-white/10 pt-5">
                            <h3 className="text-white font-semibold">Resumen</h3>
                            <div className="mt-3 space-y-2 text-sm">
                                <Row label="Total canchas" value={loading ? '—' : String(resumen.total)} />
                                <Row label="Techadas" value={loading ? '—' : String(resumen.techadas)} />
                                <Row label="Con luz" value={loading ? '—' : String(resumen.conLuz)} />
                                <Row
                                    label="Precio desde"
                                    value={loading || !resumen.min ? '—' : currencyAR.format(resumen.min)}
                                />
                                <Row
                                    label="Precio hasta"
                                    value={loading || !resumen.max ? '—' : currencyAR.format(resumen.max)}
                                />
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-5">
                            <h3 className="text-white font-semibold">Sugerencia</h3>
                            <p className="text-white/65 text-sm mt-1">
                                Horarios pico suelen ser 18:00–22:00. Si querés asegurar lugar, reservá con anticipación.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function BoolToggle({
    label,
    value,
    onChange,
}: {
    label: string;
    value: 'Sí' | 'No' | null;
    onChange: (v: 'Sí' | 'No' | null) => void;
}) {
    const set = (next: 'Sí' | 'No') => {
        onChange(value === next ? null : next);
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-white/60">{label}</p>

            <div className="mt-3 flex gap-2">
                <button
                    type="button"
                    onClick={() => set('Sí')}
                    className={[
                        'px-3 py-2 rounded-xl border text-sm transition flex-1',
                        value === 'Sí'
                            ? 'border-white/20 bg-white/10 text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/10',
                    ].join(' ')}
                >
                    Sí
                </button>

                <button
                    type="button"
                    onClick={() => set('No')}
                    className={[
                        'px-3 py-2 rounded-xl border text-sm transition flex-1',
                        value === 'No'
                            ? 'border-white/20 bg-white/10 text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/10',
                    ].join(' ')}
                >
                    No
                </button>
            </div>

            <p className="text-[11px] text-white/45 mt-2">
                {value == null ? 'Sin filtro' : `Filtrando: ${value}`}
            </p>
        </div>
    );
}


function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-white/60">{label}</span>
            <span className="text-white/80 font-semibold">{value}</span>
        </div>
    );
}
