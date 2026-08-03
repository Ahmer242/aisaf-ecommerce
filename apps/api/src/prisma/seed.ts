import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aisaf.local" },
    update: {},
    create: {
      email: "admin@aisaf.local",
      name: "AISAF Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@aisaf.local" },
    update: {},
    create: {
      email: "customer@aisaf.local",
      name: "Sara Khan",
      role: "CUSTOMER",
      passwordHash,
    },
  });

  const skincare = await prisma.category.upsert({
    where: { slug: "skincare" },
    update: {},
    create: { name: "Skincare", slug: "skincare" },
  });

  const makeup = await prisma.category.upsert({
    where: { slug: "makeup" },
    update: {},
    create: { name: "Makeup", slug: "makeup" },
  });

  const drySkin = await prisma.tag.upsert({
    where: { slug: "dry-skin" },
    update: {},
    create: { name: "Dry Skin", slug: "dry-skin" },
  });

  const hydrating = await prisma.tag.upsert({
    where: { slug: "hydrating" },
    update: {},
    create: { name: "Hydrating", slug: "hydrating" },
  });

  const glowSerum = await prisma.product.upsert({
    where: { slug: "glow-vitamin-c-serum" },
    update: {},
    create: {
      name: "Glow Vitamin C Serum",
      slug: "glow-vitamin-c-serum",
      description:
        "A lightweight vitamin C serum that brightens dull skin and supports an even tone. Layer under moisturizer morning and night.",
      ingredients: "Ascorbic Acid, Hyaluronic Acid, Vitamin E, Aloe Vera",
      price: 3499,
      compareAtPrice: 4299,
      brand: "AISAF Lab",
      categoryId: skincare.id,
      images: [
        "https://images.unsplash.com/photo-1620916565917-35dd4046b2b6?w=800&q=80",
      ],
      isActive: true,
      tags: {
        create: [{ tagId: drySkin.id }, { tagId: hydrating.id }],
      },
      variants: {
        create: [
          {
            attribute: "SIZE",
            value: "30ml",
            sku: "AISAF-VITC-30",
            stock: 40,
          },
          {
            attribute: "SIZE",
            value: "50ml",
            sku: "AISAF-VITC-50",
            stock: 18,
            priceOverride: 4999,
          },
        ],
      },
    },
  });

  const roseLip = await prisma.product.upsert({
    where: { slug: "soft-rose-lip-tint" },
    update: {},
    create: {
      name: "Soft Rose Lip Tint",
      slug: "soft-rose-lip-tint",
      description:
        "A buildable rose-gold lip tint with a soft satin finish. Comfortable wear for everyday color.",
      ingredients: "Ricinus Communis Seed Oil, Caprylic Triglyceride, Tocopherol",
      price: 1899,
      brand: "AISAF Color",
      categoryId: makeup.id,
      images: [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80",
      ],
      isActive: true,
      variants: {
        create: [
          {
            attribute: "SHADE",
            value: "Blush Pink",
            sku: "AISAF-LIP-BLUSH",
            stock: 55,
          },
          {
            attribute: "SHADE",
            value: "Rose Nude",
            sku: "AISAF-LIP-NUDE",
            stock: 32,
          },
        ],
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seeded:", {
    admin: admin.email,
    customer: customer.email,
    products: [glowSerum.slug, roseLip.slug],
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
