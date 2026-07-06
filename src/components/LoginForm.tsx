"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/Animated";

export function LoginForm() {
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <FadeIn direction="down">
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex animate-marquee items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-5 py-1.5 shadow-lg shadow-gold/10">
            <span className="text-gold">★</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-gold/90">
              Champions of Champions
            </span>
            <span className="text-gold">★</span>
          </div>
          <h1 className="font-display text-4xl font-bold md:text-5xl">
            <span className="gold-gradient-text">Be The Champion</span>
          </h1>
          <p className="mt-3 text-cream/55">Enter your employee ID to enter the spotlight</p>
        </div>
      </FadeIn>

      <FadeIn delay={150}>
        <Card glow className="p-8">
          <form onSubmit={handleSubmit}>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gold/80">
              Employee ID
            </label>
            <Input
              id="employeeId"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              placeholder="e.g. EMP001"
              required
              className="mt-2 text-lg"
            />

            {error && (
              <p className="mt-3 animate-fade-in rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !employeeId.trim()}
              className="mt-6 w-full"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-maroon border-t-transparent" />
                  Validating...
                </span>
              ) : (
                "Enter the Spotlight ✦"
              )}
            </Button>
          </form>
        </Card>
      </FadeIn>

      <FadeIn delay={300}>
        <p className="mt-8 text-center text-xs tracking-wide text-cream/35">
          Own the spotlight · Participate &amp; win exciting prizes
        </p>
      </FadeIn>
    </div>
  );
}
