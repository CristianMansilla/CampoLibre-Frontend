'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginRequest, registerRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/componentes/ui/card';
import { Button } from '@/componentes/ui/button';

type Tab = 'login' | 'register';

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return 'Ocurrió un error inesperado.';
}

export default function AuthCard() {
    const router = useRouter();
    const { login } = useAuth();
    const [tab, setTab] = useState<Tab>('login');

    // login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // register
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [emailReg, setEmailReg] = useState('');
    const [passwordReg, setPasswordReg] = useState('');
    const [passwordReg2, setPasswordReg2] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const title = useMemo(
        () => (tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'),
        [tab]
    );

    const subtitle = useMemo(
        () =>
            tab === 'login'
                ? 'Accedé a tu panel y gestioná tus reservas.'
                : 'Registrate en segundos y empezá a reservar.',
        [tab]
    );

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (tab === 'login') {
                const data = await loginRequest({ email, password });
                login(data);
                router.push('/dashboard');
                return;
            }

            if (passwordReg !== passwordReg2) {
                setError('Las contraseñas no coinciden.');
                setLoading(false);
                return;
            }

            const data = await registerRequest({
                nombreCompleto,
                email: emailReg,
                password: passwordReg,
                rol: 'Cliente',
            });

            login(data);
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="relative w-12 h-12">
                    <Image
                        src="/campolibre-logo.png"
                        alt="CampoLibre"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <div>
                    <p className="text-sm text-white/80 font-semibold">CampoLibre</p>
                    <p className="text-xs text-white/55">Reservas deportivas</p>
                </div>
            </div>

            <div className="grid grid-cols-2 rounded-2xl p-1 mb-6 border border-white/10 bg-white/5">
                <button
                    type="button"
                    onClick={() => setTab('login')}
                    className={[
                        'rounded-xl py-2 text-sm font-semibold transition',
                        tab === 'login'
                            ? 'bg-white/10 text-white border border-white/10'
                            : 'text-white/70 hover:text-white hover:bg-white/5',
                    ].join(' ')}
                >
                    Iniciar sesión
                </button>

                <button
                    type="button"
                    onClick={() => setTab('register')}
                    className={[
                        'rounded-xl py-2 text-sm font-semibold transition',
                        tab === 'register'
                            ? 'bg-white/10 text-white border border-white/10'
                            : 'text-white/70 hover:text-white hover:bg-white/5',
                    ].join(' ')}
                >
                    Registrarse
                </button>
            </div>

            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            <p className="text-sm text-white/65 mt-1 mb-6">{subtitle}</p>

            {error && (
                <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {tab === 'register' && (
                    <div>
                        <label className="block text-xs font-medium text-white/80 mb-1">
                            Nombre completo
                        </label>
                        <input
                            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={nombreCompleto}
                            onChange={(e) => setNombreCompleto(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-emerald-500"
                        value={tab === 'login' ? email : emailReg}
                        onChange={(e) =>
                            tab === 'login' ? setEmail(e.target.value) : setEmailReg(e.target.value)
                        }
                        required
                        autoComplete="email"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-emerald-500"
                        value={tab === 'login' ? password : passwordReg}
                        onChange={(e) =>
                            tab === 'login'
                                ? setPassword(e.target.value)
                                : setPasswordReg(e.target.value)
                        }
                        required
                        autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    />
                </div>

                {tab === 'register' && (
                    <div>
                        <label className="block text-xs font-medium text-white/80 mb-1">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={passwordReg2}
                            onChange={(e) => setPasswordReg2(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Procesando...' : tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
                </Button>

                <p className="text-xs text-white/50 text-center">
                    Al continuar, aceptás un uso responsable del sistema de reservas.
                </p>
            </form>
        </Card>
    );
}
