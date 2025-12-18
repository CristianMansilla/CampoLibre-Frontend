'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthCard from '@/componentes/auth/auth-card';

export default function HomePage() {
  const router = useRouter();
  const { user, initialized } = useAuth();

  if (!initialized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-white/70">Cargando...</p>
      </main>
    );
  }
  if (user) {
    return (
      <main className="min-h-screen bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10">
            <div className="flex items-center gap-4">
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
                <p className="text-white font-semibold leading-tight">CampoLibre</p>
                <p className="text-white/70 text-sm">Reservas deportivas</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
              <p className="text-white/80">
                Hola, <span className="font-semibold">{user.email}</span> ({user.rol})
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3"
              >
                Ir al dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-35"
        style={{ backgroundImage: "url('/hero.png')" }}
      />
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl -z-10" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto px-6 py-8 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          <div className="flex">
            <div className="w-full max-w-lg">
              <AuthCard />
            </div>
          </div>

          <div className="flex">
            <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-7 sm:p-8 flex flex-col">
              <p className="text-white/70 text-sm">CampoLibre</p>

              <h2 className="text-4xl font-bold text-white mt-2 leading-tight">
                Reservá tu cancha <span className="text-white/80">en minutos.</span>
              </h2>

              <p className="text-white/70 mt-4 max-w-xl">
                Elegí cancha, definí horario y confirmá. Panel claro para clientes y gestión simple para operadores.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-6">
                {['Canchas', 'Reservas', 'Admin'].map((t) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-white font-semibold">{t}</p>
                    <p className="text-white/70 text-sm mt-1">Gestión simple</p>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-5 text-xs text-white/55">
                Ideal para complejos deportivos y clubes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
