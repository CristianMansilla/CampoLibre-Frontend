'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import ConfirmDialog from '@/componentes/ui/confirm-dialog';
import { Badge } from '@/componentes/ui/badge';
import { Button } from '@/componentes/ui/button';
import { Alert } from '@/componentes/ui/alert';
import { Label } from '@/componentes/ui/label';
import { Input } from '@/componentes/ui/input';
import { Toggle } from '@/componentes/ui/toggle';

import {
    fetchUsuariosAdmin,
    createUsuarioAdmin,
    updateUsuarioAdmin,
    setUsuarioActivo,
    type UsuarioAdmin,
    type UsuarioCreateAdmin,
    type UsuarioUpdateAdmin,
    type RolUsuario,
} from '@/lib/api';

const ROLES: RolUsuario[] = ['Cliente', 'Operador', 'Admin'];

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ');
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function AdminUsuariosPage() {
    const { user, token, initialized } = useAuth();
    const { toggleResponsive } = useSidebar();
    const esAdmin = user?.rol === 'Admin' || user?.rol === 'Operador';
    const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [q, setQ] = useState('');
    const [editing, setEditing] = useState<UsuarioAdmin | null>(null);
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [rol, setRol] = useState<RolUsuario>('Cliente');
    const [activo, setActivo] = useState(true);
    const [password, setPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMode, setConfirmMode] = useState<'baja' | 'activar'>('baja');
    const [target, setTarget] = useState<UsuarioAdmin | null>(null);
    const [actingId, setActingId] = useState<number | null>(null);

    useEffect(() => {
        async function cargar() {
            if (!initialized) return;

            if (!token || !user) {
                setError('Necesitás iniciar sesión.');
                setLoading(false);
                return;
            }

            if (!esAdmin) {
                setError('No tenés permisos para ver esta sección.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await fetchUsuariosAdmin(token);
                setUsuarios(data);
            } catch (e) {
                console.error(e);
                setError('No se pudieron cargar los usuarios.');
            } finally {
                setLoading(false);
            }
        }

        cargar();
    }, [initialized, token, user, esAdmin]);

    const filtrados = useMemo(() => {
        const qq = q.trim().toLowerCase();

        const arr = !qq
            ? usuarios
            : usuarios.filter((u) =>
                `${u.id} ${u.nombreCompleto} ${u.email} ${u.rol}`.toLowerCase().includes(qq)
            );
        const rolRank = (r: RolUsuario) => (r === 'Admin' ? 0 : r === 'Operador' ? 1 : 2);

        return [...arr].sort((a, b) => {
            if (a.activo !== b.activo) return a.activo ? -1 : 1;
            const byRol = rolRank(a.rol) - rolRank(b.rol);
            if (byRol !== 0) return byRol;
            const byName = a.nombreCompleto.localeCompare(b.nombreCompleto, 'es');
            if (byName !== 0) return byName;
            return a.id - b.id;
        });
    }, [usuarios, q]);

    function resetForm() {
        setEditing(null);
        setNombreCompleto('');
        setEmail('');
        setRol('Cliente');
        setActivo(true);
        setPassword('');
        setFormError(null);
    }

    function startEdit(u: UsuarioAdmin) {
        setEditing(u);
        setNombreCompleto(u.nombreCompleto ?? '');
        setEmail(u.email ?? '');
        setRol(u.rol);
        setActivo(u.activo);
        setPassword('');
        setFormError(null);
        window?.scrollTo?.({ top: 0, behavior: 'smooth' });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        if (!token) return setFormError('Necesitás iniciar sesión.');
        if (!esAdmin) return setFormError('No tenés permisos.');

        const nombreNorm = normalize(nombreCompleto);
        const emailNorm = normalize(email).toLowerCase();

        if (!nombreNorm) return setFormError('El nombre completo es obligatorio.');
        if (!emailNorm) return setFormError('El email es obligatorio.');
        if (!isValidEmail(emailNorm)) return setFormError('Ingresá un email válido.');

        if (!editing) {
            const pass = password.trim();
            if (pass.length < 6) return setFormError('La contraseña debe tener al menos 6 caracteres.');
        }

        try {
            setSaving(true);

            if (editing) {
                const payload: UsuarioUpdateAdmin = {
                    nombreCompleto: nombreNorm,
                    email: emailNorm,
                    rol,
                    activo,
                };

                await updateUsuarioAdmin(editing.id, payload, token);

                setUsuarios((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...payload } : x)));

                resetForm();
            } else {
                const payload: UsuarioCreateAdmin = {
                    nombreCompleto: nombreNorm,
                    email: emailNorm,
                    password: password.trim(),
                    rol,
                    activo,
                };

                const nuevo = await createUsuarioAdmin(payload, token);
                setUsuarios((prev) => [...prev, nuevo]);
                resetForm();
            }
        } catch (err) {
            console.error(err);
            setFormError(editing ? 'No se pudo actualizar el usuario.' : 'No se pudo crear el usuario.');
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
                            <span className="text-white/80">Usuarios</span>
                        </nav>

                        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">Usuarios (Admin)</h1>
                        <p className="text-white/65 mt-2 max-w-2xl">Acceso restringido. Solo Admin u Operador.</p>
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
                        <span className="text-white/80">Usuarios</span>
                    </nav>

                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">Gestión de usuarios</h1>

                    <p className="text-white/65 mt-2 max-w-2xl">Alta, edición y baja lógica de usuarios.</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="neutral">Rol: {user?.rol}</Badge>
                        <Badge variant="info" className="truncate max-w-[320px]">
                            {user?.email ?? '-'}
                        </Badge>
                        <Badge variant="neutral">
                            {usuarios.length} usuario{usuarios.length === 1 ? '' : 's'}
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
                <Link href="/dashboard" className="text-sm text-emerald-300 hover:text-emerald-200">
                    ← Volver al dashboard
                </Link>

                {editing && (
                    <span className="text-xs px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/15 text-cyan-200">
                        Editando #{editing.id}
                    </span>
                )}
            </div>

            {error && (
                <div className="mt-4">
                    <Alert variant="danger">{error}</Alert>
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
                <section className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-white">{editing ? 'Editar usuario' : 'Crear usuario'}</h2>

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
                                <Label>Nombre completo</Label>
                                <Input value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
                            </div>

                            <div>
                                <Label>Email</Label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>

                            <div>
                                <Label>Rol</Label>
                                <select
                                    value={rol}
                                    onChange={(e) => setRol(e.target.value as RolUsuario)}
                                    className={[
                                        'w-full h-11 rounded-xl border border-white/10 bg-white/5 px-3',
                                        'text-white/90 outline-none transition',
                                        'focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20',
                                        'hover:bg-white/10',
                                    ].join(' ')}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r} className="bg-[#0b1220] text-white">
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-1">
                                <Toggle label="Activo" value={activo} onChange={setActivo} />
                            </div>

                            {!editing && (
                                <div className="sm:col-span-2">
                                    <Label>Contraseña</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <p className="mt-1 text-xs text-white/45">Se recomienda mínimo 6 caracteres.</p>
                                </div>
                            )}
                        </div>

                        {formError && <Alert variant="danger">{formError}</Alert>}

                        <Button type="submit" size="lg" className="w-full" disabled={saving}>
                            {saving ? (editing ? 'Guardando...' : 'Creando...') : editing ? 'Guardar cambios' : 'Crear usuario'}
                        </Button>
                    </form>
                </section>

                <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-white">Listado</h3>
                        <span className="text-xs text-white/50">{loading ? '...' : filtrados.length}</span>
                    </div>

                    <div className="mt-4">
                        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." />
                    </div>

                    <div className="mt-4 space-y-3">
                        {loading ? (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-white/70">Cargando…</p>
                            </div>
                        ) : filtrados.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-white/70">Sin resultados.</p>
                            </div>
                        ) : (
                            filtrados.map((u) => {
                                const isEditing = editing?.id === u.id;

                                return (
                                    <div
                                        key={u.id}
                                        className={[
                                            'rounded-2xl border border-white/10 bg-white/[0.03] p-4',
                                            isEditing ? 'ring-1 ring-cyan-500/40' : '',
                                            !u.activo ? 'opacity-60' : '',
                                        ].join(' ')}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-white font-medium truncate">
                                                {u.nombreCompleto}{' '}
                                                <span className="text-white/40 font-normal">#{u.id}</span>
                                            </p>

                                            <p className="text-white/60 text-xs mt-1 truncate">{u.email}</p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <Badge variant={u.rol === 'Admin' ? 'info' : u.rol === 'Operador' ? 'neutral' : 'neutral'}>
                                                    {u.rol}
                                                </Badge>

                                                {u.activo ? (
                                                    <Badge variant="success">Activo</Badge>
                                                ) : (
                                                    <Badge variant="warning">Inactivo</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <Button
                                                size="sm"
                                                className="w-full"
                                                variant={isEditing ? 'secondary' : 'primary'}
                                                onClick={() => startEdit(u)}
                                                disabled={saving || actingId === u.id}
                                            >
                                                {isEditing ? 'Editando' : 'Editar'}
                                            </Button>

                                            <Button
                                                size="sm"
                                                className="w-full"
                                                variant={u.activo ? 'danger' : 'secondary'}
                                                disabled={saving || actingId === u.id}
                                                onClick={() => {
                                                    setTarget(u);
                                                    setConfirmMode(u.activo ? 'baja' : 'activar');
                                                    setConfirmOpen(true);
                                                }}
                                            >
                                                {u.activo ? 'Dar de baja' : 'Activar'}
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
                title={confirmMode === 'baja' ? 'Dar de baja usuario' : 'Activar usuario'}
                danger={confirmMode === 'baja'}
                description={
                    target
                        ? confirmMode === 'baja'
                            ? `Vas a dar de baja a “${target.nombreCompleto}”. El usuario no podrá operar hasta reactivarlo.`
                            : `Vas a reactivar a “${target.nombreCompleto}”.`
                        : 'Confirmá la acción.'
                }
                confirmText={confirmMode === 'baja' ? 'Sí, dar de baja' : 'Sí, activar'}
                cancelText="Cancelar"
                loading={actingId !== null}
                onCancel={() => {
                    setConfirmOpen(false);
                    setTarget(null);
                }}
                onConfirm={async () => {
                    if (!token || !target) return;

                    try {
                        setActingId(target.id);

                        const nuevoActivo = confirmMode === 'activar';
                        await setUsuarioActivo(target.id, nuevoActivo, token);

                        setUsuarios((prev) =>
                            prev.map((x) => (x.id === target.id ? { ...x, activo: nuevoActivo } : x))
                        );

                        if (editing?.id === target.id) setActivo(nuevoActivo);

                        setConfirmOpen(false);
                        setTarget(null);
                    } catch (e) {
                        console.error(e);
                        alert('No se pudo actualizar el estado del usuario.');
                    } finally {
                        setActingId(null);
                    }
                }}
            />
        </div>
    );
}
