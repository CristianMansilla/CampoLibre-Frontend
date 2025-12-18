'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchReservasAdmin, setReservaPagada, type Reserva } from '@/lib/api';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ConfirmDialog from '@/componentes/ui/confirm-dialog';
import { Badge } from '@/componentes/ui/badge';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Label } from '@/componentes/ui/label';
import { Select } from '@/componentes/ui/select';
import { useSidebar } from '@/context/SidebarContext';

type Option = { id: number; label: string };

function toMillis(value: string): number | null {
    if (!value) return null;
    const d = new Date(value);
    const ms = d.getTime();
    return Number.isNaN(ms) ? null : ms;
}

function asBool01(value: string | null) {
    return value === '1' || value === 'true';
}

function fmt(dt: string) {
    return new Date(dt).toLocaleString();
}

export default function AdminReservasPage() {
    const { user, token, initialized } = useAuth();
    const { toggleResponsive } = useSidebar();

    const esAdmin = user?.rol === 'Admin' || user?.rol === 'Operador';

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [q, setQ] = useState('');
    const [soloNoPagadas, setSoloNoPagadas] = useState(false);
    const [canchaIdSel, setCanchaIdSel] = useState<string>('');
    const [usuarioIdSel, setUsuarioIdSel] = useState<string>('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
    const [savingReservaId, setSavingReservaId] = useState<number | null>(null);

    useEffect(() => {
        setQ(searchParams.get('q') ?? '');
        setSoloNoPagadas(asBool01(searchParams.get('soloNoPagadas')));
        setCanchaIdSel(searchParams.get('canchaId') ?? '');
        setUsuarioIdSel(searchParams.get('usuarioId') ?? '');
        setDesde(searchParams.get('desde') ?? '');
        setHasta(searchParams.get('hasta') ?? '');
    }, [searchParams]);

    useEffect(() => {
        const sp = new URLSearchParams(searchParams.toString());

        const write = () => {
            const qTrim = q.trim();
            if (qTrim) sp.set('q', qTrim);
            else sp.delete('q');

            if (soloNoPagadas) sp.set('soloNoPagadas', '1');
            else sp.delete('soloNoPagadas');

            if (canchaIdSel) sp.set('canchaId', canchaIdSel);
            else sp.delete('canchaId');

            if (usuarioIdSel) sp.set('usuarioId', usuarioIdSel);
            else sp.delete('usuarioId');

            if (desde) sp.set('desde', desde);
            else sp.delete('desde');

            if (hasta) sp.set('hasta', hasta);
            else sp.delete('hasta');

            const query = sp.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        };

        const t = setTimeout(write, 250);
        return () => clearTimeout(t);
    }, [q, soloNoPagadas, canchaIdSel, usuarioIdSel, desde, hasta, pathname, router, searchParams]);

    useEffect(() => {
        if (!initialized) return;

        if (!token || !user) {
            setError('Necesitás iniciar sesión.');
            setLoading(false);
            return;
        }

        if (user.rol !== 'Admin' && user.rol !== 'Operador') {
            setError('No tenés permisos para ver esta sección.');
            setLoading(false);
            return;
        }

        const t = token;

        async function cargar() {
            try {
                setLoading(true);
                const data = await fetchReservasAdmin(t);
                setReservas(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar las reservas.');
            } finally {
                setLoading(false);
            }
        }

        cargar();
    }, [initialized, token, user]);

    const canchasOptions = useMemo<Option[]>(() => {
        const map = new Map<number, string>();
        for (const r of reservas) {
            const label = r.canchaNombre?.trim() || `Cancha ${r.canchaId}`;
            map.set(r.canchaId, label);
        }
        return Array.from(map.entries())
            .map(([id, label]) => ({ id, label }))
            .sort((a, b) => a.label.localeCompare(b.label, 'es'));
    }, [reservas]);

    const usuariosOptions = useMemo<Option[]>(() => {
        const map = new Map<number, string>();
        for (const r of reservas) {
            const label = r.usuarioNombre?.trim() || `#${r.usuarioId}`;
            map.set(r.usuarioId, label);
        }
        return Array.from(map.entries())
            .map(([id, label]) => ({ id, label }))
            .sort((a, b) => a.label.localeCompare(b.label, 'es'));
    }, [reservas]);

    const canchaSelectOptions = useMemo(
        () => [{ value: '', label: 'Todas' }, ...canchasOptions.map((c) => ({ value: String(c.id), label: c.label }))],
        [canchasOptions]
    );

    const usuarioSelectOptions = useMemo(
        () => [{ value: '', label: 'Todos' }, ...usuariosOptions.map((u) => ({ value: String(u.id), label: u.label }))],
        [usuariosOptions]
    );

    const filtradas = useMemo(() => {
        const qLower = q.trim().toLowerCase();
        const desdeMs = toMillis(desde);
        const hastaMs = toMillis(hasta);

        const canchaIdNum = canchaIdSel ? Number(canchaIdSel) : null;
        const usuarioIdNum = usuarioIdSel ? Number(usuarioIdSel) : null;

        return reservas
            .filter((r) => {
                const hayTexto = `${r.id} ${r.usuarioNombre ?? ''} ${r.canchaNombre ?? ''}`.toLowerCase();
                const pasaTexto = qLower ? hayTexto.includes(qLower) : true;

                const pasaPagadas = soloNoPagadas ? !r.pagada : true;
                const pasaCancha = canchaIdNum ? r.canchaId === canchaIdNum : true;
                const pasaUsuario = usuarioIdNum ? r.usuarioId === usuarioIdNum : true;

                const inicioMs = new Date(r.fechaHoraInicio).getTime();
                const finMs = new Date(r.fechaHoraFin).getTime();

                const pasaDesde = desdeMs !== null ? finMs >= desdeMs : true;
                const pasaHasta = hastaMs !== null ? inicioMs <= hastaMs : true;

                return pasaTexto && pasaPagadas && pasaCancha && pasaUsuario && pasaDesde && pasaHasta;
            })
            .sort((a, b) => {
                const aExpired = isExpiredReserva(a);
                const bExpired = isExpiredReserva(b);
                if (aExpired !== bExpired) return aExpired ? 1 : -1; // no caducadas primero

                const aInicio = new Date(a.fechaHoraInicio).getTime();
                const bInicio = new Date(b.fechaHoraInicio).getTime();
                const byDateDesc = (Number.isNaN(bInicio) ? 0 : bInicio) - (Number.isNaN(aInicio) ? 0 : aInicio);
                if (byDateDesc !== 0) return byDateDesc;

                return b.id - a.id;
            });


    }, [reservas, q, soloNoPagadas, canchaIdSel, usuarioIdSel, desde, hasta]);

    function limpiarFiltros() {
        setQ('');
        setSoloNoPagadas(false);
        setCanchaIdSel('');
        setUsuarioIdSel('');
        setDesde('');
        setHasta('');
    }

    if (!initialized) return <p className="p-6 text-white/70">Cargando...</p>;

    if (!esAdmin) {
        return (
            <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <nav className="text-sm text-white/60 flex flex-wrap items-center gap-2">
                            <span className="text-white/30">Home</span>
                            <span className="text-white/30">/</span>
                            <span className="text-white/80">Admin</span>
                            <span className="text-white/30">/</span>
                            <span className="text-white/80">Reservas</span>
                        </nav>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">Reservas (Admin)</h1>
                        <p className="text-white/65 mt-2 max-w-2xl">No tenés permisos para ver esta sección.</p>
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
                        ☐
                    </button>
                </div>

                <div className="my-6 border-t border-white/10" />

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-white font-medium">Acceso restringido</p>
                    <p className="text-white/65 text-sm mt-1">Ingresá con un usuario Admin u Operador.</p>
                    <div className="mt-4">
                        <Link href="/dashboard">
                            <Button variant="secondary">Volver al dashboard</Button>
                        </Link>
                    </div>
                </div>
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
                        <span className="text-white/80">Admin</span>
                        <span className="text-white/30">/</span>
                        <span className="text-white/80">Reservas</span>
                    </nav>

                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">Reservas</h1>

                    <p className="text-white/65 mt-2 max-w-2xl">
                        Control operativo: filtros por cancha/usuario/fechas y gestión del estado de pago.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="neutral">Rol: {user?.rol}</Badge>
                        <Badge variant="info" className="truncate max-w-[320px]">{user?.email ?? '-'}</Badge>
                        <Badge variant="neutral">{filtradas.length} resultado{filtradas.length === 1 ? '' : 's'}</Badge>
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

            <div className="flex items-center justify-between gap-3 flex-wrap py-1 mb-4">
                <Link
                    href="/reservas"
                    className="text-sm text-emerald-300 hover:text-emerald-200"
                >
                    ← Ir a mis reservas
                </Link>
            </div>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 relative z-[60] overflow-visible">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-4">
                        <Label>Buscar</Label>
                        <Input
                            placeholder="Buscar por id, usuario o cancha..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label>Cancha</Label>
                        <Select
                            value={canchaIdSel}
                            onChange={setCanchaIdSel}
                            options={canchaSelectOptions}
                            disabled={loading || canchaSelectOptions.length <= 1}
                            placeholder="Todas"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label>Usuario</Label>
                        <Select
                            value={usuarioIdSel}
                            onChange={setUsuarioIdSel}
                            options={usuarioSelectOptions}
                            disabled={loading || usuarioSelectOptions.length <= 1}
                            placeholder="Todos"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label>Desde</Label>
                        <Input type="datetime-local" value={desde} onChange={(e) => setDesde(e.target.value)} />
                    </div>

                    <div className="md:col-span-2">
                        <Label>Hasta</Label>
                        <Input type="datetime-local" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                    </div>

                    <div className="md:col-span-12 flex flex-col md:flex-row gap-3 md:items-center md:justify-between pt-2">
                        <label className="flex items-center gap-2 text-sm text-white/80">
                            <input
                                type="checkbox"
                                checked={soloNoPagadas}
                                onChange={(e) => setSoloNoPagadas(e.target.checked)}
                            />
                            Solo no pagadas
                        </label>

                        <div className="flex gap-2 flex-wrap">
                            <Button variant="secondary" onClick={limpiarFiltros}>
                                Limpiar filtros
                            </Button>

                        </div>
                    </div>
                </div>
            </section>

            <div className="my-6 border-t border-white/10" />

            {loading && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-white/70">Cargando reservas...</p>
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                    <p className="text-red-200 font-semibold">Ocurrió un error</p>
                    <p className="text-red-200/80 text-sm mt-1">{error}</p>
                </div>
            )}

            {!loading && !error && reservas.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-white font-medium">No hay reservas todavía</p>
                    <p className="text-white/65 text-sm mt-1">Las reservas creadas por clientes aparecerán acá.</p>
                </div>
            )}

            {!loading && !error && reservas.length > 0 && filtradas.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-white font-medium">Sin resultados</p>
                        <p className="text-white/65 text-sm mt-1">Probá ajustar o limpiar los filtros.</p>
                    </div>
                    <Button variant="secondary" onClick={limpiarFiltros}>
                        Limpiar filtros
                    </Button>
                </div>
            )}

            {!loading && !error && filtradas.length > 0 && (
                <section className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-white/[0.04] border-b border-white/10">
                                <tr className="text-white/70">
                                    <th className="text-left px-4 py-3">ID</th>
                                    <th className="text-left px-4 py-3">Usuario</th>
                                    <th className="text-left px-4 py-3">Cancha</th>
                                    <th className="text-left px-4 py-3">Inicio</th>
                                    <th className="text-left px-4 py-3">Fin</th>
                                    <th className="text-left px-4 py-3">Estado</th>
                                    <th className="text-left px-4 py-3">Pago</th>
                                    <th className="text-left px-4 py-3">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtradas.map((r) => {
                                    const expired = isExpiredReserva(r);

                                    return (
                                        <tr
                                            key={r.id}
                                            className={[
                                                'border-b border-white/10 last:border-b-0 transition',
                                                expired ? 'opacity-55' : 'hover:bg-white/[0.03]',
                                            ].join(' ')}
                                        >
                                            <td className="px-4 py-3 text-white/85">{r.id}</td>

                                            <td className="px-4 py-3 text-white/85">
                                                {r.usuarioNombre ?? `#${r.usuarioId}`}
                                            </td>

                                            <td className="px-4 py-3 text-white/85">
                                                {r.canchaNombre ?? `Cancha ${r.canchaId}`}
                                            </td>

                                            <td className="px-4 py-3 text-white/75">{fmt(r.fechaHoraInicio)}</td>
                                            <td className="px-4 py-3 text-white/75">{fmt(r.fechaHoraFin)}</td>

                                            <td className="px-4 py-3">
                                                <div className="w-[120px]">
                                                    {expired ? (
                                                        <Badge variant="neutral" className="w-full justify-center">
                                                            Caducada
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="info" className="w-full justify-center">
                                                            Activa
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="w-[120px]">
                                                    {r.pagada ? (
                                                        <Badge variant="success" className="w-full justify-center">
                                                            Pagada
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="warning" className="w-full justify-center">
                                                            Pendiente
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="w-[180px]">
                                                    <Button
                                                        variant={r.pagada ? 'secondary' : 'primary'}
                                                        size="sm"
                                                        className="w-full justify-center whitespace-nowrap"
                                                        disabled={savingReservaId === r.id || expired}
                                                        onClick={() => {
                                                            if (expired) return;
                                                            setReservaSeleccionada(r);
                                                            setConfirmOpen(true);
                                                        }}
                                                    >
                                                        {savingReservaId === r.id
                                                            ? 'Guardando...'
                                                            : r.pagada
                                                                ? 'Marcar pendiente'
                                                                : 'Marcar pagada'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                </section>
            )}

            <ConfirmDialog
                open={confirmOpen}
                title={reservaSeleccionada?.pagada ? 'Marcar reserva como pendiente' : 'Marcar reserva como pagada'}
                description={
                    reservaSeleccionada?.pagada
                        ? 'La reserva volverá a figurar como no pagada.'
                        : 'Confirmá que esta reserva ya fue abonada.'
                }
                confirmText="Sí, confirmar"
                cancelText="Cancelar"
                loading={savingReservaId !== null}
                onCancel={() => {
                    setConfirmOpen(false);
                    setReservaSeleccionada(null);
                }}
                onConfirm={async () => {
                    if (!token || !reservaSeleccionada) return;

                    try {
                        setSavingReservaId(reservaSeleccionada.id);

                        await setReservaPagada(reservaSeleccionada.id, !reservaSeleccionada.pagada, token);

                        setReservas((prev) =>
                            prev.map((x) => (x.id === reservaSeleccionada.id ? { ...x, pagada: !x.pagada } : x))
                        );

                        setConfirmOpen(false);
                        setReservaSeleccionada(null);
                    } catch (e) {
                        console.error(e);
                        alert('No se pudo actualizar el estado de pago.');
                    } finally {
                        setSavingReservaId(null);
                    }
                }}
            />
        </div>
    );
}

function isExpiredReserva(r: Reserva) {
    const fin = new Date(r.fechaHoraFin).getTime();
    return Number.isFinite(fin) ? fin < Date.now() : false;
}
