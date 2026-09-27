"use client";

import { Navbar } from "@/components/navbar";
import UrlCheckHistoryList from "@/components/UrlCheckHistoryList";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Clock } from "lucide-react";

export default function HistoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/history');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />

      {/* Page Header Banner */}
      <div
        className="border-b px-4 py-10"
        style={{
          borderColor: 'var(--border)',
          background: 'linear-gradient(135deg, var(--card) 0%, var(--background) 100%)',
        }}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="p-2 rounded-xl"
              style={{ background: 'var(--primary)', opacity: 0.9 }}
            >
              <Clock className="h-5 w-5" style={{ color: 'var(--primary-foreground)' }} />
            </div>
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              Scan History
            </h1>
          </div>
          <p className="mt-2 text-sm ml-1" style={{ color: 'var(--muted-foreground)' }}>
            All URLs you have checked — your complete security audit trail
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto max-w-4xl py-8 px-4">
        <UrlCheckHistoryList />
      </main>
    </div>
  );
}
