'use client';

import type { AuthResponse } from '@/lib/api';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    startTransition,
} from 'react';

type Role = 'Cliente' | 'Operador' | 'Admin';

type AuthUser = {
    id: number;
    email: string;
    rol: Role;
};

type AuthContextType = {
    user: AuthUser | null;
    token: string | null;
    login: (data: AuthResponse) => void;
    logout: () => void;
    initialized: boolean;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'campolibre_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            try {
                const parsed = JSON.parse(stored) as { token: string; user: AuthUser };

                startTransition(() => {
                    setToken(parsed.token);
                    setUser(parsed.user);
                });
            } catch {
                console.warn('No se pudo parsear el auth guardado. Limpiando storage.');
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        startTransition(() => {
            setInitialized(true);
        });
    }, []);

    const handleLogin = (data: AuthResponse) => {
        const authUser: AuthUser = {
            id: data.usuarioId,
            email: data.email,
            rol: data.rol,
        };

        setToken(data.token);
        setUser(authUser);

        if (typeof window !== 'undefined') {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ token: data.token, user: authUser })
            );
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);

        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const isAdmin = user?.rol === 'Admin' || user?.rol === 'Operador';

    return (
        <AuthContext.Provider
            value={{ token, user, login: handleLogin, logout, initialized, isAdmin }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
}
