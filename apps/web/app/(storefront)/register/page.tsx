"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { apiRequest, registerSchema } from "@aisaf/shared";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      name: form.get("name") || undefined,
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid details.");
      return;
    }

    startTransition(async () => {
      try {
        await apiRequest("/api/auth/register", {
          method: "POST",
          body: parsed.data,
        });
        const result = await signIn("credentials", {
          email: parsed.data.email,
          password: parsed.data.password,
          redirect: false,
        });
        if (result?.error) {
          setError("Account created, but sign-in failed. Try logging in.");
          return;
        }
        router.push("/products");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed.");
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary">
        Join AISAF
      </h1>
      <p className="mt-2 text-text-secondary">
        Create an account for order history and faster checkout later.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-[length:var(--text-sm)] text-text-secondary">
          Name
          <input
            name="name"
            type="text"
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-accent"
          />
        </label>
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
            minLength={8}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-accent"
          />
        </label>
        {error ? <p className="text-[length:var(--text-sm)] text-error">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[var(--radius-md)] bg-accent py-3 font-medium text-text-inverse transition hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-[length:var(--text-sm)] text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-dark underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
