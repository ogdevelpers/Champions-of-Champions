"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/Animated";

export function LoginForm() {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ employeeId, name, email }),
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

  const isValid = employeeId.trim() && name.trim() && email.trim();

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
          <p className="text-body mt-3">
            Enter your details to validate your employee ID and join the spotlight
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={150}>
        <Card glow className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="employeeId" className="text-label block text-sm font-semibold">
                Employee ID
              </label>
              <Input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                placeholder="e.g. EMP001"
                required
                className="mt-2"
              />
            </div>

            <div>
              <label htmlFor="name" className="text-label block text-sm font-semibold">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="mt-2"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-label block text-sm font-semibold">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="mt-2"
              />
            </div>

            {error && (
              <p className="animate-fade-in rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !isValid}
              className="mt-2 w-full"
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
        <p className="text-muted mt-8 text-center text-xs tracking-wide">
          Own the spotlight · Participate &amp; win exciting prizes
        </p>
      </FadeIn>
    </div>
  );
}
