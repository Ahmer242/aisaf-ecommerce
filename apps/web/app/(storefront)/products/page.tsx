import type { PaginatedProducts } from "@aisaf/shared";
import { apiRequest } from "@aisaf/shared";
import { ProductCard } from "@/components/product/product-card";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";

  let data: PaginatedProducts | null = null;
  let errorMessage: string | null = null;

  try {
    data = await apiRequest<PaginatedProducts>("/api/products", {
      query: { q, category, sort, limit: 24 },
    });
  } catch (err) {
    errorMessage =
      err instanceof Error ? err.message : "Unable to load products.";
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary">
        Shop
      </h1>
      <p className="mt-2 max-w-xl text-text-secondary">
        Browse by category, skin concern, or search — filters refine the
        catalog without leaving the page.
      </p>

      <form className="mt-8 flex flex-col gap-3 sm:flex-row" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products"
          className="w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-3 text-text-primary outline-none focus:border-accent"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-3 text-text-primary"
        >
          <option value="">All categories</option>
          <option value="skincare">Skincare</option>
          <option value="makeup">Makeup</option>
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-3 text-text-primary"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="rating">Rating</option>
        </select>
        <button
          type="submit"
          className="rounded-[var(--radius-md)] bg-accent px-5 py-3 font-medium text-text-inverse transition hover:bg-accent-dark"
        >
          Apply
        </button>
      </form>

      {errorMessage ? (
        <p className="mt-10 rounded-[var(--radius-md)] bg-primary-light px-4 py-6 text-text-secondary">
          {errorMessage} Start the API (`npm run dev:api`) and ensure Postgres
          is running.
        </p>
      ) : null}

      {data ? (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}

      {data && data.items.length === 0 ? (
        <p className="mt-10 text-text-secondary">No products match these filters.</p>
      ) : null}
    </main>
  );
}
