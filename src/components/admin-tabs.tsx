"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/shipments", label: "Shipments" },
  { href: "/admin/pickups", label: "Pickups" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={[
              "whitespace-nowrap rounded-xl px-3 py-2 text-sm transition",
              active ? "glass-strong text-white" : "glass text-zinc-200/75 hover:text-white",
            ].join(" ")}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}