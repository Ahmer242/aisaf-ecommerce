import Image from "next/image";
import { notFound } from "next/navigation";
import type { ProductDetail } from "@aisaf/shared";
import { apiRequest, ApiClientError } from "@aisaf/shared";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

type Params = Promise<{ slug: string }>;

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  let product: ProductDetail;
  try {
    product = await apiRequest<ProductDetail>(`/api/products/${slug}`);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 404) notFound();
    throw err;
  }

  const image = product.images[0];
  const defaultVariant = product.variants[0];

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-primary-light shadow-[var(--shadow-md)]">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div>
        <p className="text-[length:var(--text-sm)] uppercase tracking-wide text-text-secondary">
          {product.brand ?? product.category?.name}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary">
          {product.name}
        </h1>
        <p className="mt-3 text-[length:var(--text-xl)] font-semibold text-accent-dark">
          {formatPrice(product.price)}
          {product.compareAtPrice ? (
            <span className="ml-3 text-[length:var(--text-base)] font-normal text-text-secondary line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </p>

        <p className="mt-6 text-text-secondary">{product.description}</p>

        {product.ingredients ? (
          <div className="mt-6">
            <h2 className="text-[length:var(--text-sm)] font-medium text-text-primary">
              Ingredients
            </h2>
            <p className="mt-2 text-[length:var(--text-sm)] text-text-secondary">
              {product.ingredients}
            </p>
          </div>
        ) : null}

        {product.tags.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <li
                key={tag.id}
                className="rounded-[var(--radius-full)] bg-primary-light px-3 py-1 text-[length:var(--text-xs)] text-text-primary"
              >
                {tag.name}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8">
          <h2 className="text-[length:var(--text-sm)] font-medium text-text-primary">
            Options
          </h2>
          <ul className="mt-3 space-y-2 text-[length:var(--text-sm)] text-text-secondary">
            {product.variants.map((variant) => (
              <li key={variant.id}>
                {variant.attribute.toLowerCase()}: {variant.value} —{" "}
                {variant.stock > 0 ? `${variant.stock} in stock` : "Out of stock"}
                {variant.priceOverride != null
                  ? ` · ${formatPrice(variant.priceOverride)}`
                  : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <AddToCartButton
            variantId={defaultVariant?.id}
            disabled={!defaultVariant || defaultVariant.stock < 1}
          />
          <p className="mt-3 text-[length:var(--text-xs)] text-text-secondary">
            Cart checkout lands in Phase 2 — selection is stored locally for now.
          </p>
        </div>
      </div>
    </main>
  );
}
