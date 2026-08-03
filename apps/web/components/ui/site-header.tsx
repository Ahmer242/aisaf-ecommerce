"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

export function SiteHeader() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Zustand stores – only read on client
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur transition-shadow ${
        scrolled ? "shadow-[var(--shadow-md)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-[length:var(--text-xl)] text-text-primary transition hover:text-accent-dark shrink-0"
        >
          AISAF
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-[length:var(--text-sm)] text-text-secondary">
          <Link href="/products" className="transition hover:text-text-primary">
            Shop
          </Link>
          <Link href="/products?category=skincare" className="transition hover:text-text-primary">
            Skincare
          </Link>
          <Link href="/products?category=makeup" className="transition hover:text-text-primary">
            Makeup
          </Link>
          <Link href="/products?category=haircare" className="transition hover:text-text-primary">
            Haircare
          </Link>
        </nav>

        {/* Right side icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative p-2 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-primary-light transition"
            aria-label="Wishlist"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-primary-light transition"
            aria-label="Cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Auth - desktop */}
          <div className="hidden md:flex items-center gap-3 text-[length:var(--text-sm)]">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/account/orders"
                  className="text-text-secondary transition hover:text-text-primary"
                >
                  {session.user?.name?.split(" ")[0] ?? "Account"}
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-text-secondary transition hover:text-text-primary"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-text-secondary transition hover:text-text-primary">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-[var(--radius-md)] bg-accent px-4 py-2 font-medium text-text-inverse transition hover:bg-accent-dark"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-primary-light transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-1">
          <Link
            href="/products"
            className="block px-3 py-2.5 rounded-[var(--radius-sm)] text-[length:var(--text-sm)] text-text-primary hover:bg-primary-light transition"
            onClick={() => setMenuOpen(false)}
          >
            Shop All
          </Link>
          <Link
            href="/products?category=skincare"
            className="block px-3 py-2.5 rounded-[var(--radius-sm)] text-[length:var(--text-sm)] text-text-secondary hover:bg-primary-light hover:text-text-primary transition"
            onClick={() => setMenuOpen(false)}
          >
            Skincare
          </Link>
          <Link
            href="/products?category=makeup"
            className="block px-3 py-2.5 rounded-[var(--radius-sm)] text-[length:var(--text-sm)] text-text-secondary hover:bg-primary-light hover:text-text-primary transition"
            onClick={() => setMenuOpen(false)}
          >
            Makeup
          </Link>
          <Link
            href="/products?category=haircare"
            className="block px-3 py-2.5 rounded-[var(--radius-sm)] text-[length:var(--text-sm)] text-text-secondary hover:bg-primary-light hover:text-text-primary transition"
            onClick={() => setMenuOpen(false)}
          >
            Haircare
          </Link>
          <div className="border-t border-border pt-3 mt-2 space-y-1">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/account/orders"
                  className="block px-3 py-2.5 rounded-[var(--radius-sm)] text-[length:var(--text-sm)] text-text-secondary hover:bg-primary-light hover:text-text-primary transition"
                  onClick={() => setMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="w-full text-left px-3 py-2.5 rounded-[var(--radius-sm)] text-[length:var(--text-sm)] text-text-secondary hover:bg-primary-light hover:text-text-primary transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2.5 rounded-[var(--radius-sm)] text-[length:var(--text-sm)] text-text-secondary hover:bg-primary-light hover:text-text-primary transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block mt-2 text-center rounded-[var(--radius-md)] bg-accent px-4 py-2.5 font-medium text-[length:var(--text-sm)] text-text-inverse transition hover:bg-accent-dark"
                  onClick={() => setMenuOpen(false)}
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
