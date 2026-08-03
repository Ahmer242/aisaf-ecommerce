import Image from "next/image";
import Link from "next/link";
import type { ProductListItem } from "@aisaf/shared";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function ProductCard({ product }: { product: ProductListItem }) {
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-t-[var(--radius-md)] transition"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[var(--radius-md)] bg-primary-light">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="rounded-b-[var(--radius-md)] bg-surface px-1 pt-3 shadow-[var(--shadow-sm)] transition group-hover:shadow-[var(--shadow-md)]">
        <p className="text-[length:var(--text-xs)] uppercase tracking-wide text-text-secondary">
          {product.brand ?? product.category?.name}
        </p>
        <h2 className="mt-1 text-[length:var(--text-lg)] text-text-primary">
          {product.name}
        </h2>
        <p className="mt-1 font-semibold text-accent-dark">
          {formatPrice(product.price)}
        </p>
        {product.averageRating != null ? (
          <p className="mt-1 text-[length:var(--text-sm)] text-text-secondary">
            ★ {product.averageRating.toFixed(1)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
