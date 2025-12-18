// Configuración

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    console.warn('⚠️ Falta NEXT_PUBLIC_API_BASE_URL en .env.local');
}

function ensureBaseUrl(): string {
    if (!API_BASE_URL) {
        throw new Error('Falta configurar NEXT_PUBLIC_API_BASE_URL en .env.local');
    }
    return API_BASE_URL;
}

// Tipos
export interface Cancha {
    id: number;
    nombre: string;
    tipo: string;
    techada: boolean;
    iluminacion: boolean;
    precioHora: number;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    nombreCompleto: string;
    email: string;
    password: string;
    rol?: string;
}


export type AuthResponse = {
    token: string;
    usuarioId: number;
    email: string;
    rol: 'Cliente' | 'Operador' | 'Admin';
};


// Función genérica de fetch con manejo de errores
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        cache: 'no-store',
        ...options,
    });

    if (!res.ok) {
        let msg = `Error HTTP ${res.status}`;
        try {
            const text = await res.text();
            if (text) msg = text;
        } catch { }
        throw new Error(msg);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    const text = await res.text();
    if (!text) {
        return undefined as T;
    }

    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error('Respuesta inválida del servidor (JSON malformado).');
    }
}

// Canchas
export async function fetchCanchas(): Promise<Cancha[]> {
    const base = ensureBaseUrl();
    return apiFetch<Cancha[]>(`${base}/api/Canchas`);
}

export async function updateCancha(
    id: number,
    payload: CanchaCreate,
    token: string
): Promise<void> {
    if (!API_BASE_URL) throw new Error('Falta configurar NEXT_PUBLIC_API_BASE_URL');

    const res = await fetch(`${API_BASE_URL}/api/Canchas/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Error al actualizar la cancha');
    }
}

export async function deleteCancha(id: number, token: string): Promise<void> {
    if (!API_BASE_URL) throw new Error('Falta configurar NEXT_PUBLIC_API_BASE_URL');

    const res = await fetch(`${API_BASE_URL}/api/Canchas/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Error al eliminar la cancha');
    }
}


// Autenticación
export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
    const base = ensureBaseUrl();

    return apiFetch<AuthResponse>(`${base}/api/Auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

export async function registerRequest(
    payload: RegisterPayload
): Promise<AuthResponse> {
    const base = ensureBaseUrl();

    return apiFetch<AuthResponse>(`${base}/api/Auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}


// Fetch con token
export async function apiFetchWithToken<T>(
    url: string,
    token: string,
    options?: RequestInit
): Promise<T> {
    const base = ensureBaseUrl();

    return apiFetch<T>(`${base}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options?.headers ?? {}),
        },
    });
}


export interface CanchaCreate {
    nombre: string;
    tipo: string;
    techada: boolean;
    iluminacion: boolean;
    precioHora: number;
}

export async function createCancha(
    payload: CanchaCreate,
    token: string
): Promise<Cancha> {
    if (!API_BASE_URL) {
        throw new Error('Falta configurar NEXT_PUBLIC_API_BASE_URL');
    }

    const res = await fetch(`${API_BASE_URL}/api/Canchas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al crear la cancha');
    }

    return res.json();
}

// Reservas
export interface Reserva {
    id: number;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    pagada: boolean;
    usuarioId: number;
    canchaId: number;
    usuarioNombre?: string;
    canchaNombre?: string;
}

export interface ReservaCreate {
    fechaHoraInicio: string;
    fechaHoraFin: string;
    pagada: boolean;
    canchaId: number;
}

export async function fetchMisReservas(token: string): Promise<Reserva[]> {
    if (!API_BASE_URL) throw new Error('Falta API URL');

    const res = await fetch(`${API_BASE_URL}/api/Reservas/mias`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Error obteniendo mis reservas');
    }

    return res.json();
}

export async function crearReserva(
    payload: ReservaCreate,
    token: string
): Promise<Reserva> {
    if (!API_BASE_URL) throw new Error('Falta API URL');

    const res = await fetch(`${API_BASE_URL}/api/Reservas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Error creando reserva');
    }

    return res.json();
}

export async function eliminarReserva(id: number, token: string) {
    if (!API_BASE_URL) throw new Error('Falta API URL');

    const res = await fetch(`${API_BASE_URL}/api/Reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Error eliminando reserva');
    }
}

export async function fetchReservasAdmin(token: string): Promise<Reserva[]> {
    if (!API_BASE_URL) {
        throw new Error('Falta configurar NEXT_PUBLIC_API_BASE_URL');
    }

    const res = await fetch(`${API_BASE_URL}/api/Reservas`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Error al obtener reservas (admin)');
    }

    return res.json();
}


export async function fetchHorasOcupadas(
    canchaId: number,
    fecha: string,
    token: string
): Promise<number[]> {
    const base = ensureBaseUrl();

    const res = await fetch(
        `${base}/api/Reservas/ocupadas?canchaId=${canchaId}&fecha=${encodeURIComponent(fecha)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        }
    );

    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Error obteniendo horas ocupadas');
    }

    return res.json();
}

export async function setReservaPagada(
    id: number,
    pagada: boolean,
    token: string
): Promise<void> {
    if (!API_BASE_URL) throw new Error('Falta configurar NEXT_PUBLIC_API_BASE_URL');

    const res = await fetch(`${API_BASE_URL}/api/Reservas/${id}/pagada`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pagada),
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Error al actualizar estado de pago');
    }
}


// Usuarios (admin)
export type RolUsuario = 'Cliente' | 'Operador' | 'Admin';

export interface UsuarioAdmin {
    id: number;
    nombreCompleto: string;
    email: string;
    rol: RolUsuario;
    activo: boolean;
    creadoEl?: string;
}
export interface UsuarioCreateAdmin {
    nombreCompleto: string;
    email: string;
    password: string;
    rol: RolUsuario;
    activo?: boolean;
}
export interface UsuarioUpdateAdmin {
    nombreCompleto: string;
    email: string;
    rol: RolUsuario;
    activo: boolean;
}

export async function fetchUsuariosAdmin(token: string): Promise<UsuarioAdmin[]> {
    return apiFetchWithToken<UsuarioAdmin[]>('/api/Usuarios', token, {
        method: 'GET',
    });
}

export async function createUsuarioAdmin(
    payload: UsuarioCreateAdmin,
    token: string
): Promise<UsuarioAdmin> {
    return apiFetchWithToken<UsuarioAdmin>('/api/Usuarios', token, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateUsuarioAdmin(
    id: number,
    payload: UsuarioUpdateAdmin,
    token: string
): Promise<void> {
    await apiFetchWithToken<void>(`/api/Usuarios/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function setUsuarioActivo(
    id: number,
    activo: boolean,
    token: string
): Promise<void> {
    await apiFetchWithToken<void>(`/api/Usuarios/${id}/activo`, token, {
        method: 'PATCH',
        body: JSON.stringify(activo),
    });
}

export async function deleteUsuarioAdmin(id: number, token: string): Promise<void> {
    await apiFetchWithToken<void>(`/api/Usuarios/${id}`, token, {
        method: 'DELETE',
    });
}
