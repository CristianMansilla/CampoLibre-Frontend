'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

import {
    fetchCanchas,
    createCancha,
    updateCancha,
    deleteCancha,
    type Cancha,
    type CanchaCreate,
} from '@/lib/api';



import ConfirmDialog from '@/componentes/ui/confirm-dialog';
import { Badge } from '@/componentes/ui/badge';
import { Button } from '@/componentes/ui/button';
import { Alert } from '@/componentes/ui/alert';
import { Label } from '@/componentes/ui/label';
import { Input } from '@/componentes/ui/input';
import { Toggle } from '@/componentes/ui/toggle';

const currencyAR = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

const CANCHA_TIPOS = [
    'Fútbol 5',
    'Fútbol 7',
    'Fútbol 11',
    'Pádel',
    'Tenis',
    'Básquet',
    'Vóley',
] as const;




export default function AdminCanchasPage() {
    const { user, token, initialized } = useAuth();
    const { toggleResponsive } = useSidebar();
    const esAdmin = user?.rol === 'Admin' || user?.rol === 'Operador';
    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [q, setQ] = useState('');
    const [editing, setEditing] = useState<Cancha | null>(null);
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('');
    const [techada, setTechada] = useState(false);
    const [iluminacion, setIluminacion] = useState(false);
    const [precioHora, setPrecioHora] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState<Cancha | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        async function cargar() {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchCanchas();
                setCanchas(data);
            } catch (e) {
                console.error(e);
                setError('No se pudieron cargar las canchas.');
            } finally {
                setLoading(false);
            }
        }
        cargar();
    }, []);

    const filtradas = useMemo(() => {
        const qq = q.trim().toLowerCase();
        const arr = !qq
            ? canchas
            : canchas.filter((c) =>
                `${c.id} ${c.nombre} ${c.tipo}`.toLowerCase().includes(qq)
            );
        return [...arr].sort((a, b) => {
            const byName = a.nombre.localeCompare(b.nombre, 'es');
            if (byName !== 0) return byName;
            return a.id - b.id;
        });
    }, [canchas, q]);

    function resetForm() {
        setEditing(null);
        setNombre('');
        setTipo('');
        setTechada(false);
        setIluminacion(false);
        setPrecioHora('');
        setFormError(null);
    }

    function startEdit(c: Cancha) {
        setEditing(c);
        setNombre(c.nombre ?? '');
        setTipo(c.tipo ?? '');
        setTechada(!!c.techada);
        setIluminacion(!!c.iluminacion);
        setPrecioHora(String(c.precioHora ?? ''));
        setFormError(null);
        window?.scrollTo?.({ top: 0, behavior: 'smooth' });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        if (!token) return setFormError('Necesitás iniciar sesión.');
        if (!esAdmin) return setFormError('No tenés permisos.');

        const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');

        const nombreNorm = normalize(nombre);
        const tipoNorm = normalize(tipo);

        if (!nombreNorm) {
            return setFormError('El nombre de la cancha es obligatorio.');
        }


        if (!tipoNorm) {
            return setFormError('El tipo de cancha es obligatorio.');
        }

        const precio = Number(precioHora);

        if (!Number.isFinite(precio) || precio <= 0) {
            return setFormError('Ingresá un precio por hora válido.');
        }


        try {
            setSaving(true);

            const payload: CanchaCreate = {
                nombre: nombreNorm,
                tipo: tipoNorm,
                techada,
                iluminacion,
                precioHora: precio,
            };

            if (editing) {
                await updateCancha(editing.id, payload, token);
                setCanchas((prev) =>
                    prev.map((x) => (x.id === editing.id ? { ...x, ...payload } : x))
                );
                resetForm();
            } else {
                const nueva = await createCancha(payload, token);
                setCanchas((prev) => [...prev, nueva]);
                resetForm();
            }
        } catch (e) {
            console.error(e);
            setFormError(editing ? 'No se pudo actualizar la cancha.' : 'No se pudo crear la cancha.');
        } finally {
            setSaving(false);
        }

    }

    if (!initialized) return <p className="p-6 text-white/70">Cargando...</p>;

    if (!user || !token || !esAdmin) {
        return (
            <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <nav className="text-sm text-white/60 flex flex-wrap items-center gap-2">
                            <span className="text-white/30">Home</span>
                            <span className="text-white/30">/</span>
                            <span className="text-white/80">Admin</span>
                            <span className="text-white/30">/</span>
                            <span className="text-white/80">Canchas</span>
                        </nav>

                        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">
                            Canchas (Admin)
                        </h1>

                        <p className="text-white/65 mt-2 max-w-2xl">
                            Acceso restringido. Solo Admin u Operador.
                        </p>
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

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-white font-medium">Sin permisos</p>
                    <p className="text-white/65 text-sm mt-1">
                        Iniciá sesión con un usuario Admin u Operador.
                    </p>
                    <div className="mt-4 flex gap-2 flex-wrap">
                        <Link href="/dashboard">
                            <Button variant="secondary">Volver al dashboard</Button>
                        </Link>
                        <Link href="/canchas">
                            <Button variant="secondary">Ver canchas (público)</Button>
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
                        <span className="text-white/80">Canchas</span>
                    </nav>

                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">
                        Gestión de canchas
                    </h1>

                    <p className="text-white/65 mt-2 max-w-2xl">
                        Alta, edición y eliminación de canchas.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="neutral">Rol: {user?.rol}</Badge>
                        <Badge variant="info" className="truncate max-w-[320px]">
                            {user?.email ?? '-'}
                        </Badge>
                        <Badge variant="neutral">
                            {canchas.length} cancha{canchas.length === 1 ? '' : 's'}
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
                <Link href="/canchas" className="text-sm text-emerald-300 hover:text-emerald-200">
                    ← Ver listado público
                </Link>

                <div className="flex items-center gap-2">
                    {editing && (
                        <span className="text-xs px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/15 text-cyan-200">
                            Editando #{editing.id}
                        </span>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-4">
                    <Alert variant="danger">{error}</Alert>
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
                <section className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-white">
                            {editing ? 'Editar cancha' : 'Crear cancha'}
                        </h2>

                        {editing ? (
                            <Button variant="secondary" size="sm" onClick={resetForm} disabled={saving}>
                                Cancelar edición
                            </Button>
                        ) : (
                            <span className="text-xs text-white/50">Admin/Operador</span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Nombre</Label>
                                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                            </div>

                            <div>
                                <Label>Tipo</Label>

                                <select
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                    required
                                    className={[
                                        'w-full h-11 rounded-xl border border-white/10 bg-white/5 px-3',
                                        'text-white/90 outline-none transition',
                                        'focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20',
                                        'hover:bg-white/10',
                                    ].join(' ')}
                                >
                                    <option value="" className="bg-[#0b1220] text-white/70">
                                        Seleccionar tipo…
                                    </option>

                                    {CANCHA_TIPOS.map((t) => (
                                        <option key={t} value={t} className="bg-[#0b1220] text-white">
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Precio por hora (ARS)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={precioHora}
                                    onChange={(e) => setPrecioHora(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <Toggle label="Techada" value={techada} onChange={setTechada} />
                                <Toggle label="Iluminación" value={iluminacion} onChange={setIluminacion} />
                            </div>
                        </div>

                        {formError && <Alert variant="danger">{formError}</Alert>}

                        <Button type="submit" size="lg" className="w-full" disabled={saving}>
                            {saving ? (editing ? 'Guardando...' : 'Creando...') : (editing ? 'Guardar cambios' : 'Crear cancha')}
                        </Button>

                        {editing && (
                            <p className="text-xs text-white/50">
                                Tip: al guardar, se actualiza la lista sin recargar la página.
                            </p>
                        )}
                    </form>
                </section>

                <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-white">Listado</h3>
                        <span className="text-xs text-white/50">{loading ? '...' : filtradas.length}</span>
                    </div>

                    <div className="mt-4">
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar..."
                        />
                    </div>

                    <div className="mt-4 space-y-3">
                        {loading ? (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-white/70">Cargando…</p>
                            </div>
                        ) : filtradas.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-white/70">Sin resultados.</p>
                            </div>
                        ) : (
                            filtradas.map((c) => {
                                const isEditing = editing?.id === c.id;

                                return (
                                    <div
                                        key={c.id}
                                        className={[
                                            'rounded-2xl border border-white/10 bg-white/[0.03] p-4',
                                            isEditing ? 'ring-1 ring-cyan-500/40' : '',
                                        ].join(' ')}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-white font-medium truncate">
                                                    {c.nombre}{' '}
                                                    <span className="text-white/40 font-normal">#{c.id}</span>
                                                </p>
                                                <p className="text-white/60 text-xs mt-1 truncate">
                                                    {c.tipo} · {currencyAR.format(c.precioHora)}/h
                                                </p>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Badge variant={c.techada ? 'success' : 'neutral'} className="text-xs">
                                                        {c.techada ? 'Techada' : 'No techada'}
                                                    </Badge>
                                                    <Badge variant={c.iluminacion ? 'info' : 'neutral'} className="text-xs">
                                                        {c.iluminacion ? 'Luz' : 'Sin luz'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            <Button
                                                size="sm"
                                                className="w-full"
                                                variant={isEditing ? 'secondary' : 'primary'}
                                                onClick={() => startEdit(c)}
                                                disabled={saving}
                                            >
                                                {isEditing ? 'Editando' : 'Editar'}
                                            </Button>

                                            <Button
                                                size="sm"
                                                className="w-full"
                                                variant="danger"
                                                disabled={saving || deletingId === c.id}
                                                onClick={() => {
                                                    setToDelete(c);
                                                    setConfirmOpen(true);
                                                }}
                                            >
                                                {deletingId === c.id ? 'Eliminando…' : 'Eliminar'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title="Eliminar cancha"
                danger={true}
                description={
                    toDelete
                        ? `Vas a eliminar “${toDelete.nombre}”. Esta acción no se puede deshacer.`
                        : 'Confirmá la eliminación.'
                }
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                loading={deletingId !== null}
                onCancel={() => {
                    setConfirmOpen(false);
                    setToDelete(null);
                }}
                onConfirm={async () => {
                    if (!token || !toDelete) return;

                    try {
                        setDeletingId(toDelete.id);

                        await deleteCancha(toDelete.id, token);

                        setCanchas((prev) => prev.filter((x) => x.id !== toDelete.id));

                        if (editing?.id === toDelete.id) resetForm();

                        setConfirmOpen(false);
                        setToDelete(null);
                    } catch (e) {
                        console.error(e);
                        alert('No se pudo eliminar la cancha.');
                    } finally {
                        setDeletingId(null);
                    }
                }}
            />
        </div>
    );
}
