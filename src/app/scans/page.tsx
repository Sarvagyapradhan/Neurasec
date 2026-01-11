"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ScanRow = {
  id: number;
  type: string;
  input: string;
  result: string;
  score: number;
  createdAt: string;
};

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export default function ScansPage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login?returnUrl=%2Fscans");
  }, [isAuthenticated, loading, router]);

  const load = async (reset: boolean) => {
    if (fetching) return;
    setFetching(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "20");
      if (typeFilter) params.set("type", typeFilter);
      if (!reset && nextCursor) params.set("cursor", String(nextCursor));

      const resp = await fetch(`/api/scans?${params.toString()}`);
      const data = await resp.json();
      if (!resp.ok) return;

      const scans = (data?.scans ?? []) as ScanRow[];
      setRows(prev => (reset ? scans : [...prev, ...scans]));
      setNextCursor(data?.nextCursor ?? null);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setRows([]);
      setNextCursor(null);
      load(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, loading, isAuthenticated]);

  const displayRows = useMemo(() => {
    return rows.map(r => {
      const parsed = safeJsonParse(r.result);
      const verdict = parsed?.verdict || parsed?.verdict?.verdict || null;
      return {
        ...r,
        verdict: typeof verdict === "string" ? verdict : null,
        when: new Date(r.createdAt).toLocaleString(),
        riskPct: Math.round((r.score ?? 0) * 100),
      };
    });
  }, [rows]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Scan history</h1>
            <p className="text-slate-400">Your URL / email / file scan results.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={typeFilter === null ? "default" : "outline"}
              onClick={() => setTypeFilter(null)}
              className={typeFilter === null ? "" : "border-slate-700 text-slate-300"}
            >
              All
            </Button>
            <Button
              variant={typeFilter === "url" ? "default" : "outline"}
              onClick={() => setTypeFilter("url")}
              className={typeFilter === "url" ? "" : "border-slate-700 text-slate-300"}
            >
              URL
            </Button>
            <Button
              variant={typeFilter === "email" ? "default" : "outline"}
              onClick={() => setTypeFilter("email")}
              className={typeFilter === "email" ? "" : "border-slate-700 text-slate-300"}
            >
              Email
            </Button>
            <Button
              variant={typeFilter === "file" ? "default" : "outline"}
              onClick={() => setTypeFilter("file")}
              className={typeFilter === "file" ? "" : "border-slate-700 text-slate-300"}
            >
              File
            </Button>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-100">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayRows.length === 0 ? (
              <div className="text-slate-400">{fetching ? "Loading…" : "No scans found."}</div>
            ) : (
              displayRows.map(r => (
                <div
                  key={r.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/30 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {r.type.toUpperCase()}
                      </Badge>
                      {r.verdict ? (
                        <Badge variant="outline" className="border-slate-700 text-slate-300">
                          {String(r.verdict)}
                        </Badge>
                      ) : null}
                      <span className="text-xs text-slate-500">{r.when}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-300 break-all overflow-hidden">
                      {r.input.length > 180 ? `${r.input.slice(0, 180)}…` : r.input}
                    </div>
                  </div>
                  <div className="text-sm text-slate-200 sm:whitespace-nowrap self-end sm:self-auto">
                    Risk <span className="text-white font-medium">{r.riskPct}%</span>
                  </div>
                </div>
              ))
            )}

            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300"
                disabled={fetching || !nextCursor}
                onClick={() => load(false)}
              >
                {fetching ? "Loading…" : nextCursor ? "Load more" : "No more results"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

