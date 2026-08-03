import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AISAF — Soft Color. Honest Formulas. Everyday Glow.",
  description:
    "A fast, mobile-first cosmetics store for skincare, makeup, haircare, and fragrances. Browse by skin type, get personalized recommendations, and shop with local or international payments.",
};

const CATEGORIES = [
  {
    name: "Skincare",
    description: "Gentle formulas for every skin type",
    slug: "skincare",
    emoji: "🌿",
    color: "from-[#fce8ea] to-[#f6c9ce]",
  },
  {
    name: "Makeup",
    description: "Soft shades that enhance your natural look",
    slug: "makeup",
    emoji: "💄",
    color: "from-[#fce8ea] to-[#e8a5ad]",
  },
  {
    name: "Haircare",
    description: "Nourishing treatments for healthy hair",
    slug: "haircare",
    emoji: "✨",
    color: "from-[#fce8ea] to-[#d9a566]",
  },
  {
    name: "Fragrance",
    description: "Soft, lasting scents for every mood",
    slug: "fragrance",
    emoji: "🌸",
    color: "from-[#f6c9ce] to-[#fce8ea]",
  },
];

const TRUST_ITEMS = [
  { icon: "🌿", title: "Clean Formulas", desc: "No parabens, no sulfates, ingredient-first approach." },
  { icon: "🚚", title: "Free Shipping", desc: "On orders over Rs. 3,000 across Pakistan." },
  { icon: "↩️", title: "Easy Returns", desc: "14-day hassle-free return on all items." },
  { icon: "🔒", title: "Secure Checkout", desc: "256-bit SSL. Stripe & local wallet payments." },
];

const FEATURED_PRODUCTS = [
  {
    id: "demo-1",
    name: "Rose Hydration Serum",
    price: 2450,
    brand: "AISAF",
    slug: "rose-hydration-serum",
    rating: 4.8,
    reviews: 124,
    tag: "Best Seller",
    tagColor: "bg-[#d9a566] text-white",
    bgColor: "bg-gradient-to-br from-[#fce8ea] to-[#f6c9ce]",
  },
  {
    id: "demo-2",
    name: "Velvet Matte Lipstick",
    price: 1250,
    brand: "AISAF",
    slug: "velvet-matte-lipstick",
    rating: 4.6,
    reviews: 89,
    tag: "New Arrival",
    tagColor: "bg-[#e8a5ad] text-white",
    bgColor: "bg-gradient-to-br from-[#fce8ea] to-[#fcb3bc]",
  },
  {
    id: "demo-3",
    name: "Gentle Foaming Cleanser",
    price: 1800,
    brand: "AISAF",
    slug: "gentle-foaming-cleanser",
    rating: 4.9,
    reviews: 201,
    tag: "Fan Favorite",
    tagColor: "bg-[#7fb69e] text-white",
    bgColor: "bg-gradient-to-br from-[#fce8ea] to-[#c5e4d6]",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-[var(--color-star)] text-xs">
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}
      {"☆".repeat(Math.floor(5 - rating))}
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% -10%, var(--color-primary-light), transparent 60%), linear-gradient(180deg, var(--color-bg) 0%, var(--color-primary-light) 100%)",
          }}
        />
        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-30 -z-10"
          style={{
            background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 -z-10"
          style={{
            background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text */}
            <div>
              <span className="inline-block rounded-full bg-primary-light border border-primary-dark/20 px-4 py-1.5 text-[length:var(--text-sm)] font-medium text-text-secondary mb-6">
                ✨ Soft. Clean. Everyday.
              </span>
              <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-3xl)] sm:text-[length:var(--text-3xl)] font-medium text-text-primary leading-[1.15]">
                Soft color.{" "}
                <span className="italic text-accent-dark">Honest</span>{" "}
                formulas.{" "}
                <br className="hidden sm:block" />
                Everyday glow.
              </h1>
              <p className="mt-6 max-w-lg text-[length:var(--text-base)] text-text-secondary leading-relaxed">
                Skincare and makeup chosen for skin-type match, clear ingredients, and a checkout that stays calm on mobile.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="rounded-[var(--radius-md)] bg-accent px-7 py-3.5 font-medium text-text-inverse shadow-[var(--shadow-sm)] transition hover:bg-accent-dark hover:shadow-[var(--shadow-md)] text-[length:var(--text-sm)]"
                >
                  Shop the catalog
                </Link>
                <Link
                  href="/register"
                  className="rounded-[var(--radius-md)] border border-primary-dark/40 bg-surface/80 px-7 py-3.5 font-medium text-text-primary transition hover:bg-primary-light text-[length:var(--text-sm)]"
                >
                  Create account
                </Link>
              </div>
              {/* Social proof */}
              <div className="mt-10 flex items-center gap-4 flex-wrap">
                <div className="flex -space-x-2">
                  {["A", "S", "M", "F"].map((l, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center text-xs font-semibold text-text-inverse"
                      style={{ background: `hsl(${340 + i * 15}, 60%, 75%)` }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[length:var(--text-sm)] font-medium text-text-primary">4.8 ★ rating</p>
                  <p className="text-[length:var(--text-xs)] text-text-secondary">from 500+ happy customers</p>
                </div>
              </div>
            </div>

            {/* Hero visual: floating product cards */}
            <div className="hidden lg:flex items-center justify-center relative h-[460px]">
              {/* Main card */}
              <div className="absolute top-8 left-8 w-52 rounded-[var(--radius-lg)] bg-gradient-to-br from-[#fce8ea] to-[#f6c9ce] p-6 shadow-[var(--shadow-lg)] rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                <div className="h-32 flex items-center justify-center text-5xl">🌹</div>
                <p className="mt-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Bestseller</p>
                <p className="text-sm font-medium text-text-primary">Rose Hydration Serum</p>
                <p className="mt-1 text-sm font-semibold text-accent-dark">Rs. 2,450</p>
              </div>
              <div className="absolute top-24 right-0 w-44 rounded-[var(--radius-lg)] bg-gradient-to-br from-[#fce8ea] to-[#e8c4cf] p-5 shadow-[var(--shadow-lg)] rotate-[4deg] hover:rotate-0 transition-transform duration-500">
                <div className="h-24 flex items-center justify-center text-4xl">💄</div>
                <p className="mt-3 text-xs text-text-secondary">New Arrival</p>
                <p className="text-sm font-medium text-text-primary">Velvet Matte Lipstick</p>
                <p className="mt-1 text-sm font-semibold text-accent-dark">Rs. 1,250</p>
              </div>
              <div className="absolute bottom-0 left-16 w-48 rounded-[var(--radius-lg)] bg-gradient-to-br from-[#fce8ea] to-[#c5e4d6] p-5 shadow-[var(--shadow-lg)] rotate-[2deg] hover:rotate-0 transition-transform duration-500">
                <div className="h-28 flex items-center justify-center text-4xl">🌿</div>
                <p className="mt-3 text-xs text-text-secondary">Fan Favorite</p>
                <p className="text-sm font-medium text-text-primary">Foaming Cleanser</p>
                <p className="mt-1 text-sm font-semibold text-accent-dark">Rs. 1,800</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-[length:var(--text-sm)] font-medium text-text-primary">{item.title}</p>
                  <p className="text-[length:var(--text-xs)] text-text-secondary leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary">
              Shop by Category
            </h2>
            <p className="mt-2 text-text-secondary text-[length:var(--text-sm)]">
              Everything skin needs — curated and simplified.
            </p>
          </div>
          <Link
            href="/products"
            className="text-[length:var(--text-sm)] font-medium text-accent-dark hover:underline underline-offset-2 transition shrink-0"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`group relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br ${cat.color} p-6 transition hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5`}
            >
              <div className="text-4xl mb-4">{cat.emoji}</div>
              <h3 className="font-[family-name:var(--font-heading)] text-[length:var(--text-lg)] font-medium text-text-primary">
                {cat.name}
              </h3>
              <p className="mt-1 text-[length:var(--text-xs)] text-text-secondary">{cat.description}</p>
              <div className="mt-3 text-[length:var(--text-xs)] font-medium text-accent-dark group-hover:underline underline-offset-2">
                Shop now →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-primary-light/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary">
                Community Favorites
              </h2>
              <p className="mt-2 text-text-secondary text-[length:var(--text-sm)]">
                Our most loved products, tried and tested by real customers.
              </p>
            </div>
            <Link
              href="/products"
              className="text-[length:var(--text-sm)] font-medium text-accent-dark hover:underline underline-offset-2 transition shrink-0"
            >
              See all products →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURED_PRODUCTS.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group block bg-surface rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition hover:-translate-y-1 overflow-hidden"
              >
                <div className={`relative h-52 ${p.bgColor} flex items-center justify-center`}>
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${p.tagColor}`}
                  >
                    {p.tag}
                  </span>
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {p.id === "demo-1" ? "🌹" : p.id === "demo-2" ? "💄" : "🌿"}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[length:var(--text-xs)] uppercase tracking-wide text-text-secondary">{p.brand}</p>
                  <h3 className="mt-1 text-[length:var(--text-base)] font-medium text-text-primary">{p.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating rating={p.rating} />
                    <span className="text-[length:var(--text-xs)] text-text-secondary">({p.reviews})</span>
                  </div>
                  <p className="mt-2 font-semibold text-accent-dark">Rs. {p.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="rounded-[var(--radius-lg)] bg-gradient-to-br from-primary-light to-[#fce8ea] border border-primary-dark/20 p-8 sm:p-12 text-center relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 60% 70% at 50% 50%, var(--color-primary), transparent)",
              opacity: 0.2,
            }}
          />
          <h2 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary">
            Join the AISAF community
          </h2>
          <p className="mt-3 max-w-md mx-auto text-text-secondary text-[length:var(--text-sm)]">
            Get early access to new arrivals, exclusive member discounts, and personalized skincare tips.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded-[var(--radius-md)] border border-border bg-surface/90 px-4 py-3 text-[length:var(--text-sm)] text-text-primary outline-none focus:border-accent"
            />
            <button
              type="button"
              className="rounded-[var(--radius-md)] bg-accent px-6 py-3 font-medium text-[length:var(--text-sm)] text-text-inverse transition hover:bg-accent-dark shrink-0"
            >
              Subscribe
            </button>
          </div>
          <p className="mt-3 text-[length:var(--text-xs)] text-text-secondary">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </main>
  );
}
