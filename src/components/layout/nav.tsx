import Link from "next/link";

const items = [
  { href: "/", label: "Dashboard" },
  { href: "/predios", label: "Prédios" },
  { href: "/periodos", label: "Períodos" },
  { href: "/designacoes", label: "Designações" },
  { href: "/importar", label: "Importar" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/configuracoes", label: "Configurações" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="text-base font-semibold leading-tight text-slate-950 sm:text-lg">
          Território de Prédios e Vilas
        </Link>
        <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0 lg:justify-end">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
