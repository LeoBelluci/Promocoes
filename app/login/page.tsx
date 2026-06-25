"use client";

import { Loader2, LockKeyhole, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Nao foi possivel entrar.");
      }

      showToast("success", "Login realizado.");
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Nao foi possivel entrar.";
      setError(message);
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white p-6 shadow-soft">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logos/mercado-livre-login.jpg"
            alt="Mercado Livre"
            width={170}
            height={170}
            priority
            className="h-32 w-32 rounded-md object-contain"
          />
          <div className="mt-4">
            <h1 className="text-xl font-bold text-slate-950">Promocoes Mercado Livre</h1>
            <p className="text-sm text-slate-500">Acesso interno administrativo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              required
              minLength={8}
            />
          </label>

          {error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <LockKeyhole aria-hidden="true" className="h-4 w-4" />
            )}
            Entrar
          </button>
        </form>

        <Link
          href="/register"
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
        >
          <UserPlus aria-hidden="true" className="h-4 w-4" />
          Registrar
        </Link>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
