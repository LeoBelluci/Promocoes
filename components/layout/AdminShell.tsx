"use client";

import {
  AlertTriangle,
  CalendarClock,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Store,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { stores } from "@/lib/stores";
import type { AuthUser } from "@/types/auth";
import { useToast } from "@/components/ui/ToastProvider";

interface AdminShellProps {
  user: AuthUser;
  children: ReactNode;
}

const quickLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/products/new", label: "Criar produto", icon: PlusCircle },
  { href: "/dashboard?ending_next_3_days=true", label: "Terminando em breve", icon: CalendarClock },
  { href: "/dashboard?expired=true", label: "Expiradas", icon: AlertTriangle }
];

function isActive(pathname: string, href: string) {
  const hrefPath = href.split("?")[0];
  return pathname === hrefPath || (hrefPath !== "/dashboard" && pathname.startsWith(hrefPath));
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("success", "Logout realizado.");
      router.push("/login");
      router.refresh();
    } catch {
      showToast("error", "Nao foi possivel sair agora.");
    } finally {
      setLoggingOut(false);
    }
  }

  const navigation = (
    <nav className="flex flex-1 flex-col gap-6">
      <div className="space-y-2">
        <p className="px-3 text-xs font-semibold uppercase text-slate-400">Geral</p>
        {quickLinks.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={[
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition",
                active
                  ? "bg-yellow-100 text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              ].join(" ")}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-2">
        <p className="px-3 text-xs font-semibold uppercase text-slate-400">Lojas</p>
        {stores.map((store) => {
          const active = pathname.startsWith(store.route);

          return (
            <Link
              key={store.id}
              href={store.route}
              onClick={() => setMobileOpen(false)}
              className={[
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              ].join(" ")}
            >
              <Store aria-hidden="true" className="h-4 w-4" />
              <span className="truncate">{store.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white p-4 lg:flex lg:flex-col">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-lg bg-slate-950 px-3 py-3">
          <span className="flex h-12 w-20 items-center justify-center rounded-md bg-black">
            <Image
              src="/logos/bononi-system.png"
              alt="Bononi Acessorios"
              width={120}
              height={64}
              priority
              className="max-h-10 w-auto object-contain"
            />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black text-white">Bononi Promocoes</span>
            <span className="block text-xs font-medium text-slate-300">Admin interno</span>
          </span>
        </Link>
        {navigation}
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-950">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <p className="mt-1 text-xs font-semibold uppercase text-slate-400">{user.role}</p>
          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-md bg-slate-950 px-2 py-1.5 text-sm font-black text-white">
            <Image
              src="/logos/bononi-system.png"
              alt="Bononi Acessorios"
              width={84}
              height={40}
              className="h-8 w-auto object-contain"
            />
            <span className="sr-only">Bononi Promocoes</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700"
            aria-label="Abrir menu"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white p-4 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-black text-slate-950">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                aria-label="Fechar menu"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            {navigation}
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      ) : null}

      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
