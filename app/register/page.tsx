"use client";

import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          registrationCode
        })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Nao foi possivel criar o cadastro.");
      }

      showToast("success", "Cadastro criado.");
      router.push("/dashboard");
      router.refresh();
    } catch (registerError) {
      const message =
        registerError instanceof Error ? registerError.message : "Nao foi possivel criar o cadastro.";
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
            className="h-28 w-28 rounded-md object-contain"
          />
          <div className="mt-4">
            <h1 className="text-xl font-bold text-slate-950">Criar cadastro</h1>
            <p className="text-sm text-slate-500">
              Informe o codigo de registro para liberar o acesso.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Codigo de registro</span>
            <input
              type="password"
              autoComplete="one-time-code"
              value={registrationCode}
              onChange={(event) => setRegistrationCode(event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Nome</span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              required
            />
          </label>

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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
              minLength={8}
              required
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
              <UserPlus aria-hidden="true" className="h-4 w-4" />
            )}
            Registrar
          </button>
        </form>

        <Link
          href="/login"
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar para login
        </Link>
      </section>
    </main>
  );
}
