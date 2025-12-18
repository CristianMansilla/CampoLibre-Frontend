'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Listbox } from '@headlessui/react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import {
    fetchCanchas,
    fetchHorasOcupadas,
    crearReserva,
    type Cancha,
    type ReservaCreate,
} from '@/lib/api';

import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Label } from '@/componentes/ui/label';
import { Badge } from '@/componentes/ui/badge';
import { Alert } from '@/componentes/ui/alert';
import { Toggle } from '@/componentes/ui/toggle';
import { Pill, PillGroup } from '@/componentes/ui/pill';

const hoursAllowed = Array.from({ length: 10 }, (_, i) => 14 + i); // 14..23
const currencyAR = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function buildLocalDateTime(fecha: string, hour: number) {
    return `${fecha}T${pad2(hour)}:00:00`;
}

export default function NuevaReservaPage() {
    const router = useRouter();
    const { user, token, initialized } = useAuth();
    const { toggleResponsive } = useSidebar();

    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [loadingCanchas, setLoadingCanchas] = useState(true);
    const [errorCanchas, setErrorCanchas] = useState<string | null>(null);

    const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null);

    const [fecha, setFecha] = useState<string>('');
    const [horaInicio, setHoraInicio] = useState<number | null>(null); // 14..23
    const [duracion, setDuracion] = useState<1 | 2>(1);

    const [pagada, setPagada] = useState(false);

    const [horasOcupadas, setHorasOcupadas] = useState<number[]>([]);
    const [loadingOcupadas, setLoadingOcupadas] = useState(false);

    const [saving, setSaving] = useState(false);
    const [errorSave, setErrorSave] = useState<string | null>(null);

    const selectedCanchaId = selectedCancha?.id ?? null;

    useEffect(() => {
        async function cargar() {
            try {
                setLoadingCanchas(true);
                setErrorCanchas(null);
                const data = await fetchCanchas();
                setCanchas(data);
                setSelectedCancha(data[0] ?? null);
            } catch (err) {
                console.error(err);
                setErrorCanchas('No se pudieron cargar las canchas.');
            } finally {
                setLoadingCanchas(false);
            }
        }
        cargar();
    }, []);



    useEffect(() => {
        async function cargarOcupadas() {
            if (!token || !selectedCanchaId || !fecha) return;

            try {
                setLoadingOcupadas(true);
                const ocupadas = await fetchHorasOcupadas(selectedCanchaId, fecha, token);
                setHorasOcupadas(ocupadas);
            } catch (e) {
                console.error(e);
                setHorasOcupadas([]);
            } finally {
                setLoadingOcupadas(false);
            }
        }

        cargarOcupadas();
    }, [token, selectedCanchaId, fecha]);


    // Regla: si elige 23:00, duración solo puede ser 1h
    useEffect(() => {
        if (horaInicio === 23 && duracion === 2) setDuracion(1);
    }, [horaInicio, duracion]);

    const horaFin = useMemo(() => {
        if (horaInicio == null) return null;
        return horaInicio + duracion; // 24 representa 00:00
    }, [horaInicio, duracion]);

    const precioHora = selectedCancha?.precioHora ?? 0;
    const totalEstimado = useMemo(() => precioHora * duracion, [precioHora, duracion]);

    const startDisabledReason = useMemo(() => {
        if (!fecha) return 'Elegí el día';
        if (!selectedCancha) return 'Elegí la cancha';
        return null;
    }, [fecha, selectedCancha]);

    const isHourOccupied = (h: number) => horasOcupadas.includes(h);

    // Para 2h: deben estar libres h y h+1 y h != 23
    const canPickHour = (h: number) => {
        if (loadingOcupadas) return false;
        if (isHourOccupied(h)) return false;

        if (duracion === 2) {
            if (h === 23) return false;
            if (isHourOccupied(h + 1)) return false;
        }
        return true;
    };

    const setHoraSafe = (h: number) => {
        if (!canPickHour(h)) return;
        setHoraInicio(h);
    };

    useEffect(() => {
        if (horaInicio == null) return;
        if (!canPickHour(horaInicio)) setHoraInicio(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duracion, horasOcupadas, loadingOcupadas]);

    if (!initialized) return <p className="p-6 text-white/70">Cargando...</p>;

    if (!user || !token) {
        return (
            <div className="p-6 sm:p-8">
                <Alert variant="danger">
                    <p className="font-semibold">Necesitás iniciar sesión</p>
                    <p className="text-sm mt-1">Para crear una reserva primero iniciá sesión.</p>

                    <div className="mt-4 flex gap-3 flex-wrap">
                        <Link href="/">
                            <Button>Ir a Home</Button>
                        </Link>
                        <Link href="/reservas">
                            <Button variant="secondary">Ver reservas</Button>
                        </Link>
                    </div>
                </Alert>
            </div>
        );
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorSave(null);

        if (!selectedCancha) return setErrorSave('Seleccioná una cancha.');
        if (!fecha) return setErrorSave('Seleccioná el día.');
        if (horaInicio == null) return setErrorSave('Seleccioná una hora de inicio.');

        if (horaInicio < 14 || horaInicio > 23) return setErrorSave('Hora fuera de horario.');
        if (duracion === 2 && horaInicio === 23) return setErrorSave('A las 23:00 solo se permite 1 hora.');
        if (!canPickHour(horaInicio)) return setErrorSave('Ese horario no está disponible.');

        const inicio = buildLocalDateTime(fecha, horaInicio);
        const finHour = horaInicio + duracion; // 24 => 00:00
        const fin = finHour === 24 ? `${fecha}T00:00:00` : buildLocalDateTime(fecha, finHour);

        const payload: ReservaCreate = {
            fechaHoraInicio: inicio,
            fechaHoraFin: fin,
            pagada,
            canchaId: selectedCancha.id,
        };

        try {
            setSaving(true);
            await crearReserva(payload, token as string);
            router.push('/reservas');
        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : 'No se pudo crear la reserva.';
            setErrorSave(msg);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <nav className="text-sm text-white/60 flex flex-wrap items-center gap-2">
                        <Link href="/reservas" className="text-white/60 hover:text-white transition">
                            Reservas
                        </Link>
                        <span className="text-white/30">/</span>
                        <span className="text-white/80">Nueva</span>
                    </nav>

                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">
                        Nueva reserva
                    </h1>

                    <p className="text-white/65 mt-2 max-w-2xl">
                        Elegí cancha, día y horario. Horario permitido:{' '}
                        <span className="text-white/80 font-semibold">14:00</span> a{' '}
                        <span className="text-white/80 font-semibold">00:00</span>.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="info" className="truncate max-w-[320px]">
                            {user.email}
                        </Badge>
                        {selectedCancha && (
                            <Badge variant="neutral">
                                {currencyAR.format(selectedCancha.precioHora)}/h
                            </Badge>
                        )}
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
                <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-white/60 text-sm">
                            Completá los datos y confirmá
                        </p>

                        <Link href="/reservas" className="text-sm text-emerald-300 hover:text-emerald-200">
                            ← Volver a mis reservas
                        </Link>
                    </div>

                    {errorCanchas && (
                        <div className="mt-4">
                            <Alert variant="danger">{errorCanchas}</Alert>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <Label>Cancha</Label>

                            <Listbox
                                value={selectedCancha}
                                onChange={(c) => {
                                    setSelectedCancha(c);
                                    setHoraInicio(null);
                                }}
                                disabled={loadingCanchas || canchas.length === 0}
                            >
                                <div className="relative mt-2">
                                    <Listbox.Button className="w-full">
                                        <div className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white outline-none focus-within:ring-2 focus-within:ring-emerald-500 flex items-center justify-between gap-3">
                                            <span className="truncate">
                                                {selectedCancha
                                                    ? `${selectedCancha.nombre} (${selectedCancha.tipo}) · ${currencyAR.format(
                                                        selectedCancha.precioHora
                                                    )}/h`
                                                    : loadingCanchas
                                                        ? 'Cargando canchas...'
                                                        : 'Seleccioná una cancha'}
                                            </span>
                                            <span className="text-white/50">▾</span>
                                        </div>
                                    </Listbox.Button>

                                    <Listbox.Options className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
                                        {canchas.map((c) => (
                                            <Listbox.Option
                                                key={c.id}
                                                value={c}
                                                className={({ active }) =>
                                                    [
                                                        'cursor-pointer px-4 py-3 text-sm',
                                                        active ? 'bg-white/10 text-white' : 'text-white/80',
                                                    ].join(' ')
                                                }
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="truncate font-medium">
                                                        {c.nombre} <span className="text-white/50">({c.tipo})</span>
                                                    </span>
                                                    <span className="text-white/70">{currencyAR.format(c.precioHora)}/h</span>
                                                </div>
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>

                            <p className="text-xs text-white/50 mt-2">
                                Seleccioná la cancha antes de elegir el horario.
                            </p>
                        </div>

                        <div>
                            <Label>Día</Label>
                            <div className="mt-2">
                                <Input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => {
                                        setFecha(e.target.value);
                                        setHoraInicio(null);
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between gap-3">
                                <Label className="mb-0">Hora de inicio</Label>
                                <span className="text-xs text-white/50">
                                    {loadingOcupadas ? 'Cargando disponibilidad…' : 'Ocupadas en gris'}
                                </span>
                            </div>

                            <PillGroup className="mt-2">
                                {hoursAllowed.map((h) => {
                                    const disabled = !!startDisabledReason || !canPickHour(h);
                                    const selected = horaInicio === h;

                                    return (
                                        <Pill
                                            key={h}
                                            type="button"
                                            selected={selected}
                                            disabled={disabled}
                                            onClick={() => setHoraSafe(h)}
                                            title={
                                                startDisabledReason
                                                    ? startDisabledReason
                                                    : isHourOccupied(h)
                                                        ? 'Ocupado'
                                                        : duracion === 2 && (h === 23 || isHourOccupied(h + 1))
                                                            ? 'No disponible para 2h'
                                                            : 'Disponible'
                                            }
                                        >
                                            {pad2(h)}:00
                                        </Pill>
                                    );
                                })}
                            </PillGroup>

                            <p className="text-xs text-white/50 mt-2">
                                Si elegís 2h, se bloquea automáticamente cuando {pad2(23)}:00.
                            </p>
                        </div>

                        <div>
                            <Label>Duración</Label>
                            <PillGroup className="mt-2">
                                {[1, 2].map((d) => {
                                    const dd = d as 1 | 2;
                                    const disabled = dd === 2 && horaInicio === 23;
                                    const selected = duracion === dd;

                                    return (
                                        <Pill
                                            key={dd}
                                            type="button"
                                            className="min-w-[72px]"
                                            selected={selected}
                                            disabled={disabled}
                                            onClick={() => setDuracion(dd)}
                                        >
                                            {dd}h
                                        </Pill>
                                    );
                                })}
                            </PillGroup>
                            <p className="text-xs text-white/50 mt-2">Mínimo 1h, máximo 2h.</p>
                        </div>

                        <div className="pt-1">
                            <Toggle label="Reserva pagada" value={pagada} onChange={setPagada} />
                            <p className="text-xs text-white/55 mt-2">Marcá si el pago ya fue registrado.</p>
                        </div>

                        {errorSave && <Alert variant="danger">{errorSave}</Alert>}

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={saving || loadingCanchas || !selectedCancha || !fecha || horaInicio == null}
                        >
                            {saving ? 'Creando reserva...' : 'Crear reserva'}
                        </Button>
                    </form>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-white">Resumen</h2>
                        <Badge variant="neutral">Vista rápida</Badge>
                    </div>

                    <div className="mt-5 space-y-3 text-sm">
                        <Row label="Cancha" value={selectedCancha ? selectedCancha.nombre : '—'} strong />
                        <Row label="Día" value={fecha || '—'} />
                        <Row label="Inicio" value={horaInicio == null ? '—' : `${pad2(horaInicio)}:00`} />
                        <Row label="Fin" value={horaFin == null ? '—' : horaFin === 24 ? '00:00' : `${pad2(horaFin)}:00`} />
                        <Row label="Duración" value={`${duracion}h`} strong />
                        <Row label="Total" value={currencyAR.format(totalEstimado)} strong />

                        <div className="flex items-center justify-between gap-3">
                            <span className="text-white/60">Pago</span>
                            <Badge variant={pagada ? 'success' : 'neutral'}>
                                {pagada ? 'Pagada' : 'Pendiente'}
                            </Badge>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-5">
                        <p className="text-white font-semibold">Reglas</p>
                        <p className="text-white/65 text-sm mt-1">
                            Horario 14:00–00:00. Mínimo 1h, máximo 2h. Si empieza 23:00, solo 1h.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({
    label,
    value,
    strong,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-white/60">{label}</span>
            <span className={strong ? 'text-white/80 font-semibold' : 'text-white/80'}>
                {value}
            </span>
        </div>
    );
}
