"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { loginSchema } from "@aisaf/shared";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid details.");
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        ...parsed.data,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/products");
      router.refresh();
    });
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary">
        Welcome back
      </h1>
      <p className="mt-2 text-text-secondary">Sign in to track orders and save favorites.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-[length:var(--text-sm)] text-text-secondary">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-accent"
          />
        </label>
        <label className="block text-[length:var(--text-sm)] text-text-secondary">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-accent"
          />
        </label>
        {error ? <p className="text-[length:var(--text-sm)] text-error">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[var(--radius-md)] bg-accent py-3 font-medium text-text-inverse transition hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-[length:var(--text-sm)] text-text-secondary">
        New here?{" "}
        <Link href="/register" className="text-accent-dark underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
