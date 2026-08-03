import { SiteHeader } from "@/components/ui/site-header";
import Link from "next/link";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <p className="font-[family-name:var(--font-heading)] text-[length:var(--text-xl)] text-text-primary">
                AISAF
              </p>
              <p className="mt-3 text-[length:var(--text-sm)] text-text-secondary leading-relaxed">
                Soft color. Honest formulas. Everyday glow. A cosmetics store designed for real skin.
              </p>
            </div>

            {/* Shop Links */}
            <div>
              <p className="text-[length:var(--text-sm)] font-medium text-text-primary mb-4">Shop</p>
              <ul className="space-y-2.5">
                {[
                  { label: "All Products", href: "/products" },
                  { label: "Skincare", href: "/products?category=skincare" },
                  { label: "Makeup", href: "/products?category=makeup" },
                  { label: "Haircare", href: "/products?category=haircare" },
                  { label: "Fragrance", href: "/products?category=fragrance" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[length:var(--text-sm)] text-text-secondary hover:text-accent-dark transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account Links */}
            <div>
              <p className="text-[length:var(--text-sm)] font-medium text-text-primary mb-4">Account</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Sign In", href: "/login" },
                  { label: "Create Account", href: "/register" },
                  { label: "My Orders", href: "/account/orders" },
                  { label: "My Profile", href: "/account/profile" },
                  { label: "Wishlist", href: "/wishlist" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[length:var(--text-sm)] text-text-secondary hover:text-accent-dark transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info Links */}
            <div>
              <p className="text-[length:var(--text-sm)] font-medium text-text-primary mb-4">Info</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Cart", href: "/cart" },
                  { label: "Checkout", href: "/checkout" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[length:var(--text-sm)] text-text-secondary hover:text-accent-dark transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[length:var(--text-xs)] text-text-secondary">
              © {new Date().getFullYear()} AISAF. All rights reserved.
            </p>
            <p className="text-[length:var(--text-xs)] text-text-secondary">
              Made with 🌸 in Pakistan · Stripe & local wallet payments accepted
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
