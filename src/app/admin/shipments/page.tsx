"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomLoader } from "@/components/custom-loader";
import { AdminTabs } from "@/components/admin-tabs";

type ShipmentRow = {
  tracking_id: string;
  current_status: string;
  eta: string | null;
  created_at: string;
  pickup_address: string | null;
  dropoff_address: string | null;
};

export const dynamic = "force-dynamic";

export default function AdminShipmentsPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/list-shipments?q=${encodeURIComponent(q)}&limit=25`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setItems(json.items || []);
    } catch (e: any) {
      setErr(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Admin</h1>
          <p className="mt-1 text-sm text-zinc-200/70">Browse and search shipments.</p>
          <AdminTabs />
        </div>
      </div>

      <Card className="mt-5 glass glow-ring rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Shipments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              className="bg-white/5 border-white/10"
              placeholder="Search tracking ID (e.g. PP-AB12CD)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? load() : null)}
            />
            <Button className="rounded-xl bg-white text-black hover:bg-zinc-200" onClick={load} disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </Button>
          </div>

          {loading ? (
            <div className="glass rounded-2xl p-4">
              <CustomLoader label="Loading shipments" />
            </div>
          ) : null}

          {err ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {err}
            </div>
          ) : null}

          <div className="grid gap-3">
            {items.map((s) => (
              <div key={s.tracking_id} className="glass rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{s.tracking_id}</p>
                  <Badge className="glass-strong text-zinc-100 hover:bg-white/10">
                    {s.current_status}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-zinc-200/70">ETA: {s.eta || "TBD"}</p>
                <p className="mt-2 text-xs text-zinc-200/60">
                  {s.pickup_address || "—"} → {s.dropoff_address || "—"}
                </p>
                <p className="mt-2 text-[11px] text-zinc-200/50">
                  Created: {new Date(s.created_at).toLocaleString()}
                </p>
              </div>
            ))}

            {!loading && items.length === 0 ? (
              <div className="glass rounded-2xl p-4 text-sm text-zinc-200/70">
                No shipments found.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}